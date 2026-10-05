import React from 'react';
import { X, Printer, CheckCircle, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  settings?: StoreSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose, settings }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white text-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative my-8 print:shadow-none print:border-none print:my-0 print:bg-white print:text-slate-900">
        
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 print:hidden">
          <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            Official Invoice Receipt
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-amber-500 text-slate-900 font-black text-lg px-2.5 py-1 rounded-lg">
                  B-J
                </div>
                <h1 className="text-xl font-extrabold text-slate-900">Ben-J Classic Venture</h1>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" />
                Accra - Awoshie (Opposite Anyaa Police Station)
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-500" />
                {(settings?.whatsappPhone || '+233 54 385 4239')} | achieverbuabeng@gmail.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3" /> OFFICIAL PAID RECEIPT
              </span>
              <div className="font-mono font-bold text-slate-900 text-base">{order.orderNumber}</div>
              <div className="text-xs text-gray-500">Date: {new Date(order.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Billed To Customer</span>
              <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
              <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-gray-400" /> {order.customerEmail}
              </div>
              <div className="text-gray-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-gray-400" /> {order.customerPhone}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Delivery Destination</span>
              <div className="font-semibold text-slate-800">{order.deliveryAddress}</div>
              <div className="text-gray-500">{order.deliveryCity}, Ghana</div>
              <div className="mt-1">
                <span className="font-bold text-gray-600">Payment Channel: </span>
                <span className="uppercase text-slate-900 font-mono font-bold">
                  {order.paymentMethod.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3 rounded-l-xl">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price (GHS)</th>
                  <th className="p-3 text-right rounded-r-xl">Total (GHS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-semibold text-slate-900">{item.productName}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{item.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">GHS {order.subtotal.toFixed(2)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Applied Promo Discount ({order.promoCodeApplied}):</span>
                <span className="font-mono">- GHS {order.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span className="font-mono font-semibold">GHS {order.shippingFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-baseline text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid:</span>
              <span className="text-amber-600 font-mono text-xl">
                GHS {order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stamp / Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
            <div className="flex items-center gap-1.5 text-gray-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified System Invoice • Ben-J Classic Venture Awoshie Store</span>
            </div>

            <div className="border border-slate-200 p-2 rounded-xl text-center text-[10px] uppercase tracking-wider font-bold text-slate-700 bg-slate-50">
              STAMPED & APPROVED
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
