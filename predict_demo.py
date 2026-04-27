# predict_demo.py
import torch
import torch.nn as nn
from torchvision import transforms, models
import cv2
import numpy as np

# =====================
# CONFIG
# =====================
MODEL_PATH = "waste_classifier.pth"
IMG_SIZE = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Classes (must match the order from your training dataset folder)
CLASS_NAMES = ["organic", "recyclable", "hazardous", "ewaste"]

# =====================
# MODEL SETUP
# =====================
# Load the model structure (MobileNetV2)
model = models.mobilenet_v2(weights=None) # We don't need pretrained weights, just the architecture
model.classifier[1] = nn.Linear(model.last_channel, len(CLASS_NAMES))

# Load your trained weights
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval() # Set the model to evaluation mode
model.to(DEVICE)
print(f"✅ Model '{MODEL_PATH}' loaded on {DEVICE}.")


# =====================
# TRANSFORMS
# =====================
# Same normalization as during validation
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def crop_center(frame, size=224):
    """Crops a square region from the center of the frame."""
    h, w, _ = frame.shape
    min_dim = min(h, w)
    crop_size = min(min_dim, size * 2)
    cx, cy = w // 2, h // 2
    x1 = max(0, cx - crop_size // 2)
    y1 = max(0, cy - crop_size // 2)
    x2 = min(w, cx + crop_size // 2)
    y2 = min(h, cy + crop_size // 2)
    return frame[y1:y2, x1:x2]

# =====================
# REAL-TIME PREDICTION
# =====================
cap = cv2.VideoCapture(0)
print("🎥 Webcam started. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Could not access webcam")
        break

    # 1. Crop the center of the frame to focus on the object
    cropped_frame = crop_center(frame, size=IMG_SIZE)
    
    # 2. Preprocess the cropped frame for the model
    input_tensor = transform(cropped_frame).unsqueeze(0).to(DEVICE)

    # 3. Get prediction from the AI model
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        confidence, pred_index = torch.max(probabilities, 0)

    predicted_class = CLASS_NAMES[pred_index.item()]
    confidence_score = confidence.item()

    # 4. Draw the guide box and display the prediction on the original frame
    h, w, _ = frame.shape
    box_size = min(h, w) // 2
    x1, y1 = w//2 - box_size//2, h//2 - box_size//2
    x2, y2 = w//2 + box_size//2, h//2 + box_size//2
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2) # Yellow guide box

    label = f"{predicted_class} ({confidence_score:.2f})"
    cv2.putText(frame, label, (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Smart Bin - AI Waste Classifier", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()