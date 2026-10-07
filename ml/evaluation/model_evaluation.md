# Tomato Quality Model — Evaluation Report

## 1. Model Overview

The tomato quality detection model is based on YOLO11n and is trained to detect two tomato quality classes:

- Fresh Tomato
- Rotten Tomato

The model is intended for the AI-Powered E-Mandi tomato quality assessment pipeline.

---

## 2. Training Configuration

| Parameter          | Value |
|--------------------|----------------------------|
| Model              | YOLO11n                    |
| Task               | Object Detection           |
| Number of Classes  | 2                          |
| Image Size         | 640 × 640                  |
| Epochs             | 50                         |
| Batch Size         | 8                          |
| Hardware           | NVIDIA RTX 3050 Laptop GPU |
| Training Framework | Ultralytics YOLO           |
| Dataset Split      | Train / Validation / Test  |

---

## 3. Dataset Classes

The final dataset contains:

```text
0 → Fresh Tomato
1 → Rotten Tomato
## 4. Test Set Evaluation

The final model was evaluated on a separate test split that was not used during training.

### Overall Results

| Metric | Result |
|---|---:|
| Test Images | 774 |
| Tomato Instances | 2,033 |
| Precision | 97.5% |
| Recall | 96.5% |
| mAP@50 | 98.8% |
| mAP@50-95 | 95.4% |

### Class-wise Results

| Class | Precision | Recall | mAP@50 | mAP@50-95 |
|---|---:|---:|---:|---:|
| Fresh Tomato | 98.0% | 95.4% | 99.0% | 95.0% |
| Rotten Tomato | 97.1% | 97.6% | 98.6% | 95.7% |
## 5. Qualitative Testing

The model was also tested on individual images from the held-out test set.

The following types of images were checked:

- Multiple fresh tomatoes
- Single tomato images
- Different tomato arrangements

The detections on the sampled test images were visually checked and appeared correct.
```

---


## 6. External Image Testing

The model was additionally tested on images obtained from outside the original dataset.

These images were used only for generalization and stress testing and were not included in the formal test-set evaluation.

The external tests showed that the model performs well on some real-world images but has limitations on certain difficult images.

Observed issues included:

- Some tomatoes were missed in crowded or overlapping scenes.
- Some external images produced very few or no detections.
- Rotten tomato detection was weaker on some external images.
- Lowering the confidence threshold too much produced false-positive detections.

These results indicate areas for future model improvement.

## 7. Current Model Limitations

The current v1 model has the following known limitations:

1. Crowded or overlapping tomatoes may be missed.
2. Images with significantly different visual conditions may reduce detection performance.
3. Rotten tomato detection may be weaker on some external images.
4. Very low confidence thresholds can introduce false-positive detections.

These limitations were observed during external stress testing and do not invalidate the formal held-out test-set results.

## 8. Current Model Status

**Status: v1 baseline complete**

The model can:

- Detect tomatoes.
- Classify tomatoes as Fresh or Rotten.
- Count detected tomatoes.
- Calculate defective percentage from detections.
- Provide bounding-box information for downstream processing.

The current v1 model will be retained as the baseline for future improvements.

If a v2 model is trained, it should be evaluated on the same held-out test set and compared against v1 before replacing the baseline.