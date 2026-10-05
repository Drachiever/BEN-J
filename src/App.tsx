import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BannerNotice } from './components/BannerNotice';
import { RetailShop } from './components/RetailShop';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ChinaImportSection } from './components/ChinaImportSection';
import { MoneyTransferSection } from './components/MoneyTransferSection';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Product, StoreDiscount, StoreSettings, Order, SourcingRequest, TransferRequest, User } from './types';
import { MapPin, Phone, Mail, Clock, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'shop' | 'import' | 'transfer' | 'customer' | 'admin'>('shop');

  // User Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Store Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<StoreDiscount[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    rmbRateGHS: 2.20,
    usdRateGHS: 14.50,
    airFreightRateUSD: 12.00,
    expressAirRateUSD: 16.00,
    localDeliveryFeeGHS: 25.00,
    shopNotice: 'Visit our Physical Shop: Accra - Awoshie (Opposite Anyaa Police Station) | Tel: +233 54 385 4239',
    announcementDiscount: 10,
    isSiteWideDiscountActive: true,
    whatsappPhone: '+233 54 385 4239'
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [sourcingRequests, setSourcingRequests] = useState<SourcingRequest[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);

  // Cart & Modal States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPromo, setCheckoutPromo] = useState<string | undefined>(undefined);
  const [checkoutDiscountGHS, setCheckoutDiscountGHS] = useState<number>(0);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      // Products
      const pRes = await fetch('/api/products');
      if (pRes.ok) setProducts(await pRes.json());

      // Discounts
      const dRes = await fetch('/api/discounts');
      if (dRes.ok) setDiscounts(await dRes.json());

      // Settings
      const sRes = await fetch('/api/settings');
      if (sRes.ok) setSettings(await sRes.json());

      // Authenticated User & User Data
      const token = localStorage.getItem('benj_token');
      if (token) {
        const uRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (uRes.ok) {
          const uData = await uRes.json();
          setUser(uData.user);

          // Orders
          const oRes = await fetch('/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (oRes.ok) setOrders(await oRes.json());

          // Sourcing Requests
          const srcRes = await fetch('/api/sourcing', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (srcRes.ok) setSourcingRequests(await srcRes.json());

          // Transfer Requests
          const trfRes = await fetch('/api/transfers', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (trfRes.ok) setTransferRequests(await trfRes.json());
        } else {
          localStorage.removeItem('benj_token');
        }
      }
    } catch (e) {
      console.error('Error loading store data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prevCart, { product, quantity: Math.min(product.stock, quantity) }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(item.product.stock, newQty) } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleProceedToCheckout = (promoCodeApplied?: string, appliedDiscountGHS: number = 0) => {
    setCheckoutPromo(promoCodeApplied);
    setCheckoutDiscountGHS(appliedDiscountGHS);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (_order: Order) => {
    setCart([]);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('benj_token');
    setUser(null);
    setActiveTab('shop');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased selection:bg-amber-500 selection:text-slate-900">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        settings={settings}
      />

      {/* Notice Banner */}
      <BannerNotice settings={settings} />

      {/* Main App Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        
        {/* Tab 1: Retail Shop */}
        {activeTab === 'shop' && (
          <RetailShop
            products={products}
            settings={settings}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {/* Tab 2: China Imports */}
        {activeTab === 'import' && (
          <ChinaImportSection
            settings={settings}
            user={user}
            userSourcingRequests={sourcingRequests}
            onRequestSubmitted={fetchData}
          />
        )}

        {/* Tab 3: Money Transfer */}
        {activeTab === 'transfer' && (
          <MoneyTransferSection
            settings={settings}
            user={user}
            userTransfers={transferRequests}
            onTransferSubmitted={fetchData}
          />
        )}

        {/* Tab 4: Customer Dashboard */}
        {activeTab === 'customer' && user && (
          <CustomerDashboard
            user={user}
            orders={orders}
            sourcingRequests={sourcingRequests}
            transferRequests={transferRequests}
            onViewReceipt={(ord) => setSelectedReceiptOrder(ord)}
            onGoToShop={() => setActiveTab('shop')}
          />
        )}

        {/* Tab 5: Admin Dashboard */}
        {activeTab === 'admin' && user?.role === 'admin' && (
          <AdminDashboard
            products={products}
            discounts={discounts}
            orders={orders}
            sourcingRequests={sourcingRequests}
            transferRequests={transferRequests}
            settings={settings}
            onRefreshData={fetchData}
            onViewReceipt={(ord) => setSelectedReceiptOrder(ord)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm py-8 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 text-slate-900 p-2 rounded-lg font-bold text-xl leading-none shadow-sm">B-J</div>
              <div>
                <h4 className="text-white font-bold text-base leading-none">Ben-J Classic Venture</h4>
                <span className="text-xs text-amber-400 block mt-0.5">Fashion • Tech • Importations</span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Your trusted partner for high-quality corporate fashion, modern consumer electronics, and reliable import/export services between China and Ghana.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-base mb-2">Visit Our Shop</h4>
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Accra - Awoshie (Opposite Anyaa Police Station)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{settings.whatsappPhone || '+233 54 385 4239'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>achiverbuabeng@gmail.com</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-base mb-2">Business Hours</h4>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Monday - Saturday: 8:00 AM - 7:00 PM</span>
            </div>
            <p className="text-slate-400 text-xs pt-1">Sunday: 12:00 PM - 5:00 PM</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-base mb-2">Connect With Us</h4>
            <div className="flex gap-4 text-lg text-white font-bold">
              <a href="https://urlis.net/d3xpjara" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Facebook</a>
              <a href="https://bit.ly/39RxOtE" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Instagram</a>
              <a href="https://bit.ly/3olbv84" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">TikTok</a>
              <a href="https://bit.ly/3A0hscO" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Snapchat</a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-slate-400 text-xs gap-2">
          <span>&copy; {new Date().getFullYear()} Ben-J Classic Venture. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Secure Payment Platform
          </span>
        </div>
      </footer>

      {/* Floating Action Cart Button on Mobile */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden">
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-slate-900 text-amber-400 p-4 rounded-full shadow-2xl border-2 border-amber-500 flex items-center justify-center relative animate-bounce"
        >
          <ShoppingBag className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        settings={settings}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        discounts={discounts}
        settings={settings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        promoCodeApplied={checkoutPromo}
        promoDiscountGHS={checkoutDiscountGHS}
        deliveryFee={settings.localDeliveryFeeGHS}
        user={user}
        onOrderCompleted={handleOrderCompleted}
        onViewReceipt={(order) => {
          setIsCheckoutOpen(false);
          setSelectedReceiptOrder(order);
        }}
      />

      <ReceiptModal
        order={selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        settings={settings}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchData();
          if (loggedUser.role === 'admin') {
            setActiveTab('admin');
          } else {
            setActiveTab('customer');
          }
        }}
      />

    </div>
  );
}
