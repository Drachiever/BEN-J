import { Product, StoreDiscount, Order, SourcingRequest, TransferRequest, StoreSettings, User } from '../src/types.js';

export const initialUsers: (User & { passwordHash: string })[] = [
  {
    id: 'user_admin_1',
    name: 'Benjamin Awoshie (Admin)',
    email: 'admin@benjclassic.com',
    role: 'admin',
    phone: '+233 54 385 4239',
    address: 'Ben-J Classic Venture, Accra - Awoshie (Opp. Anyaa Police Station)',
    createdAt: new Date().toISOString(),
    passwordHash: 'admin'
  },
  {
    id: 'user_cust_1',
    name: 'Kofi Mensah',
    email: 'customer@benjclassic.com',
    role: 'customer',
    phone: '+233 50 987 6543',
    address: 'House No. 14, East Legon, Accra',
    createdAt: new Date().toISOString(),
    passwordHash: 'customer123'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'p1',
    name: "Classic Oxford Leather Men's Shoes",
    category: 'fashion',
    price: 450,
    costPrice: 280,
    originalPrice: 500,
    discountPercent: 10,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
    description: 'Premium handcrafted genuine leather shoes suitable for corporate, wedding, and formal occasions. Durable Italian rubber sole with comfortable cushion insole.',
    sku: 'BJC-FASH-001',
    specifications: ['100% Genuine Leather', 'Sizes: 40 - 45', 'Color: Deep Tan / Mahogany', 'Hand-stitched finish'],
    featured: true,
    rating: 4.9,
    reviewCount: 38
  },
  {
    id: 'p2',
    name: 'Slim Fit Premium Corporate Shirt',
    category: 'fashion',
    price: 180,
    costPrice: 95,
    originalPrice: 220,
    discountPercent: 18,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    description: 'Wrinkle-resistant Egyptian cotton business shirt with sleek spread collar and adjustable cuffs. Perfect for daily office wear.',
    sku: 'BJC-FASH-002',
    specifications: ['Material: 100% Egyptian Cotton', 'Fit: Slim Fit', 'Breathable & Easy Iron', 'Sizes: M, L, XL, XXL'],
    featured: true,
    rating: 4.8,
    reviewCount: 42
  },
  {
    id: 'p3',
    name: 'Smart Fitness Watch V8 Pro (AMOLED)',
    category: 'electronics',
    price: 320,
    costPrice: 170,
    originalPrice: 400,
    discountPercent: 20,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    description: 'Full touch HD AMOLED display smartwatch with heart rate monitoring, sleep tracker, Bluetooth calling, and 7-day battery life.',
    sku: 'BJC-ELEC-001',
    specifications: ['1.43" AMOLED Display', 'IP68 Waterproof', 'Bluetooth 5.3 Calling', 'iOS & Android Compatible'],
    featured: true,
    rating: 4.7,
    reviewCount: 56
  },
  {
    id: 'p4',
    name: 'Active Noise Cancelling Wireless Earbuds TWS',
    category: 'electronics',
    price: 250,
    costPrice: 120,
    originalPrice: 300,
    discountPercent: 16,
    stock: 4, // Low stock alert
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    description: 'Immersive spatial audio with active noise cancellation up to 35dB, quad microphone ENC for ultra-clear calls, and 30-hour total playback with charging case.',
    sku: 'BJC-ELEC-002',
    specifications: ['35dB Active Noise Cancellation', 'Quad Mic ENC Call Noise Reduction', 'USB-C Fast Charge', 'Touch Controls'],
    featured: true,
    rating: 4.9,
    reviewCount: 81
  },
  {
    id: 'p5',
    name: 'Urban Casual Streetwear Sneakers',
    category: 'fashion',
    price: 380,
    costPrice: 210,
    originalPrice: 420,
    discountPercent: 10,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    description: 'High-performance casual sneakers featuring breathable mesh upper and shock-absorbing air cushioned sole. Ideal for active street style.',
    sku: 'BJC-FASH-003',
    specifications: ['Air-cushioned TPU outsole', 'Breathable knit fabric', 'Lightweight design', 'Sizes: 39 - 46'],
    featured: false,
    rating: 4.6,
    reviewCount: 29
  },
  {
    id: 'p6',
    name: 'Pro Aluminum Laptop Stand & USB-C Dock',
    category: 'electronics',
    price: 210,
    costPrice: 110,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    description: 'Ergonomic foldable aluminum laptop stand with integrated 6-in-1 USB-C hub (HDMI 4K, 100W PD Power, USB 3.0 ports).',
    sku: 'BJC-ELEC-003',
    specifications: ['Aircraft grade alloy', 'Supports up to 17.3" laptops', 'Dual cooling vents', 'Foldable & Portable'],
    featured: false,
    rating: 4.8,
    reviewCount: 19
  },
  {
    id: 'p7',
    name: 'Magnetic Wireless Power Bank 20,000mAh',
    category: 'electronics',
    price: 290,
    costPrice: 140,
    originalPrice: 350,
    discountPercent: 17,
    stock: 3, // Low stock alert
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&q=80',
    description: 'Ultra-fast 22.5W MagSafe compatible wireless charging battery pack with digital LED battery percentage monitor.',
    sku: 'BJC-ELEC-004',
    specifications: ['20,000mAh Lithium Polymer', '15W Wireless + 22.5W Wired', 'Pass-through charging', 'Dual USB-C & USB-A'],
    featured: true,
    rating: 4.9,
    reviewCount: 64
  },
  {
    id: 'p8',
    name: 'Executive Italian Leather Briefcase & Portfolio',
    category: 'accessories',
    price: 520,
    costPrice: 310,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    description: 'Spacious leather laptop briefcase with padded compartment for 15.6" laptops, RFID protection pocket, and detachable shoulder strap.',
    sku: 'BJC-ACC-001',
    specifications: ['Full grain bovine leather', 'Fits 15.6" MacBooks/Laptops', 'Water-resistant treatment', 'Heavy-duty brass zippers'],
    featured: false,
    rating: 5.0,
    reviewCount: 14
  }
];

