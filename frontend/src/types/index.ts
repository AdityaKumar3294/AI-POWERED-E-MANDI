// Derived directly from Backend & Model Specification

export type UserRole = "farmer" | "buyer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user: User;
}

export type ProduceGrade = "A" | "B" | "C";
export type ProduceSize = "small" | "medium" | "large" | "unknown";

export interface BoundingBoxDetection {
  class_id: number;
  class_name: "Fresh Tomato" | "Rotten Tomato";
  confidence: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface GradingResult {
  total: number;
  healthy: number;
  defective: number;
  defectPercentage: number;
  averageSize: ProduceSize;
  averageSizePixels?: number | null;
  grade: ProduceGrade;
  detections?: BoundingBoxDetection[]; // Spec gap 1: may be absent
}

export interface GradingReport {
  _id: string;
  farmerId: string | User;
  total: number;
  healthy: number;
  defective: number;
  defectPercentage: number;
  averageSize: ProduceSize;
  averageSizePixels?: number | null;
  grade: ProduceGrade;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  _id: string;
  certificateId: string;
  farmerId: string | User;
  gradingReportId: string | GradingReport;
  produceName: string;
  grade: ProduceGrade;
  totalProduce: number;
  healthyProduce: number;
  defectiveProduce: number;
  defectPercentage: number;
  averageSize: ProduceSize;
  issuedAt: string;
  valid: boolean;
  verificationUrl?: string;
  qrCodeDataUrl?: string;
  createdAt: string;
}

export type ProductStatus = "available" | "sold_out" | "inactive";

export interface Product {
  _id: string;
  farmerId: User;
  name: string;
  quantity: number;
  pricePerKg: number;
  grade: ProduceGrade;
  image?: string | null;
  status: ProductStatus;
  certificateId?: Certificate | null;
  gradingReportId?: GradingReport | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pending" | "confirmed" | "rejected" | "completed" | "cancelled";

export interface Order {
  _id: string;
  buyerId: User;
  farmerId: User;
  productId: Product;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerDashboardData {
  products: {
    total: number;
    available: number;
    soldOut: number;
    inactive: number;
    totalStockKg: number;
  };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    rejected: number;
    completed: number;
    cancelled: number;
  };
  sales: {
    completedSalesAmount: number;
    currency: string;
  };
  aiGrading: {
    totalReports: number;
    totalCertificates: number;
  };
  recentOrders: Order[];
}

export interface BuyerDashboardData {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    rejected: number;
    completed: number;
    cancelled: number;
  };
  spending: {
    completedOrdersAmount: number;
    currency: string;
  };
  recentOrders: Order[];
}

export interface PublicVerificationResponse {
  success: boolean;
  verified: boolean;
  message: string;
  certificate?: Certificate;
}

