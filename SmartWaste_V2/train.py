from ultralytics import YOLO

def train_model():
    print("🚀 Starting YOLOv8 Training...")
    model = YOLO("yolov8n.pt") 
    results = model.train(
        data="data.yaml", 
        epochs=30,          
        imgsz=640,          
        batch=16, 
        device="cpu"        
    )
    print("✅ Training Complete!")

if __name__ == "__main__":
    train_model()