# capture.py
import cv2
import os
from datetime import datetime
import time
import random
import shutil

# Define waste classes (map keys -> class folders)
CLASS_MAP = {
    '1': 'organic',
    '2': 'recyclable',
    '3': 'hazardous',
    '4': 'ewaste'
}

SAVE_DIR = "data_capture"
os.makedirs(SAVE_DIR, exist_ok=True)

# Ensure subdirectories exist
for cls in CLASS_MAP.values():
    os.makedirs(os.path.join(SAVE_DIR, cls), exist_ok=True)

# Counters
counters = {cls: len(os.listdir(os.path.join(SAVE_DIR, cls))) for cls in CLASS_MAP.values()}

# Open webcam
cap = cv2.VideoCapture(0)

print("Press keys 1–4 to save a SINGLE cropped image to the respective class folder.")
print("Press SPACE after pressing 1–4 to start BURST mode (10 frames/sec for 3 seconds).")
print("Press 'a' to preview random data augmentations of the current frame.")
print("Press 'q' to quit and auto-split into train/val sets.")

burst_class = None  # stores which class to use in burst mode

def crop_center(frame, size=224):
    """Crop square region from the center of the frame."""
    h, w, _ = frame.shape
    min_dim = min(h, w)
    crop_size = min(min_dim, size*2)  # crop slightly bigger
    cx, cy = w // 2, h // 2
    x1 = max(0, cx - crop_size // 2)
    y1 = max(0, cy - crop_size // 2)
    x2 = min(w, cx + crop_size // 2)
    y2 = min(h, cy + crop_size // 2)
    cropped = frame[y1:y2, x1:x2]
    return cropped

def split_dataset(src_dir, dest_dir="dataset", train_ratio=0.8):
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
    for cls in os.listdir(src_dir):
        cls_path = os.path.join(src_dir, cls)
        if not os.path.isdir(cls_path):
            continue
        files = [f for f in os.listdir(cls_path) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
        random.shuffle(files)
        split_idx = int(len(files) * train_ratio)
        train_files, val_files = files[:split_idx], files[split_idx:]
        for subset, subset_files in [('train', train_files), ('val', val_files)]:
            subset_dir = os.path.join(dest_dir, subset, cls)
            os.makedirs(subset_dir, exist_ok=True)
            for f in subset_files:
                shutil.copy(os.path.join(cls_path, f), os.path.join(subset_dir, f))
    print(f"✅ Dataset split complete. Train/Val sets created in '{dest_dir}'.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Could not access webcam")
        break

    # Draw guide box in the center
    h, w, _ = frame.shape
    box_size = min(h, w) // 2
    x1, y1 = w//2 - box_size//2, h//2 - box_size//2
    x2, y2 = w//2 + box_size//2, h//2 + box_size//2
    cv2.rectangle(frame, (x1,y1), (x2,y2), (0, 255, 255), 2)

    # Display counters
    y = 30
    for k, cls in CLASS_MAP.items():
        cv2.putText(frame, f"{k}: {cls} ({counters[cls]})", (10, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        y += 30

    if burst_class:
        cv2.putText(frame, f"BURST MODE: {burst_class}", (10, y+20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

    cv2.imshow("Waste Data Capture", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):  # quit
        break

    elif chr(key) in CLASS_MAP:  # set class for single or burst
        burst_class = CLASS_MAP[chr(key)]
        cropped = crop_center(frame, size=224)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = os.path.join(SAVE_DIR, burst_class, f"{burst_class}_{timestamp}.jpg")
        cv2.imwrite(filename, cropped)
        counters[burst_class] += 1
        print(f"✅ Saved single cropped image to {burst_class}: {filename}")

    elif key == 32 and burst_class: 
        print(f"🚀 Starting burst capture for class: {burst_class}")
        start_time = time.time()
        duration = 3 
        interval = 0.1 
        while time.time() - start_time < duration:
            ret, frame = cap.read()
            if not ret:
                break
            cropped = crop_center(frame, size=224)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            filename = os.path.join(SAVE_DIR, burst_class, f"{burst_class}_{timestamp}.jpg")
            cv2.imwrite(filename, cropped)
            counters[burst_class] += 1
            time.sleep(interval)
        print(f"✅ Burst capture complete for class: {burst_class} ({counters[burst_class]} total images)")

cap.release()
cv2.destroyAllWindows()

# After quit → auto-split into train/val
split_dataset(SAVE_DIR, dest_dir="dataset", train_ratio=0.8)