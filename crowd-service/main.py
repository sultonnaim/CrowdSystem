from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn
import os
import logging
import requests
from datetime import datetime
from typing import Dict

from camera_processor import CameraProcessor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────
MODEL_PATH = "models/best.pt"
CONFIG_FILE = "urls.json"
LOCATION_SERVICE_URL = "http://localhost:3002"
location_id_map: Dict[str, int] = {}

# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title="Crowd Counting Service",
    description="Deteksi kerumunan menggunakan YOLOv11",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── State ─────────────────────────────────────────────────────
active_cameras: Dict[str, CameraProcessor] = {}

# Load urls.json
if not os.path.exists(CONFIG_FILE):
    logger.error(f" {CONFIG_FILE} tidak ditemukan!")
    CAMERA_CONFIG = {}
else:
    with open(CONFIG_FILE, "r") as f:
        CAMERA_CONFIG = json.load(f)
    logger.info(f" Loaded {sum(len(v) for v in CAMERA_CONFIG.values())} kamera dari {CONFIG_FILE}")


# ── Helper functions ────────────────────────────────────────────

def fetch_location_mapping():
    """Ambil mapping nama taman ke ID dari location service"""
    global location_id_map
    
    try:
        response = requests.get(
            f"{LOCATION_SERVICE_URL}/api/locations",
            timeout=3
        )
        
        if response.status_code == 200:
            data = response.json()
            locations = data.get("data", [])
            
            location_id_map = {}
            
            for loc in locations:
                key = loc["name"].lower().replace(" ", "_")
                location_id_map[key] = loc["id"]
            
            logger.info(f"Fetched {len(location_id_map)} location mappings from location service")
            return True
        else:
            logger.warning(f"Failed to fetch locations: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        logger.warning("Cannot connect to location service. Running without location updates.")
        return False
    except Exception as e:
        logger.error(f"Error fetching locations: {e}")
        return False


def get_location_id(location_name: str) -> int:
    """Dapatkan location ID dari nama taman"""
    key = location_name.lower().replace(" ", "_")
    return location_id_map.get(key, None)


def send_cctv_status_to_location(location_id: int, is_active: bool, error_message: str = None):
    """Kirim status CCTV ke location service"""
    if location_id is None:
        return
    
    try:
        response = requests.put(
            f"{LOCATION_SERVICE_URL}/api/locations/{location_id}/cctv-status",
            json={
                "is_active": is_active,
                "error_message": error_message,
                "timestamp": datetime.now().isoformat()
            },
            timeout=2
        )
        if response.status_code != 200:
            logger.warning(f"Failed to send CCTV status for location {location_id}: {response.status_code}")
    except Exception as e:
        logger.debug(f"Error sending CCTV status: {e}")


# ── Lifecycle ─────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    logger.info("  Crowd Counting — YOLOv11")

    if not os.path.exists(MODEL_PATH):
        logger.error(f" Model tidak ditemukan: {MODEL_PATH}")
        return

    # Fetch location mapping dari location service
    fetch_location_mapping()

    if not CAMERA_CONFIG:
        logger.warning("  Tidak ada konfigurasi kamera.")
        return

    cam_counter = 0
    for location, streams in CAMERA_CONFIG.items():
        location_id = get_location_id(location)
        if location_id is None:
            logger.warning(f"  Location '{location}' tidak ditemukan di location service")
        
        for idx, stream_url in enumerate(streams):
            if not stream_url:
                continue
                
            cam_counter += 1
            cam_id = f"cam_{cam_counter}"
            try:
                processor = CameraProcessor(
                    camera_id=cam_id,
                    rtsp_url=stream_url,
                    location_name=location,
                    location_id=location_id,
                    model_path=MODEL_PATH,
                )
                processor.start()
                active_cameras[f"{location}_{cam_id}"] = processor
                logger.info(f"    [{location}] {cam_id} started (id: {location_id})")
            except Exception as e:
                logger.error(f"    [{location}] {cam_id} gagal: {e}")

    logger.info(f" Total kamera aktif: {len(active_cameras)}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info(" Stopping all cameras...")
    for cam in active_cameras.values():
        cam.stop()
    for cam in active_cameras.values():
        cam.join(timeout=3.0)
    logger.info(" Semua kamera dihentikan.")


# ── Endpoints ─────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "Crowd Counting Service",
        "version": "1.0.0",
        "status": "running",
        "cameras": {
            "total": len(active_cameras),
            "locations": list({cam.location_name for cam in active_cameras.values()}),
        },
        "endpoints": {
            "current_counts": "/api/crowd/current",
            "location": "/api/crowd/location/{location_name}",
            "camera_status": "/api/crowd/cameras",
        },
    }


@app.get("/api/crowd/current")
async def get_current_counts():
    """Jumlah orang saat ini di semua lokasi."""
    results = {}
    for processor in active_cameras.values():
        loc = processor.location_name
        if loc not in results:
            results[loc] = {
                "total": 0,
                "cameras": 0,
                "timestamp": datetime.now().isoformat(),
            }
        results[loc]["total"] += processor.get_count()
        results[loc]["cameras"] += 1
    return results


@app.get("/api/crowd/location/{location_name}")
async def get_location_count(location_name: str):
    """Jumlah orang di lokasi tertentu."""
    cams = [c for c in active_cameras.values() if c.location_name == location_name]
    if not cams:
        raise HTTPException(status_code=404, detail=f"Lokasi '{location_name}' tidak ditemukan")
    return {
        "location": location_name,
        "total_visitors": sum(c.get_count() for c in cams),
        "cameras": len(cams),
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/api/crowd/cameras")
async def get_cameras_status():
    """Status semua kamera."""
    cameras_status = []
    for processor in active_cameras.values():
        status = processor.get_status()
        cameras_status.append({
            "camera_id": status["camera_id"],
            "location": status["location"],
            "location_id": status.get("location_id"),
            "is_active": status.get("is_connected", False),
            "error_message": status.get("error_message"),
            "people_count": status["people_count"],
            "crowd_level": status.get("crowd_level"),
            "last_update": status["last_update"],
            "fps": status["fps"],
            "running": status["running"],
        })
    return {
        "total": len(active_cameras),
        "cameras": cameras_status,
    }


@app.get("/api/crowd/cameras/{location_name}")
async def get_location_cameras(location_name: str):
    """Status kamera di lokasi tertentu."""
    cameras = []
    for processor in active_cameras.values():
        if processor.location_name == location_name:
            status = processor.get_status()
            cameras.append({
                "camera_id": status["camera_id"],
                "is_active": status.get("is_connected", False),
                "error_message": status.get("error_message"),
                "people_count": status["people_count"],
                "crowd_level": status.get("crowd_level"),
                "last_update": status["last_update"],
            })
    
    if not cameras:
        raise HTTPException(status_code=404, detail=f"Lokasi '{location_name}' tidak ditemukan")
    return {"location": location_name, "cameras": cameras}


@app.get("/api/crowd/camera/status/{location_id}")
async def get_camera_status_by_location(location_id: int):
    """Status kamera berdasarkan location_id (dari frontend)"""
    for processor in active_cameras.values():
        if processor.location_id == location_id:
            status = processor.get_status()
            return {
                "location_id": location_id,
                "location_name": processor.location_name,
                "is_active": status.get("is_connected", False),
                "error_message": status.get("error_message"),
                "people_count": status["people_count"],
                "crowd_level": status.get("crowd_level"),
                "last_update": status["last_update"],
            }
    
    return {
        "location_id": location_id,
        "is_active": False,
        "error_message": "CCTV tidak terdaftar atau belum terhubung",
        "people_count": 0,
        "crowd_level": None,
    }


@app.post("/api/crowd/refresh-mapping")
async def refresh_mapping():
    """Refresh mapping lokasi dari location service"""
    success = fetch_location_mapping()
    if success:
        return {"message": "Mapping refreshed", "count": len(location_id_map)}
    else:
        raise HTTPException(status_code=503, detail="Location service unavailable")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, log_level="info")