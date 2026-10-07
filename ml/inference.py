from ultralytics import YOLO


# Path to our trained YOLO model
MODEL_PATH = r"runs\detect\train-3\weights\best.pt"

# Load the trained model
model = YOLO(MODEL_PATH)


def predict_image(image_path):
    results = model.predict(
        source=image_path,
        imgsz=640,
        conf=0.25,
        verbose=False
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

        width = x2 - x1
        height = y2 - y1
        area = width * height

        print(
            f"Class: {label}, "
            f"Width: {width:.1f}, "
            f"Height: {height:.1f}, "
            f"Area: {area:.1f}"
        )

        detections.append({
            "class": label,
            "confidence": round(confidence, 2)
        })

    total_count = fresh_count + rotten_count

    # Calculate percentage of defective (rotten) tomatoes
    if total_count > 0:
        defect_percentage = (rotten_count / total_count) * 100
    else:
        defect_percentage = 0.0

    return {
        "total_count": total_count,
        "fresh_count": fresh_count,
        "rotten_count": rotten_count,
        "defect_percentage": round(defect_percentage, 2),
        "detections": detections
    }


if __name__ == "__main__":

    image_path = (
        r"ml\datasets\raw\tomato_detection\clean_dataset"
        r"\test\images"
        r"\0887_jpg.rf.a4eb63b51278dda168e7b29b8218a50a.jpg"
    )

    result = predict_image(image_path)

    print(result)