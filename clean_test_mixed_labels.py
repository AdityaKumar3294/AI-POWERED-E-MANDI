from pathlib import Path

LABEL_DIR = Path(
    r".\ml\datasets\raw\tomato_detection\clean_dataset\test\labels"
)

converted_files = 0
converted_rows = 0

for label_file in LABEL_DIR.glob("*.txt"):
    lines = label_file.read_text().splitlines()
    new_lines = []
    file_changed = False

    for line in lines:
        parts = line.strip().split()

        if not parts:
            continue

        # Normal YOLO detection:
        # class x_center y_center width height
        if len(parts) == 5:
            new_lines.append(line)
            continue

        # Segmentation:
        # class x1 y1 x2 y2 x3 y3 ...
        if len(parts) > 5:
            cls = parts[0]
            coords = list(map(float, parts[1:]))

            xs = coords[0::2]
            ys = coords[1::2]

            x_min = min(xs)
            x_max = max(xs)
            y_min = min(ys)
            y_max = max(ys)

            x_center = (x_min + x_max) / 2
            y_center = (y_min + y_max) / 2
            width = x_max - x_min
            height = y_max - y_min

            new_lines.append(
                f"{cls} {x_center:.6f} {y_center:.6f} "
                f"{width:.6f} {height:.6f}"
            )

            file_changed = True
            converted_rows += 1

    if file_changed:
        label_file.write_text("\n".join(new_lines) + "\n")
        converted_files += 1
        print(f"Converted: {label_file.name}")

print()
print(f"Files converted: {converted_files}")
print(f"Segmentation rows converted to boxes: {converted_rows}")