export const initialDiscounts: StoreDiscount[] = [
  {
    id: 'd1',
    code: 'BENJ10',
    title: 'Storewide 10% Off',
    discountPercent: 10,
    minSpend: 100,
    isActive: true
  },
  {
    id: 'd2',
    code: 'BENJ20',
    title: 'VIP 20% Discount for Orders > GHS 500',
    discountPercent: 20,
    minSpend: 500,
    isActive: true
  },
  {
    id: 'd3',
    code: 'AWOSHIE5',
    title: 'Awoshie Branch Special 5% Off',
    discountPercent: 5,
    minSpend: 50,
    isActive: true
  }
];

export const initialSettings: StoreSettings = {
  rmbRateGHS: 2.20,
  usdRateGHS: 14.50,
  airFreightRateUSD: 12.00,
  expressAirRateUSD: 16.00,
  localDeliveryFeeGHS: 25.00,
  shopNotice: 'Visit our Physical Shop: Accra - Awoshie (Opposite Anyaa Police Station) | Tel: +233 54 385 4239',
  announcementDiscount: 15,
  isSiteWideDiscountActive: true
};

export const initialOrders: Order[] = [
  {
    id: 'ord_1001',
    orderNumber: 'BJC-2026-89412',
    userId: 'user_cust_1',
    customerName: 'Kofi Mensah',
    customerEmail: 'customer@benjclassic.com',
    customerPhone: '+233 50 987 6543',
    items: [
      {
        productId: 'p1',
        productName: "Classic Oxford Leather Men's Shoes",
        quantity: 1,
        unitPrice: 405, // After 10% discount
        image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
        subtotal: 405
      },
      {
        productId: 'p4',
        productName: 'Active Noise Cancelling Wireless Earbuds TWS',
        quantity: 1,
        unitPrice: 210,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        subtotal: 210
      }
    ],
    subtotal: 615,
    discountAmount: 61.5,
    promoCodeApplied: 'BENJ10',
    shippingFee: 25,
    totalAmount: 578.5,
    paymentMethod: 'momo_mtn',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    deliveryAddress: 'House No. 14, East Legon',
    deliveryCity: 'Accra',
    notes: 'Please call before arriving.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    receiptSent: true
  }
];

export const initialSourcingRequests: SourcingRequest[] = [
  {
    id: 'src_2001',
    userId: 'user_cust_1',
    customerName: 'Kofi Mensah',
    customerPhone: '+233 50 987 6543',
    customerEmail: 'customer@benjclassic.com',
    productLink: 'https://detail.1688.com/offer/7289381.html',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    quantity: 50,
    instructions: 'Need 50 units of smartwatch series 9 in black and rose gold. Check battery specs.',
    status: 'quoted',
    quotedPriceGHS: 4200,
    adminNotes: 'Supplier confirmed stock in Guangzhou warehouse. Lead time 7 days by air.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const initialTransferRequests: TransferRequest[] = [
  {
    id: 'trf_3001',
    userId: 'user_cust_1',
    customerName: 'Kofi Mensah',
    customerPhone: '+233 50 987 6543',
    customerEmail: 'customer@benjclassic.com',
    amountGHS: 2200,
    amountRMB: 1000,
    exchangeRateUsed: 2.20,
    transferType: 'alipay',
    recipientDetails: 'Alipay Account: +86 138 9988 7766 (Guangzhou Trading Co.)',
    status: 'completed',
    adminNotes: 'Dispatched 1,000 RMB via Alipay. Transaction ID: ALIPAY-20260805-998',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];
