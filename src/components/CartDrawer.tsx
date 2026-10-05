import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { Product, StoreDiscount, StoreSettings } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discounts: StoreDiscount[];
  settings: StoreSettings;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (promoCodeApplied?: string, appliedDiscountGHS?: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  discounts,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<StoreDiscount | null>(null);
  const [promoError, setPromoError] = useState('');

  // Calculate Subtotal with product-level discounts
  const subtotal = items.reduce((sum, item) => {
    let price = item.product.price;
    let disc = item.product.discountPercent || 0;
    if (!disc && settings.isSiteWideDiscountActive && settings.announcementDiscount > 0) {
      disc = settings.announcementDiscount;
    }
    if (disc > 0) {
      price = price * (1 - disc / 100);
    }
    return sum + price * item.quantity;
  }, 0);

  // Calculate Promo Coupon Discount
  let couponDiscountGHS = 0;
  if (appliedPromo) {
    if (subtotal >= appliedPromo.minSpend) {
      couponDiscountGHS = (subtotal * appliedPromo.discountPercent) / 100;
    }
  }

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    const found = discounts.find((d) => d.code === code && d.isActive);
    if (!found) {
      setPromoError('Invalid or expired promo code.');
      setAppliedPromo(null);
      return;
    }

    if (subtotal < found.minSpend) {
      setPromoError(`Minimum spend of GHS ${found.minSpend} required for code ${code}.`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(found);
    setPromoCodeInput('');
  };

  const deliveryFee = items.length > 0 ? settings.localDeliveryFeeGHS : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscountGHS + deliveryFee);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="bg-white text-slate-800 w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">Your Cart</h3>
            <span className="bg-amber-500 text-slate-900 text-xs font-black px-2 py-0.5 rounded-full">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-slate-800 text-sm font-semibold">Your cart is currently empty</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore our Retail Store for fashion items, shoes, and modern electronics!
              </p>
              <button
                onClick={onClose}
                className="mt-2 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              let disc = product.discountPercent || 0;
              if (!disc && settings.isSiteWideDiscountActive && settings.announcementDiscount > 0) {
                disc = settings.announcementDiscount;
              }
              const unitPrice = disc > 0 ? product.price * (1 - disc / 100) : product.price;

              return (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 relative group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-xl bg-white shrink-0 border border-slate-200"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                        {product.name}
                      </h4>
                      <span className="text-[11px] text-gray-500 font-mono">SKU: {product.sku}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-900 min-w-[24px] text-center">
                          {quantity}
                        </span>
                        <button
                          disabled={quantity >= product.stock}
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100 font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 text-xs block">
                          GHS {(unitPrice * quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          (GHS {unitPrice.toFixed(2)} ea)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors self-start"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Coupon & Summary Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            
            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Promo Code / Coupon</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Try BENJ10 or BENJ20"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 uppercase font-bold outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg flex items-center justify-between">
                  <span>Code '{appliedPromo.code}' Applied ({appliedPromo.discountPercent}% Off)</span>
                  <button onClick={() => setAppliedPromo(null)} className="text-gray-500 hover:text-slate-900">
                    &times;
                  </button>
                </div>
              )}

              {promoError && (
                <div className="text-[11px] text-red-600 font-medium">{promoError}</div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">GHS {subtotal.toFixed(2)}</span>
              </div>

              {couponDiscountGHS > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedPromo?.code}):</span>
                  <span>- GHS {couponDiscountGHS.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Accra / Ghana Delivery:</span>
                <span className="font-semibold text-slate-900">GHS {deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-baseline text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-amber-600 text-lg">GHS {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onProceedToCheckout(appliedPromo?.code, couponDiscountGHS);
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure MTN MoMo, Telecel Cash & Card Checkout</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
