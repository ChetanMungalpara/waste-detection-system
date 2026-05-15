import os  # ADDED: For secure file pathing and environment variables
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
from ultralytics import YOLO

app = Flask(__name__)
CORS(app) 

# CHANGE 1: Absolute Pathing. 
# Cloud servers sometimes run files from different directories. 
# This guarantees it always finds your .pt file in the same folder.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "yolov8n.pt")

model = YOLO(MODEL_PATH) 

BIN_MAPPING = {
    "bottle": {"category": "Recyclable", "points": 10},
    "cup": {"category": "Recyclable", "points": 10},
    "apple": {"category": "Organic", "points": 5},
    "banana": {"category": "Organic", "points": 5},
    "cell phone": {"category": "E-waste", "points": 20},
    "laptop": {"category": "E-waste", "points": 20},
}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        # CHANGE 2: Safe Base64 Splitting.
        # If Next.js accidentally sends pure base64 (without "data:image/jpeg;base64,"),
        # your old code `.split(',')[1]` would crash the server with an IndexError.
        image_string = data['image']
        if ',' in image_string:
            image_string = image_string.split(',')[1]

        # Decode the base64 image 
        img_data = base64.b64decode(image_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Run YOLOv8 inference
        results = model.predict(img, conf=0.5)

        if len(results[0].boxes) == 0:
            return jsonify({"error": "No waste detected in frame. Try again."}), 404

        # Get the detection with the highest confidence
        best_box = results[0].boxes[0]
        class_id = int(best_box.cls[0].item())
        item_name = model.names[class_id]

        # Map it to our bins (default to Unknown if not in mapping)
        mapping = BIN_MAPPING.get(item_name, {"category": "Unknown", "points": 0})

        return jsonify({
            "item": item_name.capitalize(),
            "category": mapping["category"],
            "points": mapping["points"]
        }), 200

    except Exception as e:
        # It's good to print the exact error to your server logs for debugging
        print(f"Prediction Error: {e}") 
        return jsonify({"error": "Failed to process image"}), 500


# CHANGE 3: Dynamic Ports and Host.
# Cloud providers (like Render or Heroku) assign random ports. 
# They will crash if you force port 5000.
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 EcoSort ML Server running on port {port}")
    # host='0.0.0.0' exposes the server to the outside network, which is required for deployment.
    app.run(host='0.0.0.0', port=port, debug=False)