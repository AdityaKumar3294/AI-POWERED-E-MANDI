import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Upload, RefreshCw, Award, History, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAnalyzeGrading } from '../hooks';
import { DetectionOverlay } from '../components/DetectionOverlay';
import { GradingMetricsCard } from '../components/GradingMetricsCard';
import { GenerateCertificateDialog } from '../components/GenerateCertificateDialog';
import { CameraCaptureModal } from '@/components/CameraCaptureModal';
import { compressImage } from '@/lib/image-compress';
import { uploadUrl } from '@/lib/api';
import type { GradingResult } from '@/types';

export default function GradingPage() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<{
    gradingReportId: string;
    result: GradingResult;
    imageUrl?: string;
  } | null>(null);

  const [certDialogOpen, setCertDialogOpen] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const analyzeMutation = useAnalyzeGrading();

  const processSelectedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, or WEBP)');
      return;
    }

    setIsCompressing(true);
    try {
      // Compress to under 2MB before preview & upload
      const compressed = await compressImage(file, 2 * 1024 * 1024);
      setSelectedFile(compressed);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(compressed));
      setAnalysisResult(null);
    } catch {
      toast.error('Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRunAnalysis = () => {
    if (!selectedFile) {
      toast.error('Please select or capture a crop photo first');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    analyzeMutation.mutate(formData, {
      onSuccess: (data) => {
        setAnalysisResult({
          gradingReportId: data.gradingReportId,
          result: data.result,
          imageUrl: previewUrl || undefined,
        });
      },
    });
  };

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* React 19 Document Metadata */}
      <title>AI Crop Grading | AI-Powered E-Mandi</title>
      <meta
        name="description"
        content="Automated tomato quality grading and defect assessment using fine-tuned YOLO11n computer vision."
      />

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
            {t('grading.title', 'AI Crop Quality Grading')}
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {t('grading.subtitle', 'Capture tomato crop photo to instantly receive AI verified grade (A, B, C)')}
          </p>
        </div>

        <Link
          to="/farmer/grading/reports"
          className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
        >
          <History className="h-4 w-4 text-stone-500" />
          <span>Past Reports</span>
        </Link>
      </div>

      {/* Stage 1: Upload / Capture Zone (shown when no result yet) */}
      {!analysisResult && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* If no photo chosen yet */}
          {!previewUrl ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 p-8 sm:p-12 text-center dark:border-stone-700">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-stone-900 dark:text-stone-100">
                Capture or Upload Tomato Lot Photo
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-stone-600 dark:text-stone-400">
                Take a clear picture of harvested tomatoes in natural light. Supports JPG, PNG, WEBP.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCameraModalOpen(true)}
                  className="touch-target inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-brand-800 transition"
                >
                  <Camera className="h-5 w-5" />
                  <span>{t('grading.openCamera', 'Open Camera')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="touch-target inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-5 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition"
                >
                  <Upload className="h-5 w-5 text-stone-500" />
                  <span>{t('grading.chooseGallery', 'Choose from Gallery')}</span>
                </button>
              </div>

              {isCompressing && (
                <p className="mt-4 text-xs font-semibold text-brand-700 animate-pulse">
                  {t('grading.optimizingPhoto', 'Optimizing photo size...')}
                </p>
              )}
            </div>
          ) : (
            /* Photo Preview & Analysis Trigger */
            <div className="space-y-5">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-xs dark:border-stone-800">
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="h-auto w-full object-contain"
                />
                <button
                  type="button"
                  onClick={resetAll}
                  className="touch-target absolute top-3 right-3 rounded-xl bg-stone-900/80 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-xs hover:bg-stone-900"
                >
                  Change Photo
                </button>
              </div>

              {/* Start AI Analysis CTA */}
              <div className="flex flex-col items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={analyzeMutation.isPending}
                  onClick={handleRunAnalysis}
                  className="touch-target flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 px-6 text-base font-bold text-white shadow-md hover:bg-brand-800 disabled:opacity-60 transition"
                >
                  {analyzeMutation.isPending ? (
                    <div className="flex items-center gap-2.5">
                      <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                      <span>Analyzing with YOLO11n AI Engine...</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      <span>Run AI Quality Assessment</span>
                      <ArrowRight className="h-4 w-4 opacity-75" />
                    </>
                  )}
                </button>
                <p className="text-xs text-stone-500">
                  Estimates fresh vs rotten count and computes AGMARK-aligned quality grade.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 2: Assessment Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Visual AI Bounding Box Overlay (7 cols) */}
            <div className="space-y-3 lg:col-span-7">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                YOLO Object Detection View
              </h3>
              <DetectionOverlay
                imageUrl={analysisResult.imageUrl || uploadUrl()}
                detections={analysisResult.result.detections}
              />
            </div>

            {/* Metrics Breakdown (5 cols) */}
            <div className="space-y-6 lg:col-span-5">
              <GradingMetricsCard result={analysisResult.result} />

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={!analysisResult.result.total || analysisResult.result.total === 0}
                  onClick={() => setCertDialogOpen(true)}
                  className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 px-4 text-base font-bold text-white shadow-md hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Award className="h-5 w-5" />
                  <span>Generate Digital Quality Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={resetAll}
                  className="touch-target flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Grade Another Batch (दूसरा बैच जांचें)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Certificate Generation Dialog */}
          <GenerateCertificateDialog
            open={certDialogOpen}
            gradingReportId={analysisResult.gradingReportId}
            grade={analysisResult.result.grade}
            onClose={() => setCertDialogOpen(false)}
          />
        </div>
      )}

      {/* Live Produce Camera Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={(file) => {
          processSelectedFile(file);
        }}
        onFallbackToFilePicker={() => {
          cameraInputRef.current?.click();
        }}
      />
    </div>
  );
}
