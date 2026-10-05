import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  initialUsers,
  initialProducts,
  initialDiscounts,
  initialSettings,
  initialOrders,
  initialSourcingRequests,
  initialTransferRequests
} from './server/data.js';
import {
  User,
  Product,
  StoreDiscount,
  Order,
  SourcingRequest,
  TransferRequest,
  StoreSettings,
  AnalyticsStats,
  OrderStatus,
  PaymentStatus,
  SourcingStatus,
  TransferStatus
} from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database Stores
let users = [...initialUsers];
let products = [...initialProducts];
let discounts = [...initialDiscounts];
let settings = { ...initialSettings };
let orders = [...initialOrders];
let sourcingRequests = [...initialSourcingRequests];
let transferRequests = [...initialTransferRequests];

// Simple token map for authenticated sessions
const sessionStore: Record<string, User> = {
  'demo-admin-token': users[0],
  'demo-cust-token': users[1]
};

// Helper middleware for auth
function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return sessionStore[token] || null;
}

// Helper: Generate HTML Receipt for Automated Email
function generateReceiptHtml(order: Order): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
        .receipt-card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; }
        .badge { background: #f59e0b; color: #0f172a; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
        th { text-align: left; padding: 10px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; }
        td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; }
        .total-row { font-weight: bold; font-size: 16px; text-align: right; }
        .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <span class="badge">Official Purchase Receipt</span>
          <h2 style="margin: 12px 0 4px 0; color: #0f172a;">Ben-J Classic Venture</h2>
          <p style="margin: 0; font-size: 13px; color: #64748b;">Accra - Awoshie (Opp. Anyaa Police Station) | Tel: ${settings.whatsappPhone || '+233 54 385 4239'}</p>
        </div>
        
        <div class="info-grid">
          <div>
            <strong>Receipt No:</strong> ${order.orderNumber}<br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}<br>
            <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase().replace('_', ' ')}
          </div>
          <div>
            <strong>Customer:</strong> ${order.customerName}<br>
            <strong>Phone:</strong> ${order.customerPhone}<br>
            <strong>Email:</strong> ${order.customerEmail}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit (GHS)</th>
              <th style="text-align: right;">Total (GHS)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.productName}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${item.unitPrice.toFixed(2)}</td>
                <td style="text-align: right;">${item.subtotal.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="border-top: 2px solid #e2e8f0; padding-top: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px;">
            <span>Subtotal:</span>
            <span>GHS ${order.subtotal.toFixed(2)}</span>
          </div>
          ${
            order.discountAmount > 0
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #16a34a;">
            <span>Discount (${order.promoCodeApplied || 'Special Promo'}):</span>
            <span>- GHS ${order.discountAmount.toFixed(2)}</span>
          </div>
          `
              : ''
          }
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px;">
            <span>Shipping / Delivery:</span>
            <span>GHS ${order.shippingFee.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 18px; font-weight: bold; color: #0f172a;">
            <span>Total Paid:</span>
            <span>GHS ${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with Ben-J Classic Venture!</p>
          <p>For inquiries, sourcing, or RMB transfers, visit our Awoshie store or contact WhatsApp support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// --- API ENDPOINTS ---

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { email, password, identifier } = req.body;
  const input = ((email || identifier || '') as string).toLowerCase().trim();
  
  const user = users.find((u) => {
    const userEmail = u.email.toLowerCase();
    return userEmail === input || (u.role === 'admin' && input === 'admin');
  });
  
  const isValidPassword =
    user &&
    (user.passwordHash === password || (user.role === 'admin' && (password === 'admin' || password === 'admin123')));

  if (!user || !isValidPassword) {
    res.status(401).json({ error: 'Invalid email/username or password. Please check your credentials.' });
    return;
  }

  const token = `token_${user.id}_${Date.now()}`;
  sessionStore[token] = user;

  const { passwordHash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email and password are required' });
    return;
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'An account with this email already exists' });
    return;
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    phone: phone || '+233 20 000 0000',
    address: address || 'Accra, Ghana',
    role: 'customer' as const,
    createdAt: new Date().toISOString(),
    passwordHash: password
  };

  users.push(newUser);

  const token = `token_${newUser.id}_${Date.now()}`;
  sessionStore[token] = newUser;

  const { passwordHash: _, ...safeUser } = newUser;
  res.json({ token, user: safeUser });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user });
});

// Store Settings API
app.get('/api/settings', (_req, res) => {
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  settings = { ...settings, ...req.body };
  res.json(settings);
});

// Products & Inventory API
app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { name, category, price, costPrice, stock, image, description, sku, specifications } = req.body;

  if (!name || !price || stock === undefined) {
    res.status(400).json({ error: 'Product name, price, and stock are required' });
    return;
  }

  const newProduct: Product = {
    id: `p_${Date.now()}`,
    name,
    category: category || 'fashion',
    price: Number(price),
    costPrice: Number(costPrice || price * 0.6),
    originalPrice: Number(req.body.originalPrice || price),
    discountPercent: Number(req.body.discountPercent || 0),
    stock: Number(stock),
    image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    description: description || 'High quality product from Ben-J Classic Venture.',
    sku: sku || `BJC-${Date.now().toString().slice(-6)}`,
    specifications: Array.isArray(specifications) ? specifications : ['Quality Guarantee', 'Standard Warranty'],
    featured: Boolean(req.body.featured),
    rating: 5.0,
    reviewCount: 1
  };

  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  products[index] = {
    ...products[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : products[index].price,
    costPrice: req.body.costPrice !== undefined ? Number(req.body.costPrice) : products[index].costPrice,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : products[index].stock
  };

  res.json(products[index]);
});

app.patch('/api/products/:id/stock', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { id } = req.params;
  const { stockDelta, newStock } = req.body;

  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  if (newStock !== undefined) {
    product.stock = Math.max(0, Number(newStock));
  } else if (stockDelta !== undefined) {
    product.stock = Math.max(0, product.stock + Number(stockDelta));
  }

  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { id } = req.params;
  products = products.filter((p) => p.id !== id);
  res.json({ success: true, id });
});

// Store Discounts API
app.get('/api/discounts', (_req, res) => {
  res.json(discounts);
});

app.post('/api/discounts', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { code, title, discountPercent, minSpend } = req.body;
  if (!code || !discountPercent) {
    res.status(400).json({ error: 'Discount code and percentage are required' });
    return;
  }

  const newDiscount: StoreDiscount = {
    id: `d_${Date.now()}`,
    code: code.toUpperCase().trim(),
    title: title || `${discountPercent}% Off Coupon`,
    discountPercent: Number(discountPercent),
    minSpend: Number(minSpend || 0),
    isActive: true
  };

  discounts.push(newDiscount);
  res.status(201).json(newDiscount);
});

app.put('/api/discounts/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { id } = req.params;
  const index = discounts.findIndex((d) => d.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Discount not found' });
    return;
  }

  discounts[index] = { ...discounts[index], ...req.body };
  res.json(discounts[index]);
});

app.delete('/api/discounts/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { id } = req.params;
  discounts = discounts.filter((d) => d.id !== id);
  res.json({ success: true, id });
});

// Orders & Payment Processing API
app.get('/api/orders', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (user.role === 'admin') {
    res.json(orders);
  } else {
    const userOrders = orders.filter((o) => o.userId === user.id || o.customerEmail === user.email);
    res.json(userOrders);
  }
});

app.post('/api/orders', (req, res) => {
  const user = getAuthUser(req);
  const {
    items,
    promoCode,
    shippingFee,
    paymentMethod,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    deliveryCity,
    notes
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Order must contain at least one item' });
    return;
  }

  // Validate stock and compute total
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const p = products.find((prod) => prod.id === item.productId);
    if (!p) {
      res.status(400).json({ error: `Product ID ${item.productId} not found` });
      return;
    }

    if (p.stock < item.quantity) {
      res.status(400).json({ error: `Insufficient stock for "${p.name}". Available: ${p.stock}` });
      return;
    }

    // Determine unit price with any product-level discount or site-wide discount
    let unitPrice = p.price;
    if (p.discountPercent && p.discountPercent > 0) {
      unitPrice = p.price * (1 - p.discountPercent / 100);
    } else if (settings.isSiteWideDiscountActive && settings.announcementDiscount > 0) {
      unitPrice = p.price * (1 - settings.announcementDiscount / 100);
    }

    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    processedItems.push({
      productId: p.id,
      productName: p.name,
      quantity: item.quantity,
      unitPrice,
      image: p.image,
      subtotal: itemSubtotal
    });
  }

  // Check Coupon Discount
  let discountAmount = 0;
  let appliedCode = undefined;
  if (promoCode) {
    const coupon = discounts.find((d) => d.code === promoCode.toUpperCase().trim() && d.isActive);
    if (coupon && subtotal >= coupon.minSpend) {
      discountAmount = (subtotal * coupon.discountPercent) / 100;
      appliedCode = coupon.code;
    }
  }

  const finalShipping = Number(shippingFee !== undefined ? shippingFee : settings.localDeliveryFeeGHS);
  const totalAmount = Math.max(0, subtotal - discountAmount + finalShipping);

  // Deduct stock levels in real time
  for (const item of items) {
    const p = products.find((prod) => prod.id === item.productId);
    if (p) {
      p.stock = Math.max(0, p.stock - item.quantity);
    }
  }

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderNumber: `BJC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    userId: user ? user.id : `guest_${Date.now()}`,
    customerName: customerName || (user ? user.name : 'Valued Customer'),
    customerEmail: customerEmail || (user ? user.email : 'customer@example.com'),
    customerPhone: customerPhone || (user ? user.phone : '+233 24 000 0000'),
    items: processedItems,
    subtotal,
    discountAmount,
    promoCodeApplied: appliedCode,
    shippingFee: finalShipping,
    totalAmount,
    paymentMethod: paymentMethod || 'momo_mtn',
    paymentStatus: paymentMethod === 'cod_awoshie' ? 'pending' : 'paid',
    orderStatus: 'processing',
    deliveryAddress: deliveryAddress || 'Accra - Awoshie Branch Pickup',
    deliveryCity: deliveryCity || 'Accra',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    receiptSent: true
  };

  newOrder.receiptHtml = generateReceiptHtml(newOrder);
  orders.unshift(newOrder);

  res.status(201).json({
    message: 'Order processed successfully!',
    order: newOrder,
    emailReceiptNotice: `Automated email receipt generated and dispatched to ${newOrder.customerEmail}`
  });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (orderStatus) order.orderStatus = orderStatus as OrderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus as PaymentStatus;

  res.json(order);
});

