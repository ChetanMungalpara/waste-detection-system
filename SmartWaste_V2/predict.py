import cv2
from ultralytics import YOLO

MODEL_PATH = "runs/detect/train/weights/best.pt" 
print(f"Loading model from {MODEL_PATH}...")
model = YOLO(MODEL_PATH)

def get_bin_category(item_name):
    """Flexible function to categorize waste based on keywords"""
    # Convert to lowercase so it matches "Bottle", "BOTTLE", or "bottle"
    name = item_name.lower() 
    
    # Recyclables
    if any(keyword in name for keyword in ["plastic", "bottle", "can", "paper", "cardboard", "box", "cup", "glass", "metal"]):
        return "Recyclable"
        
    # Organic
    elif any(keyword in name for keyword in ["food", "fruit", "kitchen", "apple", "banana", "vegetable", "leaf", "carrot", "potato"]):
        return "Organic"
        
    # Hazardous
    elif any(keyword in name for keyword in ["battery", "medicine", "syringe", "chemical", "medical"]):
        return "Hazardous"
        
    # E-Waste
    elif any(keyword in name for keyword in ["phone", "laptop", "cable", "wire", "pcb", "electronic"]):
        return "E-waste"
        
    # Fallback
    else:
        return "Unknown"

cap = cv2.VideoCapture(0)
print("🎥 Webcam started. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Could not access webcam.")
        break

    results = model.predict(source=frame, conf=0.5, show=False)

    for box in results[0].boxes:
        class_id = int(box.cls[0].item())
        
        # Get the actual name the AI is using
        item_name = model.names[class_id] 
        
        # PRINT IT TO THE TERMINAL SO YOU CAN SEE IT
        print(f"Detected an object! The AI calls it: '{item_name}'")
        
        confidence = float(box.conf[0].item())
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

        # Use our new flexible function
        bin_category = get_bin_category(item_name)

        # Draw box and label
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        label_text = f"{bin_category} ({item_name}) {confidence:.2f}"
        
        # Adding a background rectangle for text so it's easier to read
        (text_width, text_height), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (x1, y1 - 25), (x1 + text_width, y1), (0, 255, 0), -1)
        cv2.putText(frame, label_text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)

    cv2.imshow("Smart Bin - Multi-Category Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()