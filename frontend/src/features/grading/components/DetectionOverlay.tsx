import { useRef, useState, useEffect } from 'react';
import type { BoundingBoxDetection } from '@/types';

interface DetectionOverlayProps {
  imageUrl: string;
  detections?: BoundingBoxDetection[];
  className?: string;
}

export function DetectionOverlay({
  imageUrl,
  detections = [],
  className = '',
}: DetectionOverlayProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);

  // Read natural image dimensions once loaded
  const handleImageLoad = () => {
    if (imgRef.current) {
      setNaturalDimensions({
        width: imgRef.current.naturalWidth || 640,
        height: imgRef.current.naturalHeight || 640,
      });
    }
  };

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      handleImageLoad();
    }
  }, [imageUrl]);

  const hasDetections = Array.isArray(detections) && detections.length > 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 shadow-md dark:border-stone-800 ${className}`}>
      {/* Base Image */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Analyzed produce"
        onLoad={handleImageLoad}
        className="block h-auto w-full object-contain select-none"
      />

      {/* SVG Bounding Boxes Overlay (only if detections exist and dimensions known) */}
      {hasDetections && naturalDimensions && (
        <svg
          viewBox={`0 0 ${naturalDimensions.width} ${naturalDimensions.height}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          {detections.map((det, index) => {
            const [x1, y1, x2, y2] = det.box;
            const width = Math.max(0, x2 - x1);
            const height = Math.max(0, y2 - y1);
            const isFresh = det.class_id === 0 || det.class_name === 'Fresh Tomato';

            const strokeColor = isFresh ? '#10b981' : '#ef4444'; // Emerald for Fresh, Red for Rotten
            const fillColor = isFresh ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            const label = `${isFresh ? 'Fresh' : 'Rotten'} ${(det.confidence * 100).toFixed(0)}%`;

            // Adjust text label size based on image scale
            const fontSize = Math.max(12, Math.round(naturalDimensions.width * 0.022));

            return (
              <g key={index}>
                {/* Bounding Rectangle */}
                <rect
                  x={x1}
                  y={y1}
                  width={width}
                  height={height}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={Math.max(2, Math.round(naturalDimensions.width * 0.0035))}
                  rx={4}
                />

                {/* Label Background Pill */}
                <rect
                  x={x1}
                  y={Math.max(0, y1 - fontSize - 6)}
                  width={label.length * (fontSize * 0.62) + 12}
                  height={fontSize + 6}
                  fill={strokeColor}
                  rx={3}
                />

                {/* Label Text */}
                <text
                  x={x1 + 6}
                  y={Math.max(0, y1 - fontSize - 6) + fontSize}
                  fill="#ffffff"
                  fontSize={fontSize}
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Legend Badge */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-stone-900/85 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-xs">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Fresh</span>
        </span>
        <span className="text-stone-500">•</span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Rotten</span>
        </span>
      </div>
    </div>
  );
}