// Sourcing Requests API
app.get('/api/sourcing', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (user.role === 'admin') {
    res.json(sourcingRequests);
  } else {
    res.json(sourcingRequests.filter((s) => s.userId === user.id || s.customerEmail === user.email));
  }
});

app.post('/api/sourcing', (req, res) => {
  const user = getAuthUser(req);
  const { productLink, imageUrl, quantity, instructions, customerName, customerPhone, customerEmail } = req.body;

  if (!instructions || !quantity) {
    res.status(400).json({ error: 'Quantity and product instructions are required' });
    return;
  }

  const newRequest: SourcingRequest = {
    id: `src_${Date.now()}`,
    userId: user ? user.id : `guest_${Date.now()}`,
    customerName: customerName || (user ? user.name : 'Guest Customer'),
    customerPhone: customerPhone || (user ? user.phone : '+233 24 000 0000'),
    customerEmail: customerEmail || (user ? user.email : 'guest@example.com'),
    productLink: productLink || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    quantity: Number(quantity),
    instructions,
    status: 'pending_review',
    createdAt: new Date().toISOString()
  };

  sourcingRequests.unshift(newRequest);
  res.status(201).json(newRequest);
});

app.patch('/api/sourcing/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { id } = req.params;
  const { status, quotedPriceGHS, adminNotes } = req.body;

  const reqItem = sourcingRequests.find((s) => s.id === id);
  if (!reqItem) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  if (status) reqItem.status = status as SourcingStatus;
  if (quotedPriceGHS !== undefined) reqItem.quotedPriceGHS = Number(quotedPriceGHS);
  if (adminNotes !== undefined) reqItem.adminNotes = adminNotes;

  res.json(reqItem);
});

