import React, { useState } from 'react';
import { X, ShoppingBag, Star, CheckCircle, ShieldCheck, PhoneCall, AlertCircle, Package } from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  settings: StoreSettings;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  let discountTag = product.discountPercent || 0;
  if (!discountTag && settings.isSiteWideDiscountActive && settings.announcementDiscount > 0) {
    discountTag = settings.announcementDiscount;
  }

  const effectivePrice = discountTag > 0 ? product.price * (1 - discountTag / 100) : product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Ben-J Classic! I am interested in ordering "${product.name}" (SKU: ${product.sku}, GHS ${effectivePrice.toFixed(2)}). Please confirm availability.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white text-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image Column */}
          <div className="bg-slate-50 p-6 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-200">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-80 w-auto object-contain rounded-xl shadow-md"
            />
            {discountTag > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                {discountTag}% OFF SALE
              </span>
            )}
          </div>

          {/* Product Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span className="text-amber-600 uppercase tracking-wider">{product.category}</span>
                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 font-mono">
                  SKU: {product.sku}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-bold ml-1 text-slate-800">{product.rating}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">{product.reviewCount} customer reviews</span>
              </div>

              {/* Price Display */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">Price per unit</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      GHS {effectivePrice.toFixed(2)}
                    </span>
                    {discountTag > 0 && (
                      <span className="text-sm text-gray-400 line-through font-medium">
                        GHS {product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Real-Time Stock Status */}
                <div>
                  {isOutOfStock ? (
                    <span className="bg-red-50 text-red-800 border border-red-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Stock: {product.stock} units
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-xs leading-relaxed">
                {product.description}
              </p>

              {/* Specifications List */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Specifications
                  </h4>
                  <ul className="grid grid-cols-1 gap-1 text-xs text-gray-700">
                    {product.specifications.map((spec, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions: Quantity + Add to Cart */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-slate-700 hover:bg-slate-200 font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-900 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 text-slate-700 hover:bg-slate-200 font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white font-extrabold hover:scale-[1.02]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {added ? 'Added to Cart!' : `Add to Cart (GHS ${(effectivePrice * quantity).toFixed(2)})`}
                </button>

                <a
                  href={`https://wa.me/${(settings?.whatsappPhone || '+233 54 385 4239').replace(/[+\s-()]/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Stock • Pickup at Awoshie Branch or Nationwide Ghana Delivery</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
