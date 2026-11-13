import { useQuery } from '@tanstack/react-query';
import { certificateApi } from './api';

export const certificateKeys = {
  all: ['certificates'] as const,
  mine: () => [...certificateKeys.all, 'mine'] as const,
  detail: (id: string) => [...certificateKeys.all, 'detail', id] as const,
  verify: (certId: string) => [...certificateKeys.all, 'verify', certId] as const,
};

export function useMyCertificates() {
  return useQuery({
    queryKey: certificateKeys.mine(),
    queryFn: () => certificateApi.getMyCertificates(),
  });
}

export function useCertificate(id: string) {
  return useQuery({
    queryKey: certificateKeys.detail(id),
    queryFn: () => certificateApi.getCertificateById(id),
    enabled: Boolean(id),
  });
}

export function useVerifyCertificate(certificateId: string) {
  return useQuery({
    queryKey: certificateKeys.verify(certificateId),
    queryFn: () => certificateApi.verifyCertificate(certificateId),
    enabled: Boolean(certificateId),
    retry: false, // Don't retry if 404
  });
}

