import { apiClient } from '@/lib/api';
import type { Certificate, PublicVerificationResponse } from '@/types';

export interface CertificatesListResponse {
  success: boolean;
  count: number;
  certificates: Certificate[];
}

export interface CertificateDetailResponse {
  success: boolean;
  certificate: Certificate;
}

export const certificateApi = {
  getMyCertificates: async (): Promise<CertificatesListResponse> => {
    return apiClient<CertificatesListResponse>('/api/certificates', {
      method: 'GET',
    });
  },

  getCertificateById: async (id: string): Promise<CertificateDetailResponse> => {
    return apiClient<CertificateDetailResponse>(`/api/certificates/${id}`, {
      method: 'GET',
    });
  },

  verifyCertificate: async (certificateId: string): Promise<PublicVerificationResponse> => {
    return apiClient<PublicVerificationResponse>(
      `/api/certificates/verify/${encodeURIComponent(certificateId)}`,
      { method: 'GET' }
    );
  },
};

