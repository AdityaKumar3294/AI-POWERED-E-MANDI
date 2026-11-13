import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gradingApi } from './api';

export const gradingKeys = {
  all: ['grading'] as const,
  reports: () => [...gradingKeys.all, 'reports'] as const,
  report: (id: string) => [...gradingKeys.all, 'report', id] as const,
};

export function useGradingReports() {
  return useQuery({
    queryKey: gradingKeys.reports(),
    queryFn: () => gradingApi.getMyGradingReports(),
  });
}

export function useGradingReport(id: string) {
  return useQuery({
    queryKey: gradingKeys.report(id),
    queryFn: () => gradingApi.getGradingReportById(id),
    enabled: Boolean(id),
  });
}

export function useAnalyzeGrading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => gradingApi.analyzeImage(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradingKeys.reports() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Crop grading completed successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'AI grading analysis failed. Ensure the tomato image is clear.');
    },
  });
}

