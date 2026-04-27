import io
import base64
from flask import Flask, render_template, request, jsonify
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models

app = Flask(__name__)

# ==========================
# LOAD MODEL
# ==========================
IMG_SIZE = 224

# Same preprocessing used during training
preprocess = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# These MUST match the folder names in dataset/train
CLASS_NAMES = ["e-waste", "hazardous", "organic", "recyclable"]

MODEL_PATH = "waste_classifier.pth"

# Load MobileNetV2 with correct classifier output
model = models.mobilenet_v2(weights=None)
model.classifier[1] = nn.Linear(model.last_channel, len(CLASS_NAMES))

# Load trained weights
model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
model.eval()

print("✅ Model loaded successfully!")


# ==========================
# HELPERS
# ==========================
def decode_base64_image(b64_string):
    """Convert base64 string to PIL image."""
    image_data = base64.b64decode(b64_string)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    return image


def predict_image(image):
    """Run PyTorch prediction."""
    tensor = preprocess(image).unsqueeze(0)  # add batch dim

    with torch.no_grad():
        outputs = model(tensor)
        _, predicted = outputs.max(1)
        class_name = CLASS_NAMES[predicted.item()]

    explanation = f"This appears to be {class_name.replace('-', ' ')} waste."

    return class_name, explanation


# ==========================
# ROUTES
# ==========================
@app.route('/')
def index():
    return render_template("index.html")


@app.route('/predict', methods=['POST'])
def predict():
    if not request.json or "image" not in request.json:
        return jsonify({"error": "No image received"}), 400

    try:
        image_b64 = request.json["image"]
        image = decode_base64_image(image_b64)
        category, explanation = predict_image(image)

        return jsonify({
            "category": category.title(),
            "explanation": explanation
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({
            "category": "Error",
            "explanation": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
