# Tomato Detection Dataset — Report

## 1. Dataset Overview

The dataset used for the tomato quality detection model was prepared for YOLO object detection.

The final model uses two quality classes:

- Fresh Tomato
- Rotten Tomato

The dataset was cleaned and prepared before training to ensure that the annotations were compatible with YOLO object detection.

---

## 2. Dataset Classes

The final classes are:

```text
0 → Fresh Tomato
1 → Rotten Tomato
```

---


## 3. Dataset Structure

The cleaned dataset was organized into separate splits:

```text
clean_dataset/
├── train/
│   ├── images/
│   └── labels/
│
├── valid/
│   ├── images/
│   └── labels/
│
├── test/
│   ├── images/
│   └── labels/
│
└── data.yaml
```

---

## 4. Annotation Cleaning

The original dataset contained both detection and segmentation-style annotations.

A cleaning script was used to prepare the labels for YOLO object detection.

The cleaning process:

- Kept valid detection annotations.
- Converted compatible segmentation annotations into bounding-box annotations.
- Removed invalid annotations.
- Created backups of the original label files.

The cleaned labels were then used for model training and evaluation.

## 5. Dataset Split

The cleaned dataset contains 7,665 images divided into three separate splits:

| Split      | Number of Images |
|------------|-----------------:|
| Train      |            5,361 |
| Validation |            1,530 |
| Test       |              774 |
| Total      |            7,665 |

The test set was kept separate and was not used during model training.

## 6. Class Distribution

The dataset contains 20,429 annotated tomato instances across the two quality classes.

| Class | Number of Instances | Percentage |
|---|---:|---:|
| Fresh Tomato | 13,332 | 65.2% |
| Rotten Tomato | 7,097 | 34.8% |
| Total | 20,429 | 100% |

The dataset contains more Fresh Tomato instances than Rotten Tomato instances. However, both classes have substantial representation in the dataset.


## 7. Image Formats

All 7,665 images in the cleaned dataset are stored in JPEG format.

| Format | Number of Images |
|---|---:|
| `.jpg` | 7,665 |

## 8. Dataset Quality and Issues

During dataset preparation, the original annotations contained a mixture of object-detection and segmentation-style labels.

This caused YOLO to report mixed annotation types during the initial dataset inspection.

The issue was addressed before final training by:

- Keeping valid object-detection annotations.
- Converting compatible segmentation annotations into bounding-box annotations.
- Removing invalid annotations.
- Creating backups of the original label files.

After cleaning, the dataset was successfully used for YOLO object-detection training and evaluation.

The dataset also contains more Fresh Tomato instances than Rotten Tomato instances, with a distribution of 65.2% Fresh and 34.8% Rotten.

## 9. Recommended Use

The dataset is suitable for the project's tomato quality detection MVP.

It is recommended for:

- Tomato object detection.
- Fresh Tomato vs Rotten Tomato classification.
- Tomato counting.
- Defective percentage calculation.
- Training and evaluating the YOLO-based tomato quality model.

The dataset should continue to be evaluated with diverse real-world images, especially crowded scenes, different backgrounds, lighting conditions, and images containing defective or rotten tomatoes.

The maturity classes from other datasets should remain separate unless the project scope is explicitly expanded.