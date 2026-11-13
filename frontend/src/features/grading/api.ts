import { apiClient } from '@/lib/api';
import type { GradingReport, GradingResult } from '@/types';

export interface AnalyzeGradingResponse {
  success: boolean;
  message: string;
  gradingReportId: string;
  result: GradingResult;
}

export interface GradingReportsResponse {
  success: boolean;
  count: number;
  reports: GradingReport[];
}

export interface GradingReportDetailResponse {
  success: boolean;
  report: GradingReport;
}

export const gradingApi = {
  analyzeImage: async (formData: FormData): Promise<AnalyzeGradingResponse> => {
    return apiClient<AnalyzeGradingResponse>('/api/grading/analyze', {
      method: 'POST',
      body: formData,
    });
  },

  getMyGradingReports: async (): Promise<GradingReportsResponse> => {
    return apiClient<GradingReportsResponse>('/api/grading/reports', {
      method: 'GET',
    });
  },

  getGradingReportById: async (id: string): Promise<GradingReportDetailResponse> => {
    return apiClient<GradingReportDetailResponse>(`/api/grading/reports/${id}`, {
      method: 'GET',
    });
  },
};

