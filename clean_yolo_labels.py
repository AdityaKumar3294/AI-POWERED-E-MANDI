from pathlib import Path
import shutil

DATASET = Path("ml/datasets/raw/tomato_detection/clean_dataset")

SPLITS = ["train", "valid"]


def polygon_to_bbox(values):
    """
    values = [x1, y1, x2, y2, ...]
    All coordinates are normalized 0-1.
    Returns YOLO bbox:
    x_center y_center width height
    """

    xs = values[0::2]
    ys = values[1::2]

    if not xs or not ys:
        return None

    x_min = min(xs)
    x_max = max(xs)
    y_min = min(ys)
    y_max = max(ys)

    x_center = (x_min + x_max) / 2
    y_center = (y_min + y_max) / 2
    width = x_max - x_min
    height = y_max - y_min

    return x_center, y_center, width, height


for split in SPLITS:

    labels_dir = DATASET / split / "labels"

    if not labels_dir.exists():
        print(f"Labels directory not found: {labels_dir}")
        continue

    # Backup original labels
    backup_dir = DATASET / f"{split}_labels_backup"

    if not backup_dir.exists():
        shutil.copytree(labels_dir, backup_dir)
        print(f"Backup created: {backup_dir}")

    converted = 0
    detection_lines = 0
    segmentation_lines = 0
    invalid_lines = 0

    for label_file in labels_dir.glob("*.txt"):

        new_lines = []

        with open(label_file, "r") as f:
            lines = f.readlines()

        for line in lines:

            parts = line.strip().split()

            if not parts:
                continue

            try:
                class_id = int(parts[0])
                numbers = [float(x) for x in parts[1:]]
            except ValueError:
                invalid_lines += 1
                continue

            # Normal YOLO detection annotation
            if len(numbers) == 4:

                x_center, y_center, width, height = numbers

                new_lines.append(
                    f"{class_id} "
                    f"{x_center:.6f} "
                    f"{y_center:.6f} "
                    f"{width:.6f} "
                    f"{height:.6f}\n"
                )

                detection_lines += 1

            # YOLO segmentation polygon
            elif len(numbers) >= 6 and len(numbers) % 2 == 0:

                bbox = polygon_to_bbox(numbers)

                if bbox is None:
                    invalid_lines += 1
                    continue

                x_center, y_center, width, height = bbox

                new_lines.append(
                    f"{class_id} "
                    f"{x_center:.6f} "
                    f"{y_center:.6f} "
                    f"{width:.6f} "
                    f"{height:.6f}\n"
                )

                segmentation_lines += 1
                converted += 1

            else:
                invalid_lines += 1

        with open(label_file, "w") as f:
            f.writelines(new_lines)

    print()
    print(f"===== {split.upper()} =====")
    print(f"Detection annotations kept: {detection_lines}")
    print(f"Segmentation annotations converted: {segmentation_lines}")
    print(f"Invalid annotations skipped: {invalid_lines}")
    print(f"Total polygons converted: {converted}")


print()
print("DONE.")
print("Original labels were backed up before modification.")