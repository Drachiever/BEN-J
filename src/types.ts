export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'fashion' | 'electronics' | 'imports' | 'accessories';
  price: number; // Current selling price in GHS
  costPrice: number; // Cost price in GHS
  originalPrice?: number; // Pre-discount price if on sale
  discountPercent?: number; // Dynamic discount %
  stock: number;
  image: string;
  description: string;
  sku: string;
  specifications: string[];
  featured?: boolean;
  rating: number;
  reviewCount: number;
}

export interface StoreDiscount {
  id: string;
  code: string;
  title: string;
  discountPercent: number;
  minSpend: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  image: string;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'momo_mtn' | 'momo_telecel' | 'momo_at' | 'card' | 'cod_awoshie';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCodeApplied?: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddress: string;
  deliveryCity: string;
  notes?: string;
  createdAt: string;
  receiptSent: boolean;
  receiptHtml?: string;
}

export type SourcingStatus = 'pending_review' | 'quoted' | 'sourced' | 'in_transit' | 'arrived' | 'delivered';

export interface SourcingRequest {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productLink?: string;
  imageUrl?: string;
  quantity: number;
  instructions: string;
  status: SourcingStatus;
  quotedPriceGHS?: number;
  adminNotes?: string;
  createdAt: string;
}

export type TransferStatus = 'pending_verification' | 'payment_received' | 'rmb_dispatched' | 'completed' | 'failed';

export interface TransferRequest {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amountGHS: number;
  amountRMB: number;
  exchangeRateUsed: number;
  transferType: 'alipay' | 'wechat' | 'china_bank';
  recipientDetails: string;
  status: TransferStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingSourcingCount: number;
  pendingTransfersCount: number;
  salesByMonth: { month: string; sales: number; orders: number }[];
  categoryDistribution: { category: string; value: number }[];
}

export interface StoreSettings {
  rmbRateGHS: number; // e.g. 2.20
  usdRateGHS: number; // e.g. 14.50
  airFreightRateUSD: number; // e.g. 12/kg
  expressAirRateUSD: number; // e.g. 16/kg
  localDeliveryFeeGHS: number; // e.g. 25
  shopNotice: string;
  announcementDiscount: number; // e.g., site-wide discount %
  isSiteWideDiscountActive: boolean;
  whatsappPhone: string;
}
