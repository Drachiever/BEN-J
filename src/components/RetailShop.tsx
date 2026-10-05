import React, { useState, useEffect } from 'react';
import {
  Search, Filter, ShoppingBag, Eye, Star, Flame, Tag, Check, AlertCircle,
  Zap, Clock, Truck, ShieldCheck, PhoneCall, Gift, Smartphone, Shirt, Laptop,
  Tv, Sparkles, Heart, ChevronRight
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface RetailShopProps {
  products: Product[];
  settings: StoreSettings;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const RetailShop: React.FC<RetailShopProps> = ({
  products,
  settings,
  onAddToCart,
  onSelectProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [addedAnimation, setAddedAnimation] = useState<string | null>(null);

  // Live Flash Sale Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products by category & search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const handleQuickAdd = (p: Product) => {
    onAddToCart(p);
    setAddedAnimation(p.id);
    setTimeout(() => setAddedAnimation(null), 1200);
  };

  const categoriesList = [
    { id: 'all', label: 'All Deals', icon: Sparkles, badge: 'Popular' },
    { id: 'fashion', label: 'Fashion & Wear', icon: Shirt, badge: 'Up to 50% Off' },
    { id: 'electronics', label: 'Phones & Tech', icon: Smartphone, badge: 'Official Stores' },
    { id: 'accessories', label: 'Bags & Accessories', icon: ShoppingBag, badge: 'Hot Deals' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Jumia-Style Top Promotional Banner & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Main Hero Promotion Slider Card */}
        <div className="lg:col-span-8 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Ghana Official Mall & Direct Imports
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Big Brand Savings <br />
              <span className="text-amber-400">Up to 60% OFF Today!</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Order authentic fashion, corporate shirts, Italian leather footwear & smart gadget devices with fast doorstep delivery in Accra & nationwide.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedCategory('fashion')}>
              Shop Fashion <ChevronRight className="w-3.5 h-3.5" />
            </span>
            <span className="bg-slate-800/80 hover:bg-slate-800 text-white px-4 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer" onClick={() => setSelectedCategory('electronics')}>
              Shop Electronics <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Decorative Background Accent */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Side Service Highlights */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Doorstep Delivery</h4>
              <p className="text-[11px] text-gray-500">Fast delivery across Accra & all 16 Regions</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">MoMo & Cash on Delivery</h4>
              <p className="text-[11px] text-gray-500">Pay safely via MTN MoMo, Telecel or Cash</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Awoshie Physical Showroom</h4>
              <p className="text-[11px] text-gray-500">Opp. Anyaa Police Station, Accra ({settings.whatsappPhone || '+233 54 385 4239'})</p>
            </div>
          </div>
        </div>

      </div>

      {/* Category Icons Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categoriesList.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-500/50'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs truncate">{cat.label}</div>
                <span className={`text-[10px] font-semibold block ${isSelected ? 'text-amber-400' : 'text-amber-600'}`}>
                  {cat.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Flash Sales Section Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
            <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg sm:text-xl uppercase tracking-wider">Flash Sales</h3>
              <span className="bg-yellow-300 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">Limited Stock</span>
            </div>
            <p className="text-xs text-rose-100">Top-rated items at extreme discount prices</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/40 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-mono font-extrabold text-amber-300">
          <Clock className="w-4 h-4 text-amber-300" />
          <span>Time Remaining:</span>
          <span className="bg-slate-900 px-2 py-1 rounded text-white border border-slate-700">
            {String(timeLeft.hours).padStart(2, '0')}h
          </span>
          :
          <span className="bg-slate-900 px-2 py-1 rounded text-white border border-slate-700">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </span>
          :
          <span className="bg-slate-900 px-2 py-1 rounded text-white border border-slate-700">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* Search & Sorting Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fashion, smart watches, shoes..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-slate-800 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="featured">Featured First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Top Rated ⭐</option>
          </select>
        </div>

      </div>

      {/* Product Catalog Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No products found</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            We couldn't find any items matching "{searchQuery}". Try searching another keyword or clearing filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
          >
            Reset Catalog Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.map((p) => {
            let effectivePrice = p.price;
            let discountTag = p.discountPercent || 0;

            if (!discountTag && settings.isSiteWideDiscountActive && settings.announcementDiscount > 0) {
              discountTag = settings.announcementDiscount;
            }

            if (discountTag > 0) {
              effectivePrice = p.price * (1 - discountTag / 100);
            }

            const isLowStock = p.stock > 0 && p.stock <= 5;
            const isOutOfStock = p.stock <= 0;

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer" onClick={() => onSelectProduct(p)}>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {discountTag > 0 && (
                      <span className="bg-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3" /> -{discountTag}%
                      </span>
                    )}
                    {p.featured && (
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                        EXPRESS
                      </span>
                    )}
                  </div>

                  {/* Stock Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    {isOutOfStock ? (
                      <span className="bg-slate-950/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        Sold Out
                      </span>
                    ) : isLowStock ? (
                      <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {p.stock} left
                      </span>
                    ) : (
                      <span className="bg-emerald-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        In Stock ({p.stock})
                      </span>
                    )}
                  </div>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xl border border-slate-200 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-500" /> View Details
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="uppercase font-bold text-amber-600 text-[10px]">
                        {p.category}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{p.rating}</span>
                        <span className="text-gray-400 font-normal">({p.reviewCount})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(p)}
                      className="font-extrabold text-slate-800 text-sm hover:text-amber-600 cursor-pointer line-clamp-2 transition-colors leading-snug"
                    >
                      {p.name}
                    </h3>
                  </div>

                  {/* Stock progress meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                      <span>Available: {p.stock} units</span>
                      <span className="text-emerald-600">⚡ Express Dispatch</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (p.stock / 20) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Pricing & Add to Cart */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-slate-900 text-base">
                          GHS {effectivePrice.toFixed(2)}
                        </span>
                      </div>
                      {discountTag > 0 && (
                        <div className="text-[11px] text-gray-400 line-through font-medium">
                          GHS {p.price.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => handleQuickAdd(p)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : addedAnimation === p.id
                          ? 'bg-emerald-600 text-white scale-105'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {addedAnimation === p.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" /> Added
                        </>
                      ) : (
                        <>
                          + Add To Cart
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
