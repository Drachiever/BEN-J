import React from 'react';
import { User, Order, SourcingRequest, TransferRequest } from '../types';
import { ShoppingBag, FileText, Clock, PackageCheck, Plane, Send, MapPin, User as UserIcon } from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
  orders: Order[];
  sourcingRequests: SourcingRequest[];
  transferRequests: TransferRequest[];
  onViewReceipt: (order: Order) => void;
  onGoToShop: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  orders,
  sourcingRequests,
  transferRequests,
  onViewReceipt,
  onGoToShop
}) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Profile Header Card */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 bg-amber-500 text-slate-900 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-extrabold text-white">{user.name}</h2>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Customer Account
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email} • {user.phone}</p>
            <p className="text-xs text-slate-300 flex items-center gap-1 justify-center sm:justify-start mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {user.address || 'Accra, Ghana'}
            </p>
          </div>
        </div>

        <button
          onClick={onGoToShop}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Store Catalog</span>
        </button>
      </div>

      {/* Orders Section with Progress Tracking */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-500" />
            <span>Your Order History & Live Tracking</span>
          </h3>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            {orders.length} Total Orders
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-gray-600 text-xs font-semibold">You haven't placed any orders yet.</p>
            <button
              onClick={onGoToShop}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Start Shopping Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              // Compute tracking step (1: processing, 2: shipped, 3: delivered)
              let currentStep = 1;
              if (order.orderStatus === 'shipped') currentStep = 2;
              if (order.orderStatus === 'delivered') currentStep = 3;

              return (
                <div
                  key={order.id}
                  className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-gray-500 block font-mono">
                        Placed: {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-amber-600 text-base">
                        GHS {order.totalAmount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onViewReceipt(order)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Items Horizontal List */}
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shrink-0">
                        <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg" />
                        <div className="text-xs">
                          <div className="font-bold text-slate-900 max-w-[150px] truncate">{item.productName}</div>
                          <div className="text-gray-500 font-mono">Qty: {item.quantity} • GHS {item.subtotal.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Progress Bar */}
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Live Order Tracking Status
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs relative">
                      {/* Step 1 */}
                      <div className={`p-2 rounded-lg font-bold border ${currentStep >= 1 ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-white text-gray-400 border-slate-200'}`}>
                        1. Order Verified
                      </div>

                      {/* Step 2 */}
                      <div className={`p-2 rounded-lg font-bold border ${currentStep >= 2 ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-white text-gray-400 border-slate-200'}`}>
                        2. Dispatched / In Transit
                      </div>

                      {/* Step 3 */}
                      <div className={`p-2 rounded-lg font-bold border ${currentStep >= 3 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-400 border-slate-200'}`}>
                        3. Delivered
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sourcing & Transfer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* China Sourcing Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-800">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Plane className="w-4 h-4 text-amber-500" />
            <span>China Sourcing ({sourcingRequests.length})</span>
          </h3>

          {sourcingRequests.length === 0 ? (
            <p className="text-xs text-gray-500">No active sourcing requests.</p>
          ) : (
            <div className="space-y-3">
              {sourcingRequests.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900">Qty: {s.quantity} units</span>
                    <span className="uppercase text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-1">{s.instructions}</p>
                  {s.quotedPriceGHS && (
                    <div className="font-bold text-emerald-700 pt-1">Quote: GHS {s.quotedPriceGHS.toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Money Transfer Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-800">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>RMB Transfers ({transferRequests.length})</span>
          </h3>

          {transferRequests.length === 0 ? (
            <p className="text-xs text-gray-500">No active transfer requests.</p>
          ) : (
            <div className="space-y-3">
              {transferRequests.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900">GHS {t.amountGHS.toFixed(2)} → ¥ {t.amountRMB.toFixed(2)} RMB</span>
                    <span className="uppercase text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 font-mono text-[11px] truncate">{t.recipientDetails}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
