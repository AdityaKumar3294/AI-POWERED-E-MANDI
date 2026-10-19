from pathlib import Path
from ultralytics import YOLO

# Locate the existing trained model in ai-service
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "ai-service" / "models" / "best.pt"

if not MODEL_PATH.is_file():
    raise FileNotFoundError(f"YOLO model not found: {MODEL_PATH}")

model = YOLO(str(MODEL_PATH))


def predict_image(image_path, conf=0.25, verbose=False):
    image_path = Path(image_path)
    
    if not image_path.is_file():
        raise FileNotFoundError(f"Input image not found: {image_path}")
        
    results = model.predict(
        source=str(image_path),
        imgsz=640,
        conf=conf,
        verbose=verbose
    )
    
    result = results[0]
    fresh_count = 0
    rotten_count = 0
    detections = []

    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])

        if class_id == 0:
            label = "Fresh Tomato"
            fresh_count += 1
        elif class_id == 1:
            label = "Rotten Tomato"
            rotten_count += 1
        else:
            continue

        x1, y1, x2, y2 = box.xyxy[0].tolist()

        if verbose:
            print(
                f"Class: {label}, Confidence: {confidence:.2f}, "
                f"Width: {x2 - x1:.1f}, Height: {y2 - y1:.1f}, "
                f"Area: {(x2 - x1) * (y2 - y1):.1f}"
            )