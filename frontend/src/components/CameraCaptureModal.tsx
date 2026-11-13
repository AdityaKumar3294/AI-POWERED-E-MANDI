import { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  onFallbackToFilePicker?: () => void;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFilePicker,
}: CameraCaptureModalProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Stop all active camera tracks
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
  };

  // Start video stream
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const initCamera = async () => {
      // 1. Check browser support for mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setError(
            t(
              'grading.cameraNotSupported',
              'Your browser does not support live camera access. Please use the file upload option.'
            )
          );
          setIsLoading(false);
        }
        return;
      }

      // 2. Check for multiple video input devices (front/back camera)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        if (isMounted) {
          setHasMultipleCameras(videoInputs.length > 1);
        }
      } catch {
        // Enumerate error is non-fatal
      }

      // 3. Request user camera stream
      try {
        stopStream();

        // Attempt facingMode constraint first, fallback to basic video
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 },
            },
            audio: false,
          });
        } catch {
          // Fallback to generic video if ideal constraints failed
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setIsLoading(false);

        const errMsg = err?.name === 'NotAllowedError'
          ? t('grading.cameraPermissionDenied', 'Camera permission was denied. Please allow camera access in your browser settings.')
          : err?.name === 'NotFoundError'
          ? t('grading.cameraNotFound', 'No camera hardware found on this device.')
          : t('grading.cameraGenericError', 'Could not access camera. Please check your device permissions.');

        setError(errMsg);
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [isOpen, facingMode, t]);

  // Handle snapping photo from video stream
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    // Trigger visual shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Mirror user (front) camera for natural view
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `crop-scan-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            stopStream();
            onCapture(file);
            onClose();
          }
        },
        'image/jpeg',
        0.92
      );
    }
  };

  // Switch between front and rear cameras
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col w-full max-w-xl max-h-[92vh] overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 shadow-2xl text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-800/80 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/30 text-brand-400">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 id="camera-modal-title" className="text-sm font-bold sm:text-base">
                {t('grading.cameraTitle', 'Live Produce Camera')}
              </h2>
              <p className="text-[11px] text-stone-400">
                {t('grading.cameraSubtitle', 'Align harvested tomatoes inside the frame')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasMultipleCameras && !error && (
              <button
                type="button"
                onClick={toggleFacingMode}
                title={t('grading.flipCamera', 'Switch Camera')}
                className="touch-target inline-flex items-center justify-center rounded-xl bg-stone-800 p-2 text-stone-300 hover:bg-stone-700 hover:text-white transition"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="touch-target inline-flex items-center justify-center rounded-xl bg-stone-800 p-2 text-stone-300 hover:bg-stone-700 hover:text-white transition"
              aria-label="Close camera"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex flex-1 items-center justify-center bg-black min-h-[340px] sm:min-h-[420px] overflow-hidden">
          {/* Shutter flash effect */}
          {isFlashing && (
            <div className="pointer-events-none absolute inset-0 z-30 bg-white transition-opacity duration-200 opacity-90" />
          )}

          {/* Loading Spinner */}
          {isLoading && !error && (
            <div className="flex flex-col items-center gap-3 text-stone-400">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
              <p className="text-xs font-medium">
                {t('grading.startingCamera', 'Initializing live camera feed...')}
              </p>
            </div>
          )}

          {/* Camera Error / Permission Fallback */}
          {error && (
            <div className="mx-6 max-w-sm rounded-2xl border border-red-900/60 bg-red-950/40 p-5 text-center text-stone-200">
              <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-2" />
              <h3 className="text-sm font-bold text-red-200 mb-1">
                {t('grading.cameraErrorTitle', 'Camera Unavailable')}
              </h3>
              <p className="text-xs text-stone-300 mb-4 leading-relaxed">
                {error}
              </p>
              {onFallbackToFilePicker && (
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    onClose();
                    onFallbackToFilePicker();
                  }}
                  className="touch-target inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 shadow-md transition"
                >
                  <Upload className="h-4 w-4" />
                  <span>{t('grading.chooseFileInstead', 'Upload Photo from Device')}</span>
                </button>
              )}
            </div>
          )}

          {/* Video Stream Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full w-full object-cover ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            } ${isLoading || error ? 'hidden' : 'block'}`}
          />

          {/* Framing Target Box Overlay */}
          {!isLoading && !error && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="relative aspect-4/3 w-full max-w-sm rounded-2xl border-2 border-dashed border-white/40 shadow-inner">
                {/* Crosshair corners */}
                <div className="absolute -top-1 -left-1 h-4 w-4 border-t-3 border-l-3 border-brand-400 rounded-tl-md" />
                <div className="absolute -top-1 -right-1 h-4 w-4 border-t-3 border-r-3 border-brand-400 rounded-tr-md" />
                <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-3 border-l-3 border-brand-400 rounded-bl-md" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-3 border-r-3 border-brand-400 rounded-br-md" />

                <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-xs">
                  {t('grading.alignProduce', 'Place produce in target area')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Shutter Controls */}
        <div className="flex items-center justify-around border-t border-stone-800/80 bg-stone-900/90 px-6 py-4">
          {/* Cancel button */}
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="touch-target inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            {t('common.cancel', 'Cancel')}
          </button>

          {/* Large Shutter Button */}
          <button
            type="button"
            disabled={isLoading || Boolean(error)}
            onClick={handleCapture}
            className="touch-target group relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 p-1 shadow-lg ring-4 ring-brand-500/30 hover:bg-brand-500 hover:ring-brand-500/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Capture Photo"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 bg-white group-hover:scale-105 transition">
              <Camera className="h-6 w-6 text-brand-800" />
            </div>
          </button>

          {/* Quick Upload from device alternative */}
          {onFallbackToFilePicker ? (
            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
                onFallbackToFilePicker();
              }}
              className="touch-target inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 transition"
              title="Upload existing file"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{t('grading.chooseFile', 'Gallery')}</span>
            </button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </div>
    </div>
  );
}
