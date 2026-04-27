# train.py
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
import os
# =====================
# CONFIG
# =====================
DATA_DIR = "dataset"
BATCH_SIZE = 32
EPOCHS = 10
LR = 0.001
IMG_SIZE = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# =====================
# DATA PIPELINE
# =====================
train_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

val_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

train_data = datasets.ImageFolder(os.path.join(DATA_DIR, "train"), transform=train_transforms)
val_data = datasets.ImageFolder(os.path.join(DATA_DIR, "val"), transform=val_transforms)

train_loader = DataLoader(train_data, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_data, batch_size=BATCH_SIZE, shuffle=False)

class_names = train_data.classes
print(f"✅ Found classes: {class_names}")

# =====================
# MODEL
# =====================
model = models.mobilenet_v2(weights='MobileNet_V2_Weights.DEFAULT')
for param in model.features.parameters():
    param.requires_grad = False  # freeze feature extractor

# Replace classifier
model.classifier[1] = nn.Linear(model.last_channel, len(class_names))
model = model.to(DEVICE)

# =====================
# TRAINING
# =====================
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.classifier.parameters(), lr=LR)

def train_model():
    best_acc = 0.0
    for epoch in range(EPOCHS):
        print(f"\n📘 Epoch {epoch+1}/{EPOCHS}")
        print("-" * 30)

        # Train phase
        model.train()
        train_loss, train_correct = 0.0, 0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            train_correct += torch.sum(preds == labels.data)

        epoch_loss = train_loss / len(train_data)
        epoch_acc = train_correct.double() / len(train_data)
        print(f"Train Loss: {epoch_loss:.4f} | Train Acc: {epoch_acc:.4f}")

        # Validation phase
        model.eval()
        val_loss, val_correct = 0.0, 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
                outputs = model(inputs)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * inputs.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data)

        val_loss /= len(val_data)
        val_acc = val_correct.double() / len(val_data)
        print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")

        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), "waste_classifier.pth")
            print("✅ Model saved (best so far)")

    print(f"\n🎯 Training complete. Best Val Acc: {best_acc:.4f}")

if __name__ == "__main__":
    train_model()