import React, { useState } from 'react';
import { Send, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertCircle, Clock, QrCode } from 'lucide-react';
import { StoreSettings, TransferRequest, User } from '../types';

interface MoneyTransferSectionProps {
  settings: StoreSettings;
  user: User | null;
  userTransfers: TransferRequest[];
  onTransferSubmitted: () => void;
}

export const MoneyTransferSection: React.FC<MoneyTransferSectionProps> = ({
  settings,
  user,
  userTransfers,
  onTransferSubmitted
}) => {
  const [amountGHS, setAmountGHS] = useState<number>(1100);
  const [amountRMB, setAmountRMB] = useState<number>(500);
  const [transferType, setTransferType] = useState<'alipay' | 'wechat' | 'china_bank'>('alipay');
  const [recipientDetails, setRecipientDetails] = useState('');
  const [customerName, setCustomerName] = useState(user ? user.name : '');
  const [customerPhone, setCustomerPhone] = useState(user ? user.phone : '');
  const [customerEmail, setCustomerEmail] = useState(user ? user.email : '');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle conversion
  const handleGHSChange = (val: number) => {
    setAmountGHS(val);
    setAmountRMB(Number((val / settings.rmbRateGHS).toFixed(2)));
  };

  const handleRMBChange = (val: number) => {
    setAmountRMB(val);
    setAmountGHS(Number((val * settings.rmbRateGHS).toFixed(2)));
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountGHS || amountGHS <= 0 || !recipientDetails) {
      setErrorMessage('Please enter a valid transfer amount and recipient supplier details.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('benj_token')
            ? { Authorization: `Bearer ${localStorage.getItem('benj_token')}` }
            : {})
        },
        body: JSON.stringify({
          amountGHS,
          amountRMB,
          transferType,
          recipientDetails,
          customerName: customerName || 'Valued Customer',
          customerPhone: customerPhone || '+233 24 000 0000',
          customerEmail: customerEmail || 'customer@example.com'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit transfer request');
      }

      setSubmitSuccess(true);
      setRecipientDetails('');
      onTransferSubmitted();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Send className="w-3.5 h-3.5" /> Instant Supplier Payments
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Direct Money Transfer to China (RMB / Yuan)
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Pay your Chinese factories and suppliers directly via Alipay, WeChat Pay, or Chinese UnionPay bank accounts with zero hassle and instant receipt verification.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-800">
        
        {/* Exchange Rate Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block">
              Current Exchange Rate
            </span>
            <span className="text-lg font-black text-slate-900">
              1 RMB (¥) = ~{settings.rmbRateGHS.toFixed(2)} GHS
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block">
              Processing Speed
            </span>
            <span className="text-lg font-black text-emerald-600 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" /> Same-Day Dispatch
            </span>
          </div>
        </div>

        {submitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Transfer request submitted! Please proceed to pay GHS {amountGHS.toFixed(2)} via MoMo to complete dispatch.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Currency Converter Form */}
        <form onSubmit={handleTransferSubmit} className="space-y-6 text-xs">
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Interactive Currency Converter</span>
              <ArrowRightLeft className="w-4 h-4 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">You Send (GHS Cedis)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={amountGHS}
                    onChange={(e) => handleGHSChange(Number(e.target.value))}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-base outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                    GHS
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier Receives (RMB / Yuan ¥)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={amountRMB}
                    onChange={(e) => handleRMBChange(Number(e.target.value))}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-base outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                    ¥ RMB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Method & Account Details */}
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-2">Select Transfer Channel</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'alipay', label: 'Alipay Pay', icon: QrCode },
                  { id: 'wechat', label: 'WeChat Pay', icon: Send },
                  { id: 'china_bank', label: 'China Bank / UnionPay', icon: ShieldCheck }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setTransferType(type.id as any)}
                    className={`p-3 rounded-xl font-bold flex flex-col items-center gap-1.5 border text-center transition-all ${
                      transferType === type.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="text-[11px]">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Recipient Supplier Account Details *
              </label>
              <textarea
                rows={3}
                value={recipientDetails}
                onChange={(e) => setRecipientDetails(e.target.value)}
                required
                placeholder={
                  transferType === 'alipay'
                    ? 'Enter Alipay Phone / Email ID & Registered Chinese Name (e.g. 138-1234-5678, Guangzhou Trading Co.)'
                    : transferType === 'wechat'
                    ? 'Enter WeChat Pay ID or Phone Number & Name'
                    : 'Enter Chinese Bank Name, Account Number, City Branch, & Account Holder Full Name in Pinyin'
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting
              ? 'Processing Transfer...'
              : `Submit Transfer Request (GHS ${amountGHS.toFixed(2)} → ¥ ${amountRMB.toFixed(2)} RMB)`}
          </button>
        </form>

      </div>

      {/* Transfer Request History */}
      {userTransfers.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-800">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Your Money Transfer History</span>
          </h3>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {userTransfers.map((trf) => (
              <div key={trf.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="text-amber-600 uppercase">{trf.transferType}</span>
                    <span>• GHS {trf.amountGHS.toFixed(2)} → ¥ {trf.amountRMB.toFixed(2)} RMB</span>
                    <span className="text-gray-500 font-mono text-[11px]">{new Date(trf.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 font-mono text-[11px]">{trf.recipientDetails}</p>
                  {trf.adminNotes && (
                    <p className="text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-[11px]">
                      <strong>Dispatch Proof Note:</strong> {trf.adminNotes}
                    </p>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] shrink-0 ${
                    trf.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : trf.status === 'rmb_dispatched'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {trf.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
