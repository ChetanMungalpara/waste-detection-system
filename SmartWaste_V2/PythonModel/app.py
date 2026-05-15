from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
from ultralytics import YOLO

app = Flask(__name__)
# Allow your Next.js app to communicate with this Python server
CORS(app) 

# Load your YOLO model (Make sure yolov8n.pt or best.pt is in the same folder)
model = YOLO("yolov8n.pt") 

# Map YOLO detections to your Circular Economy bins
BIN_MAPPING = { "bottle": {"category": "Recyclable", "points": 10},
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
        if 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        # Decode the base64 image sent from Next.js
        img_data = base64.b64decode(data['image'].split(',')[1])
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
        print(e)
        return jsonify({"error": "Failed to process image"}), 500

if __name__ == '__main__':
    print("🚀 EcoSort ML Server running on http://localhost:5000")
    app.run(port=5000, debug=True)
