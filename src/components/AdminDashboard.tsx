import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Package, AlertCircle, ShoppingCart, Plus, Edit, Trash2, Tag,
  Clock, DollarSign, Settings, Check, RefreshCw, FileText, Send, Plane, Search,
  HardDrive, Image as ImageIcon, ExternalLink, FileSpreadsheet
} from 'lucide-react';
import {
  Product, StoreDiscount, Order, SourcingRequest, TransferRequest, StoreSettings, AnalyticsStats
} from '../types';
import {
  openGoogleDrivePicker,
  exportInventoryToGoogleSheet,
  syncStockFromGoogleSheet,
  backupInventoryToDrive
} from '../lib/googleWorkspace';
import { getCachedOAuthToken, signInWithGoogleOAuth } from '../lib/firebase';

interface AdminDashboardProps {
  products: Product[];
  discounts: StoreDiscount[];
  orders: Order[];
  sourcingRequests: SourcingRequest[];
  transferRequests: TransferRequest[];
  settings: StoreSettings;
  onRefreshData: () => void;
  onViewReceipt: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  discounts,
  orders,
  sourcingRequests,
  transferRequests,
  settings,
  onRefreshData,
  onViewReceipt
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'inventory' | 'discounts' | 'orders' | 'requests' | 'settings'>('analytics');
  
