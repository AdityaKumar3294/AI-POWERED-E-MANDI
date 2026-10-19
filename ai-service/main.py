
from pathlib import Path
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile, Query
from ultralytics import YOLO
from PIL import Image, UnidentifiedImageError

app = FastAPI(title="AI E-Mandi AI Service")

MODEL_PATH = Path(__file__).parent / "models" / "best.pt"

if not MODEL_PATH.is_file():
    raise FileNotFoundError(f"YOLO model not found: {MODEL_PATH}")

model = YOLO(str(MODEL_PATH))


@app.get("/")
def home():
    return {
        "message": "AI E-Mandi AI Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    conf: float = Query(default=0.4, ge=0.0, le=1.0)
):
    if file.content_type not in (
        "image/jpeg",
        "image/png",
        "image/webp"
    ):
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or WEBP image."
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image."
        )

    results = model.predict(
        image,
        conf=conf,
        iou=0.45,
        verbose=False
    )

    result = results[0]

    fresh_count = 0
    rotten_count = 0
    detections = []

    for box in result.boxes:
        class_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item())

        class_name = model.names[class_id]

        if class_name == "Fresh Tomato":
            fresh_count += 1
        elif class_name == "Rotten Tomato":
            rotten_count += 1
        else:
            continue

        detections.append({
            "class_id": class_id,
            "class_name": class_name,
            "confidence": round(confidence, 4),
            "box": [
                round(float(value), 2)
                for value in box.xyxy[0].tolist()
            ]
        })

    total_count = fresh_count + rotten_count

    defect_percentage = (
        round((rotten_count / total_count) * 100, 2)
        if total_count > 0
        else 0.0
    )

    return {
        "filename": file.filename,
        "confidence_threshold": conf,
        "total_count": total_count,
        "fresh_count": fresh_count,
        "rotten_count": rotten_count,
        "defect_percentage": defect_percentage,
        "detections_count": len(detections),
        "detections": detections
    }
