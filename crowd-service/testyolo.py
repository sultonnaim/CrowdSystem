import cv2
import time
import os
from ultralytics import YOLO

# KONFIGURASI

USE_RTSP = True
#RTSP_URL = "rtsp://sultonun:view$&cctvT4@112.140.166.20:554/Streaming/Channels/802/"
VIDEO_PATH = "videos/cctv5.mp4"
MODEL_PATH = "models/best.pt"

CONF_THRESHOLD = 0.25     
IOU_THRESHOLD = 0.50       
FRAME_SKIP = 1            
IMGSZ = 640                

# Tambahan untuk visualisas
MIN_WIDTH = 25
MIN_HEIGHT = 25
WINDOW_NAME = "Crowd Detection"

# KLASIFIKASI TINGKAT KERAMAIAN

def classify_crowd_level(count: int) -> str:
    
    if count <= 10:
        return "Rendah"
    elif count <= 25:
        return "Sedang"
    else:
        return "Tinggi"

# LOAD MODEL

if not os.path.exists(MODEL_PATH):
    print(f" Model tidak ditemukan di {MODEL_PATH}")
    exit()

print(f" Loading model: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
print(" Model loaded")

# OPEN STREAM

def open_stream():
    if USE_RTSP:
        #cap = cv2.VideoCapture(RTSP_URL, cv2.CAP_FFMPEG)
        cap = cv2.VideoCapture(VIDEO_PATH)
    else:
        cap = cv2.VideoCapture(VIDEO_PATH)
    
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    return cap

cap = open_stream()

if not cap.isOpened():
    print(" Gagal membuka stream/video")
    exit()

print(" Stream connected")

# WINDOW

cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)


# VARIABEL

fps = 0
fps_frame = 0
fps_time = time.time()
frame_count = 0
last_people_count = 0
last_level = "Rendah"

# MAIN LOOP


print(" TEST YOLO")
print(f"   conf_threshold = {CONF_THRESHOLD}")
print(f"   iou_threshold  = {IOU_THRESHOLD}")
print(f"   frame_skip     = {FRAME_SKIP}")
print(f"   imgsz          = {IMGSZ}")

while True:
    ret, frame = cap.read()

    if not ret:
        print(" Frame gagal dibaca, reconnecting...")
        cap.release()
        time.sleep(2)
        cap = open_stream()
        continue
    
    frame_count += 1

    # UPDATE FPS

    fps_frame += 1
    now = time.time()
    if now - fps_time >= 1:
        fps = int(fps_frame / (now - fps_time))
        fps_frame = 0
        fps_time = now

    # YOLO PROCESS

    if frame_count % FRAME_SKIP == 0:
        results = model.predict(
            source=frame,
            conf=CONF_THRESHOLD,
            iou=IOU_THRESHOLD,
            classes=[0],
            imgsz=IMGSZ,
            verbose=False
        )

        people_count = 0

        if results and results[0].boxes is not None:
            for box in results[0].boxes:
                conf = float(box.conf[0])
                cls = int(box.cls[0])

                if cls != 0:
                    continue
                if conf < CONF_THRESHOLD:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                w = x2 - x1
                h = y2 - y1

                if w < MIN_WIDTH or h < MIN_HEIGHT:
                    continue

                people_count += 1

                # Gambar bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f"Person {conf:.2f}", (x1, y1 - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Klasifikasi tingkat keramaian
        level = classify_crowd_level(people_count)

        last_people_count = people_count
        last_level = level

        # Cetak ke console 
        if frame_count % (FRAME_SKIP * 50) == 0:
            print(f"[Frame {frame_count}] {people_count} orang ({level})")


    # UI - TAMPILAN

    cv2.putText(frame, f"People : {last_people_count}", (20, 40),
               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.putText(frame, f"Level  : {last_level}", (20, 80),
               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    cv2.putText(frame, f"FPS    : {fps}", (20, 120),
               cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
    
    # Tampilkan parameter
    #cv2.putText(frame, f"conf={CONF_THRESHOLD} iou={IOU_THRESHOLD}", (20, 160),
               #cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

    # DISPLAY
    cv2.imshow(WINDOW_NAME, frame)

    # EXIT
    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break

# CLEANUP
cap.release()
cv2.destroyAllWindows()

print(" PROGRAM SELESAI")
print(f"Total frame diproses: {frame_count}")
print(f"Frame skip: {FRAME_SKIP}")
print(f"conf_threshold: {CONF_THRESHOLD}")
print(f"iou_threshold: {IOU_THRESHOLD}")