  // Analytics stats
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  // Modal / Form States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'fashion' | 'electronics' | 'accessories' | 'imports'>('fashion');
  const [prodPrice, setProdPrice] = useState<number>(100);
  const [prodCostPrice, setProdCostPrice] = useState<number>(60);
  const [prodStock, setProdStock] = useState<number>(20);
  const [prodImage, setProdImage] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodDiscountPercent, setProdDiscountPercent] = useState<number>(0);

  // Promo Code Form State
  const [discCode, setDiscCode] = useState('');
  const [discTitle, setDiscTitle] = useState('');
  const [discPercent, setDiscPercent] = useState<number>(10);
  const [discMinSpend, setDiscMinSpend] = useState<number>(100);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });

  // Filter Search
  const [orderSearch, setOrderSearch] = useState('');

  // Google Workspace Integration State
  const [linkedSheetId, setLinkedSheetId] = useState<string>(localStorage.getItem('linked_sheet_id') || '');
  const [googleActionStatus, setGoogleActionStatus] = useState<{ loading: boolean; message: string; type: 'success' | 'error' | 'info' | null }>({
    loading: false,
    message: '',
    type: null
  });

  // Helper to get OAuth token or prompt sign in
  const getOrPromptOAuthToken = async (): Promise<string | null> => {
    let token = getCachedOAuthToken();
    if (!token) {
      try {
        const authRes = await signInWithGoogleOAuth();
        token = authRes.accessToken;
      } catch (e: any) {
        setGoogleActionStatus({
          loading: false,
          message: 'Please sign in with Google to grant Drive & Sheets permissions.',
          type: 'error'
        });
        return null;
      }
    }
    return token;
  };

  // Google Picker for Product Image
  const handlePickProductImageFromDrive = async () => {
    const token = await getOrPromptOAuthToken();
    if (!token) return;

    try {
      await openGoogleDrivePicker(token, (file) => {
        setProdImage(file.url);
        setGoogleActionStatus({
          loading: false,
          message: `Selected image "${file.name}" from Google Drive!`,
          type: 'success'
        });
      });
    } catch (err: any) {
      setGoogleActionStatus({
        loading: false,
        message: err.message || 'Failed to open Google Drive Picker',
        type: 'error'
      });
    }
  };

  // Export Stock Inventory to Google Sheets
  const handleExportStockToSheet = async () => {
    const token = await getOrPromptOAuthToken();
    if (!token) return;

    setGoogleActionStatus({ loading: true, message: 'Creating Google Sheet & exporting inventory...', type: 'info' });
    try {
      const result = await exportInventoryToGoogleSheet(token, products, 'Ben-J Classic Stock Levels');
      setLinkedSheetId(result.spreadsheetId);
      localStorage.setItem('linked_sheet_id', result.spreadsheetId);

      setGoogleActionStatus({
        loading: false,
        message: `Stock inventory exported! Sheet URL: ${result.spreadsheetUrl}`,
        type: 'success'
      });
    } catch (err: any) {
      setGoogleActionStatus({
        loading: false,
        message: err.message || 'Failed to export to Google Sheets',
        type: 'error'
      });
    }
  };

  // Sync Stock Levels from Google Sheet
  const handleSyncStockFromSheet = async () => {
    const targetSheetId = linkedSheetId.trim();
    if (!targetSheetId) {
      alert('Please enter or create a linked Google Sheet ID first.');
      return;
    }

    const token = await getOrPromptOAuthToken();
    if (!token) return;

    setGoogleActionStatus({ loading: true, message: 'Reading stock values from Google Sheet...', type: 'info' });
    try {
      const { updatedCount, stockMap } = await syncStockFromGoogleSheet(token, targetSheetId);

      // Apply stock updates to products
      for (const p of products) {
        const newStock = stockMap[p.id] ?? stockMap[p.sku];
        if (newStock !== undefined && newStock !== p.stock) {
          const delta = newStock - p.stock;
          await handleUpdateStock(p.id, delta);
        }
      }

      setGoogleActionStatus({
        loading: false,
        message: `Successfully synced stock levels for ${updatedCount} products from Google Sheet!`,
        type: 'success'
      });
      onRefreshData();
    } catch (err: any) {
      setGoogleActionStatus({
        loading: false,
        message: err.message || 'Failed to sync stock from Google Sheet',
        type: 'error'
      });
    }
  };

  // Backup Data to Google Drive
  const handleBackupToDrive = async () => {
    const token = await getOrPromptOAuthToken();
    if (!token) return;

    setGoogleActionStatus({ loading: true, message: 'Uploading JSON backup to Google Drive...', type: 'info' });
    try {
      const res = await backupInventoryToDrive(token, products, orders);
      setGoogleActionStatus({
        loading: false,
        message: `Inventory & Orders backup created on Google Drive!`,
        type: 'success'
      });
    } catch (err: any) {
      setGoogleActionStatus({
        loading: false,
        message: err.message || 'Backup to Google Drive failed',
        type: 'error'
      });
    }
  };

  // Fetch Analytics Stats
  useEffect(() => {
    fetch('/api/admin/analytics', {
      headers: {
        ...(localStorage.getItem('benj_token') ? { Authorization: `Bearer ${localStorage.getItem('benj_token')}` } : {})
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {});
  }, [orders, products]);

  // Handle Real-Time Stock Level Update
  const handleUpdateStock = async (productId: string, stockDelta: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('benj_token')}`
        },
        body: JSON.stringify({ stockDelta })
      });
      if (res.ok) onRefreshData();
    } catch (e) {}
  };

  // Handle Product Create / Update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      costPrice: Number(prodCostPrice),
      stock: Number(prodStock),
      image: prodImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      description: prodDescription,
      sku: prodSku || `BJC-${Date.now().toString().slice(-6)}`,
      discountPercent: Number(prodDiscountPercent)
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('benj_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        onRefreshData();
      }
    } catch (e) {}
  };

  const resetProductForm = () => {
    setProdName('');
    setProdCategory('fashion');
    setProdPrice(100);
    setProdCostPrice(60);
    setProdStock(20);
    setProdImage('');
    setProdDescription('');
    setProdSku('');
    setProdDiscountPercent(0);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.price);
    setProdCostPrice(p.costPrice);
    setProdStock(p.stock);
    setProdImage(p.image);
    setProdDescription(p.description);
    setProdSku(p.sku);
    setProdDiscountPercent(p.discountPercent || 0);
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('benj_token')}` }
      });
      onRefreshData();
    } catch (e) {}
  };

  // Add Promo Code
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('benj_token')}`
        },
        body: JSON.stringify({
          code: discCode,
          title: discTitle,
          discountPercent: Number(discPercent),
          minSpend: Number(discMinSpend)
        })
      });

      if (res.ok) {
        setShowAddDiscountModal(false);
        setDiscCode('');
        setDiscTitle('');
        onRefreshData();
      }
    } catch (e) {}
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('benj_token')}`
        },
        body: JSON.stringify({ orderStatus })
      });
      onRefreshData();
    } catch (e) {}
  };

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('benj_token')}`
        },
        body: JSON.stringify(settingsForm)
      });
      onRefreshData();
      alert('Store settings updated successfully!');
    } catch (e) {}
  };

  const totalRevenueGHS = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wider block">
            Ben-J Classic Administration Portal
          </span>
          <h2 className="text-2xl font-black text-white">Store & Inventory Control Center</h2>
        </div>

        <button
          onClick={onRefreshData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Sync Data</span>
        </button>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'analytics', label: 'Analytics & Overview', icon: TrendingUp },
          { id: 'inventory', label: `Inventory (${products.length})`, icon: Package },
          { id: 'discounts', label: `Discounts & Promos (${discounts.length})`, icon: Tag },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
          { id: 'requests', label: 'Sourcing & RMB Queue', icon: Plane },
          { id: 'settings', label: 'Store Settings', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4 text-amber-500" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-slate-800">
              <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
                <span>Total Revenue Paid</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                GHS {totalRevenueGHS.toFixed(2)}
              </div>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                +18.4% vs last month
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-slate-800">
              <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
                <span>Total Completed Orders</span>
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{orders.length}</div>
              <span className="text-[11px] text-gray-500">Live system orders</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-slate-800">
              <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
                <span>Low Stock Warnings</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {products.filter((p) => p.stock <= 5).length}
              </div>
              <span className="text-[11px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                Items requiring restock
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-slate-800">
              <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
                <span>Pending Import Inquiries</span>
                <Plane className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {sourcingRequests.filter((s) => s.status === 'pending_review').length}
              </div>
              <span className="text-[11px] text-purple-800 font-bold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md inline-block">
                Sourcing quotes needed
              </span>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Monthly Store Sales Performance (GHS)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.salesByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', color: '#0f172a', borderColor: '#e2e8f0' }}
                    />
                    <Bar dataKey="sales" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Category Inventory Split</h3>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.categoryDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(stats?.categoryDistribution || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', color: '#0f172a', borderColor: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: INVENTORY & REAL-TIME STOCK */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Google Sheets & Drive Sync Control Panel */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl shadow-lg border border-emerald-800/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Google Sheets & Drive Inventory Sync
                </div>
                <h4 className="font-extrabold text-base text-white">Live Stock Level Link & Backup</h4>
                <p className="text-xs text-slate-300">
                  Export product stock to Google Sheets, sync inventory changes, or backup database to Google Drive.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleExportStockToSheet}
                  disabled={googleActionStatus.loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export to Google Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackupToDrive}
                  disabled={googleActionStatus.loading}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Backup to Google Drive</span>
                </button>
              </div>
            </div>

            {/* Linked Sheet ID Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Linked Google Sheet ID or URL:</span>
                <input
                  type="text"
                  value={linkedSheetId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLinkedSheetId(val);
                    localStorage.setItem('linked_sheet_id', val);
                  }}
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSyncStockFromSheet}
                disabled={googleActionStatus.loading || !linkedSheetId}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-2 mt-5 sm:mt-0 cursor-pointer text-xs"
              >
                <RefreshCw className={`w-4 h-4 ${googleActionStatus.loading ? 'animate-spin' : ''}`} />
                <span>Sync Stock From Sheet</span>
              </button>
            </div>

            {/* Status Alert */}
            {googleActionStatus.message && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                googleActionStatus.type === 'error' ? 'bg-red-950/80 text-red-200 border border-red-800/50' :
                googleActionStatus.type === 'success' ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/50' :
                'bg-slate-800 text-amber-300 border border-slate-700'
              }`}>
                <span>{googleActionStatus.message}</span>
                <button
                  onClick={() => setGoogleActionStatus({ loading: false, message: '', type: null })}
                  className="text-slate-400 hover:text-white ml-2 text-sm font-bold"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Stock Levels & Pricing Management</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                resetProductForm();
                setShowAddProductModal(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 self-start"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add New Item</span>
            </button>
          </div>

          {/* Product Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category / SKU</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Cost Price</th>
                    <th className="p-4 text-center">Real-Time Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const isLow = p.stock <= 5;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl bg-slate-100 border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            {p.discountPercent ? (
                              <span className="text-[10px] text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                {p.discountPercent}% OFF Promo
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="uppercase text-[10px] font-bold text-amber-600 block">{p.category}</span>
                          <span className="font-mono text-gray-500">{p.sku}</span>
                        </td>

                        <td className="p-4 font-extrabold text-slate-900">
                          GHS {p.price.toFixed(2)}
                        </td>

                        <td className="p-4 text-gray-500 font-mono">
                          GHS {p.costPrice.toFixed(2)}
                        </td>

                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <button
                              onClick={() => handleUpdateStock(p.id, -1)}
                              className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded font-black text-slate-800 shadow-sm"
                            >
                              -
                            </button>
                            <span
                              className={`font-black px-2 min-w-[28px] text-center ${
                                isLow ? 'text-amber-600 font-extrabold' : 'text-slate-900'
                              }`}
                            >
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleUpdateStock(p.id, 1)}
                              className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded font-black text-slate-800 shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditProduct(p)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
                            title="Edit Product Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DISCOUNTS & PROMOS */}
      {activeSubTab === 'discounts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Promo Codes & Site-Wide Discount Manager</h3>
            <button
              onClick={() => setShowAddDiscountModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 self-start"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create Promo Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((d) => (
              <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-black text-amber-700 text-base bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                    {d.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${d.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-gray-500'}`}>
                    {d.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs">{d.title}</h4>

                <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-slate-100">
                  <div>Discount: <strong className="text-amber-700">{d.discountPercent}% OFF</strong></div>
                  <div>Minimum Order Spend: <strong className="text-slate-900">GHS {d.minSpend}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ORDERS & SHIPPING STATUS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders, numbers, customer name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <span className="text-xs font-bold text-gray-500">{orders.length} Orders Registered</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders
                    .filter((o) =>
                      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
                    )
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                        
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{o.customerName}</div>
                          <div className="text-gray-500 text-[11px]">{o.customerPhone}</div>
                        </td>

                        <td className="p-4 font-extrabold text-slate-900">
                          GHS {o.totalAmount.toFixed(2)}
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${o.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {o.paymentStatus} ({o.paymentMethod.replace('_', ' ')})
                          </span>
                        </td>

                        <td className="p-4">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 font-bold text-slate-900 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="processing">1. Processing</option>
                            <option value="shipped">2. Shipped / In Transit</option>
                            <option value="delivered">3. Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => onViewReceipt(o)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400" /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 5: SOURCING & RMB QUEUE */}
      {activeSubTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* China Sourcing Inquiries */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-800">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plane className="w-5 h-5 text-amber-600" />
              <span>China Sourcing Queue ({sourcingRequests.length})</span>
            </h3>

            <div className="space-y-4">
              {sourcingRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{req.customerName} ({req.customerPhone})</span>
                    <span className="uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-gray-600">{req.instructions}</p>
                  
                  {req.productLink && (
                    <a href={req.productLink} target="_blank" rel="noreferrer" className="text-amber-700 font-mono truncate block underline">
                      {req.productLink}
                    </a>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <span className="font-bold">Qty: {req.quantity} units</span>
                    {req.quotedPriceGHS && (
                      <span className="font-extrabold text-emerald-700">Quote: GHS {req.quotedPriceGHS}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RMB Money Transfers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-800">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <span>RMB Transfer Queue ({transferRequests.length})</span>
            </h3>

            <div className="space-y-4">
              {transferRequests.map((trf) => (
                <div key={trf.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{trf.customerName} ({trf.customerPhone})</span>
                    <span className="uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                      {trf.status}
                    </span>
                  </div>
                  
                  <div className="font-black text-slate-900 text-sm">
                    GHS {trf.amountGHS.toFixed(2)} → ¥ {trf.amountRMB.toFixed(2)} RMB
                  </div>

                  <p className="font-mono text-gray-600 text-[11px] bg-white p-2 rounded-xl border border-slate-200">
                    {trf.recipientDetails}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 6: STORE SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-6 text-slate-800">
          <h3 className="font-bold text-slate-900 text-lg">Exchange Rates & Store Configuration</h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">RMB Exchange Rate (GHS / RMB)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.rmbRateGHS}
                  onChange={(e) => setSettingsForm({ ...settingsForm, rmbRateGHS: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">USD Exchange Rate (GHS / USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.usdRateGHS}
                  onChange={(e) => setSettingsForm({ ...settingsForm, usdRateGHS: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Air Shipping Rate ($ / KG)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settingsForm.airFreightRateUSD}
                  onChange={(e) => setSettingsForm({ ...settingsForm, airFreightRateUSD: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Local Accra Delivery Fee (GHS)</label>
                <input
                  type="number"
                  value={settingsForm.localDeliveryFeeGHS}
                  onChange={(e) => setSettingsForm({ ...settingsForm, localDeliveryFeeGHS: Number(e.target.value) })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Physical Store Notice Banner</label>
              <textarea
                rows={2}
                value={settingsForm.shopNotice}
                onChange={(e) => setSettingsForm({ ...settingsForm, shopNotice: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-md"
            >
              Save Store Configuration
            </button>
          </form>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-800 border border-slate-200 w-full max-w-xl rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowAddProductModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-slate-900 text-xl font-bold">
              &times;
            </button>
            <h3 className="font-bold text-slate-900 text-lg">
              {editingProduct ? 'Edit Item' : 'Add New Inventory Item'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-bold"
                  >
                    <option value="fashion">Fashion</option>
                    <option value="electronics">Electronics</option>
                    <option value="accessories">Accessories</option>
                    <option value="imports">Custom Import</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU Reference</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="BJC-XXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (GHS) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price (GHS)</label>
                  <input
                    type="number"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Image URL or Drive Image</label>
                  <button
                    type="button"
                    onClick={handlePickProductImageFromDrive}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Pick from Google Drive</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-... or Google Drive Image URL"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Description</label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all"
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROMO CODE MODAL */}
      {showAddDiscountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 border border-slate-200 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowAddDiscountModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-slate-900 text-xl font-bold">
              &times;
            </button>
            <h3 className="font-bold text-slate-900 text-lg">Create Store Coupon / Promo Code</h3>

            <form onSubmit={handleSaveDiscount} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Promo Code (e.g. BENJ15) *</label>
                <input
                  type="text"
                  required
                  value={discCode}
                  onChange={(e) => setDiscCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title / Description</label>
                <input
                  type="text"
                  value={discTitle}
                  onChange={(e) => setDiscTitle(e.target.value)}
                  placeholder="e.g. 15% Off Mid-Year Promo"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount % *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={discPercent}
                    onChange={(e) => setDiscPercent(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Spend (GHS)</label>
                  <input
                    type="number"
                    value={discMinSpend}
                    onChange={(e) => setDiscMinSpend(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-bold"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all">
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