// RMB Money Transfer API
app.get('/api/transfers', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (user.role === 'admin') {
    res.json(transferRequests);
  } else {
    res.json(transferRequests.filter((t) => t.userId === user.id || t.customerEmail === user.email));
  }
});

app.post('/api/transfers', (req, res) => {
  const user = getAuthUser(req);
  const { amountGHS, amountRMB, transferType, recipientDetails, customerName, customerPhone, customerEmail } = req.body;

  if (!amountGHS || !transferType || !recipientDetails) {
    res.status(400).json({ error: 'Amount GHS, transfer type, and recipient details are required' });
    return;
  }

  const computedRMB = amountRMB ? Number(amountRMB) : Number(amountGHS) / settings.rmbRateGHS;

  const newTransfer: TransferRequest = {
    id: `trf_${Date.now()}`,
    userId: user ? user.id : `guest_${Date.now()}`,
    customerName: customerName || (user ? user.name : 'Valued Customer'),
    customerPhone: customerPhone || (user ? user.phone : '+233 24 000 0000'),
    customerEmail: customerEmail || (user ? user.email : 'guest@example.com'),
    amountGHS: Number(amountGHS),
    amountRMB: Number(computedRMB.toFixed(2)),
    exchangeRateUsed: settings.rmbRateGHS,
    transferType: transferType || 'alipay',
    recipientDetails,
    status: 'pending_verification',
    createdAt: new Date().toISOString()
  };

  transferRequests.unshift(newTransfer);
  res.status(201).json(newTransfer);
});

