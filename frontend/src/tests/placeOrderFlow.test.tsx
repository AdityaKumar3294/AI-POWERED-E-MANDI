import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { OrderForm } from '../features/products/components/OrderForm';
import { useAuthStore } from '../stores/auth';
import type { Product } from '@/types';

const mockProduct: Product = {
  _id: 'prod_test_101',
  farmerId: {
    id: 'farmer_1',
    name: 'Suresh Patil',
    email: 'farmer@demo.com',
    role: 'farmer',
    location: 'Solapur',
  },
  name: 'Premium Hybrid Tomatoes',
  quantity: 500,
  pricePerKg: 30,
  grade: 'A',
  status: 'available',
  createdAt: '2026-11-13T10:00:00Z',
  updatedAt: '2026-11-13T10:00:00Z',
};

let capturedRequestBody: any = null;

const server = setupServer(
  http.post('*/api/orders', async ({ request }) => {
    capturedRequestBody = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        _id: 'ord_mock_789',
        buyerId: 'buyer_1',
        farmerId: 'farmer_1',
        productId: 'prod_test_101',
        quantity: capturedRequestBody.quantity,
        pricePerKg: 30,
        totalAmount: capturedRequestBody.quantity * 30,
        status: 'pending',
        deliveryAddress: capturedRequestBody.deliveryAddress,
        createdAt: new Date().toISOString(),
      },
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  capturedRequestBody = null;
});
afterAll(() => server.close());

function renderOrderForm(product: Product = mockProduct) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrderForm product={product} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Place Order Flow Integration Test', () => {
  it('allows authenticated wholesale buyer to submit order with address and quantity', async () => {
    // Set buyer session in auth store
    useAuthStore.setState({
      token: 'fake-jwt-token',
      isAuthenticated: true,
      user: {
        id: 'buyer_1',
        name: 'Ramesh Wholesale',
        email: 'buyer@demo.com',
        role: 'buyer',
        location: 'Pune APMC',
      },
    });

    renderOrderForm();

    expect(screen.getByText(/Quantity/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivery/i)).toBeInTheDocument();

    const addressInput = screen.getByPlaceholderText(/Gala No\. 12, APMC/i);
    fireEvent.change(addressInput, {
      target: { value: 'Pune APMC Market Yard, Gate 2, Shop 14' },
    });

    const submitBtn = screen.getByRole('button', { name: /Confirm & Place Order/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(capturedRequestBody).not.toBeNull();
      expect(capturedRequestBody.productId).toBe('prod_test_101');
      expect(capturedRequestBody.deliveryAddress).toBe('Pune APMC Market Yard, Gate 2, Shop 14');
      expect(capturedRequestBody.quantity).toBeGreaterThan(0);
    });
  });

  it('displays sold-out button and disables submission when produce stock is depleted', () => {
    useAuthStore.setState({
      token: 'fake-jwt-token',
      isAuthenticated: true,
      user: {
        id: 'buyer_1',
        name: 'Ramesh Wholesale',
        email: 'buyer@demo.com',
        role: 'buyer',
        location: 'Pune APMC',
      },
    });

    const soldOutProduct: Product = {
      ...mockProduct,
      quantity: 0,
      status: 'sold_out',
    };

    renderOrderForm(soldOutProduct);

    const soldOutBtn = screen.getByRole('button', { name: /Sold Out/i });
    expect(soldOutBtn).toBeInTheDocument();
    expect(soldOutBtn).toBeDisabled();
  });
});
