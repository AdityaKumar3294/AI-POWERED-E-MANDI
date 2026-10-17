
from pathlib import Path
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile, Query
from ultralytics import YOLO
from PIL import Image, UnidentifiedImageError

app = FastAPI(title="AI E-Mandi AI Service")

MODEL_PATH = Path(__file__).parent / "models" / "best.pt"
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
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
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

    detections = []

    for box in result.boxes:
        class_id = int(box.cls[0].item())
        confidence = float(box.conf[0].item())

        detections.append({
            "class_id": class_id,
            "class_name": model.names[class_id],
            "confidence": round(confidence, 4),
            "box": [
                round(float(value), 2)
                for value in box.xyxy[0].tolist()
            ]
        })

    return {
        "filename": file.filename,
        "confidence_threshold": conf,
        "detections_count": len(detections),
        "detections": detections
    }