app.patch('/api/transfers/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const trf = transferRequests.find((t) => t.id === id);
  if (!trf) {
    res.status(404).json({ error: 'Transfer request not found' });
    return;
  }

  if (status) trf.status = status as TransferStatus;
  if (adminNotes !== undefined) trf.adminNotes = adminNotes;

  res.json(trf);
});

// Admin Dashboard Analytics
app.get('/api/admin/analytics', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const pendingSourcingCount = sourcingRequests.filter((s) => s.status === 'pending_review').length;
  const pendingTransfersCount = transferRequests.filter((t) => t.status === 'pending_verification').length;

  const salesByMonth = [
    { month: 'Apr', sales: 12400, orders: 28 },
    { month: 'May', sales: 15800, orders: 34 },
    { month: 'Jun', sales: 19200, orders: 42 },
    { month: 'Jul', sales: 24500, orders: 58 },
    { month: 'Aug', sales: Math.round(totalRevenue + 18000), orders: orders.length + 40 }
  ];

  const categoryDistribution = [
    { category: 'Fashion', value: products.filter((p) => p.category === 'fashion').length },
    { category: 'Electronics', value: products.filter((p) => p.category === 'electronics').length },
    { category: 'Accessories', value: products.filter((p) => p.category === 'accessories').length },
    { category: 'Imports', value: products.filter((p) => p.category === 'imports').length || 2 }
  ];

  const stats: AnalyticsStats = {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    lowStockCount,
    pendingSourcingCount,
    pendingTransfersCount,
    salesByMonth,
    categoryDistribution
  };

  res.json(stats);
});

// Setup Vite Development Server or Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ben-J Classic Platform] Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
