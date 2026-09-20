import cv2
import threading
import time
import logging
from datetime import datetime
from ultralytics import YOLO
import requests

logger = logging.getLogger(__name__)


class CameraProcessor(threading.Thread):
    def __init__(self, camera_id: str, rtsp_url: str, location_name: str, location_id: int, model_path: str = "models/best.pt"):
        super().__init__()
        self.camera_id     = camera_id
        self.rtsp_url      = rtsp_url
        self.location_name = location_name
        self.location_id   = location_id
        self.daemon        = True

        logger.info(f"[{camera_id}] Loading model {model_path}...")
        self.model = YOLO(model_path)
        logger.info(f"[{camera_id}] Model loaded")

        self.running      = True
        self.is_connected = False          # STATUS KONEKSI CCTV
        self.error_message = None          # PESAN ERROR JIKA GAGAL
        self.reconnect_attempts = 0        # JUMLAH PERCOBAAN KONEKSI
        self.people_count = 0
        self.crowd_level  = "Rendah"
        self.last_update  = datetime.now()
        self._lock        = threading.Lock()

        self._frame_count = 0
        self._fps         = 0
        self._fps_frame   = 0
        self._fps_time    = time.time()
        
        self.conf_threshold = 0.20  
        self.iou_threshold = 0.45
        self.frame_skip = 1 
        self.imgsz = 640

    # ── Public API ────────────────────────────────────

    def stop(self):
        self.running = False

    def get_count(self) -> int:
        with self._lock:
            return self.people_count

    def get_crowd_level(self) -> str:
        with self._lock:
            return self.crowd_level

    def get_status(self) -> dict:
        with self._lock:
            return {
                "camera_id"     : self.camera_id,
                "location"      : self.location_name,
                "location_id"   : self.location_id,
                "people_count"  : self.people_count,
                "crowd_level"   : self.crowd_level,
                "is_connected"  : self.is_connected,
                "error_message" : self.error_message,
                "last_update"   : self.last_update.isoformat(),
                "fps"           : self._fps,
                "running"       : self.running,
                "conf_threshold": self.conf_threshold,
            }

    # ── Klasifikasi dan komunikasi ────────────────────────────

    def classify_crowd_level(self, count: int) -> str:
        if count <= 10:
            return "Rendah"
        elif count <= 25:
            return "Sedang"
        else:
            return "Tinggi"

    def send_to_location_service(self, count: int, level: str):
        if self.location_id is None:
            return

        try:
            response = requests.put(
                f"http://localhost:3002/api/locations/{self.location_id}/crowd",
                json={
                    "count": count,
                    "level": level,
                    "timestamp": datetime.now().isoformat()
                },
                timeout=2
            )
            if response.status_code not in [200, 201]:
                logger.warning(f"[{self.camera_id}] Failed to update: {response.status_code}")
        except Exception as e:
            logger.debug(f"[{self.camera_id}] Location service error: {e}")

    def send_cctv_status(self, is_active: bool, error_msg: str = None):
        """Kirim status CCTV ke location service"""
        if self.location_id is None:
            return
        
        try:
            response = requests.put(
                f"http://localhost:3002/api/locations/{self.location_id}/cctv-status",
                json={
                    "is_active": is_active,
                    "error_message": error_msg,
                    "timestamp": datetime.now().isoformat()
                },
                timeout=2
            )
            if response.status_code not in [200, 201]:
                logger.warning(f"[{self.camera_id}] Failed to send CCTV status: {response.status_code}")
        except Exception as e:
            logger.debug(f"[{self.camera_id}] Cannot send CCTV status: {e}")

    # ── Stream connection dengan error handling ───────────────

    def _open_stream_with_error_check(self):
        """Buka stream dengan deteksi error"""
        self.reconnect_attempts += 1
        
        try:
            logger.info(f"[{self.camera_id}] Connecting to RTSP... (attempt {self.reconnect_attempts})")
            
            cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            if not cap.isOpened():
                error_msg = f"Failed to open RTSP stream (attempt {self.reconnect_attempts})"
                logger.error(f"[{self.camera_id}] {error_msg}")
                
                # Cek apakah error karena 404 atau timeout
                if "404" in str(self.rtsp_url) or "Not Found" in str(self.rtsp_url):
                    error_msg = "RTSP 404 Not Found - Stream tidak ditemukan"
                else:
                    error_msg = "Connection timeout - CCTV mungkin offline"
                
                self.is_connected = False
                self.error_message = error_msg
                self.send_cctv_status(False, error_msg)
                
                cap.release()
                return None
            
            # Koneksi berhasil
            self.is_connected = True
            self.error_message = None
            self.reconnect_attempts = 0
            self.send_cctv_status(True, None)
            
            return cap
            
        except Exception as e:
            error_msg = f"RTSP Error: {str(e)}"
            logger.error(f"[{self.camera_id}] {error_msg}")
            self.is_connected = False
            self.error_message = error_msg
            self.send_cctv_status(False, error_msg)
            return None

    # ── Thread loop ───────────────────────────────────────────

    def run(self):
        cap = self._open_stream_with_error_check()
        if cap is None:
            logger.error(f"[{self.camera_id}] Gagal membuka stream setelah percobaan.")
            return

        logger.info(f"[{self.camera_id}] [{self.location_name}] Connected - Camera ACTIVE")
        
        consecutive_errors = 0
        max_consecutive_errors = 10

        while self.running:
            ret, frame = cap.read()

            if not ret:
                consecutive_errors += 1
                logger.warning(f"[{self.camera_id}] Frame error ({consecutive_errors}/{max_consecutive_errors}), reconnecting...")
                
                if consecutive_errors >= max_consecutive_errors:
                    self.is_connected = False
                    self.error_message = "Stream timeout - CCTV mengalami gangguan"
                    self.send_cctv_status(False, self.error_message)
                    
                    cap.release()
                    time.sleep(5)
                    cap = self._open_stream_with_error_check()
                    if cap is None:
                        logger.error(f"[{self.camera_id}] Reconnection failed")
                        break
                    consecutive_errors = 0
                    logger.info(f"[{self.camera_id}] Reconnected successfully")
                
                continue
            else:
                consecutive_errors = 0
                if not self.is_connected:
                    self.is_connected = True
                    self.error_message = None
                    self.send_cctv_status(True, None)
                    logger.info(f"[{self.camera_id}] Camera back ONLINE")

            self._frame_count += 1
            self._update_fps()

            # Skip frame
            if self._frame_count % self.frame_skip != 0:
                continue

            # Inference YOLO
            try:
                results = self.model.predict(
                    source=frame,
                    conf=self.conf_threshold,
                    iou=self.iou_threshold,
                    classes=[0],
                    verbose=False,
                    imgsz=self.imgsz,
                )

                count = 0
                if results and results[0].boxes is not None:
                    count = len(results[0].boxes)

                level = self.classify_crowd_level(count)

                with self._lock:
                    self.people_count = count
                    self.crowd_level = level
                    self.last_update = datetime.now()

                # Kirim ke location service setiap 30 frame (≈6 detik)
                if self._frame_count % 30 == 0:
                    self.send_to_location_service(count, level)

                if self._frame_count % 150 == 0:
                    logger.info(f"[{self.camera_id}] {self.location_name}: {count} orang ({level}) @ {self._fps}fps")
                    
            except Exception as e:
                logger.error(f"[{self.camera_id}] Inference error: {e}")
                self.is_connected = False
                self.error_message = f"Inference error: {str(e)}"
                self.send_cctv_status(False, self.error_message)

        cap.release()
        logger.info(f"[{self.camera_id}] Thread selesai")

    # ── Helpers ───────────────────────────────────────────────

    def _update_fps(self):
        self._fps_frame += 1
        now = time.time()
        if now - self._fps_time >= 1.0:
            self._fps = round(self._fps_frame / (now - self._fps_time))
            self._fps_frame = 0
            self._fps_time = now