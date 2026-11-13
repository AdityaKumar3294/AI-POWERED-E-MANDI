import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import PublicVerifyPage from '../features/certificates/pages/PublicVerifyPage';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderVerifyPage(certId: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/verify/${certId}`]}>
        <Routes>
          <Route path="/verify/:certificateId" element={<PublicVerifyPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Public Certificate Verification - 3 States', () => {
  it('renders State 1 (Verified & Active) when certificate is valid', async () => {
    server.use(
      http.get('*/api/certificates/verify/:id', () => {
        return HttpResponse.json({
          success: true,
          verified: true,
          message: 'Certificate is valid and active',
          certificate: {
            _id: 'cert_valid_123',
            certificateId: 'EM-VALID-99',
            produceName: 'Desi Hybrid Tomatoes',
            grade: 'A',
            defectPercentage: 3.2,
            healthyProduce: 28,
            defectiveProduce: 1,
            totalProduce: 29,
            averageSize: 'medium',
            valid: true,
            farmerId: {
              name: 'Suresh Patil',
              location: 'Solapur, Maharashtra',
            },
            issuedAt: '2026-11-13T10:00:00Z',
          },
        });
      })
    );

    renderVerifyPage('EM-VALID-99');

    await waitFor(() => {
      expect(screen.getByText(/Official Quality Certificate/i)).toBeInTheDocument();
      expect(screen.getByText(/VERIFIED AUTHENTIC & ACTIVE ON E-MANDI/i)).toBeInTheDocument();
      expect(screen.getByText(/Suresh Patil/i)).toBeInTheDocument();
      expect(screen.getByText(/Solapur, Maharashtra/i)).toBeInTheDocument();
    });
  });

  it('renders State 2 (Revoked or Invalid) when certificate validity is false', async () => {
    server.use(
      http.get('*/api/certificates/verify/:id', () => {
        return HttpResponse.json({
          success: true,
          verified: false,
          message: 'Certificate has been revoked or expired',
          certificate: {
            _id: 'cert_revoked_456',
            certificateId: 'EM-REVOKED-01',
            valid: false,
          },
        });
      })
    );

    renderVerifyPage('EM-REVOKED-01');

    await waitFor(() => {
      expect(screen.getByText(/Certificate Revoked or Invalid/i)).toBeInTheDocument();
      expect(screen.getByText(/was found, but has been invalidated or expired/i)).toBeInTheDocument();
    });
  });

  it('renders State 3 (Not Found / 404) when certificate does not exist', async () => {
    server.use(
      http.get('*/api/certificates/verify/:id', () => {
        return new HttpResponse(
          JSON.stringify({
            success: false,
            message: 'Certificate not found',
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );

    renderVerifyPage('EM-FAKE-404');

    await waitFor(() => {
      expect(screen.getByText(/Certificate Not Found/i)).toBeInTheDocument();
      expect(
        screen.getByText(/does not exist in the official E-Mandi registry/i)
      ).toBeInTheDocument();
    });
  });
});

