import React, { useState } from 'react';
import { Plane, Calculator, Link as LinkIcon, Upload, CheckCircle2, AlertCircle, Clock, ShieldCheck, MessageSquare, DollarSign } from 'lucide-react';
import { StoreSettings, SourcingRequest, User } from '../types';

interface ChinaImportSectionProps {
  settings: StoreSettings;
  user: User | null;
  userSourcingRequests: SourcingRequest[];
  onRequestSubmitted: () => void;
}

export const ChinaImportSection: React.FC<ChinaImportSectionProps> = ({
  settings,
  user,
  userSourcingRequests,
  onRequestSubmitted
}) => {
  // Sourcing Form State
  const [productLink, setProductLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [instructions, setInstructions] = useState('');
  const [customerName, setCustomerName] = useState(user ? user.name : '');
  const [customerPhone, setCustomerPhone] = useState(user ? user.phone : '');
  const [customerEmail, setCustomerEmail] = useState(user ? user.email : '');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Shipping Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(5);
  const [calcType, setCalcType] = useState<'air' | 'express'>('air');

  // Compute Freight Estimate
  const ratePerKg = calcType === 'air' ? settings.airFreightRateUSD : settings.expressAirRateUSD;
  const estimatedUSD = calcWeight * ratePerKg;
  const estimatedGHS = estimatedUSD * settings.usdRateGHS;
  const estimatedRMB = estimatedGHS / settings.rmbRateGHS;

  const handleSourcingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions || !quantity || quantity <= 0) {
      setErrorMessage('Please specify quantity and detailed product instructions.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/sourcing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('benj_token')
            ? { Authorization: `Bearer ${localStorage.getItem('benj_token')}` }
            : {})
        },
        body: JSON.stringify({
          productLink,
          imageUrl,
          quantity: Number(quantity),
          instructions,
          customerName: customerName || 'Customer',
          customerPhone: customerPhone || '+233 24 000 0000',
          customerEmail: customerEmail || 'customer@example.com'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit sourcing request');
      }

      setSubmitSuccess(true);
      setInstructions('');
      setProductLink('');
      setImageUrl('');
      onRequestSubmitted();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <Plane className="w-3.5 h-3.5" /> China to Ghana Door-to-Door Sourcing
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Alibaba, 1688 & Taobao Sourcing Services
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            We buy directly from top factories in Guangzhou, Yiwu, and Shenzhen, verify quality, consolidate packages, and ship via Air or Sea freight directly to our Accra Awoshie store.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sourcing Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-amber-500" />
              <span>Buy For Me / Sourcing Request</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Paste product links or describe items you need imported. Our team in China will procure and send you a factory quote.
            </p>
          </div>

          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Your sourcing request has been logged successfully! Our Awoshie team will review and contact you via WhatsApp shortly.
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSourcingSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Product URL (1688 / Alibaba / Taobao / Made-in-China)
              </label>
              <input
                type="url"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                placeholder="https://detail.1688.com/offer/..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Image Link (Optional photo reference)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity Needed *</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  placeholder="+233 24 000 0000"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-bold placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name & Email</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 placeholder:text-gray-400"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Detailed Specifications & Requirements *
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
                placeholder="Specify colors, sizes, materials, target wholesale price, branding, or custom logo needs..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {submitting ? 'Submitting Sourcing Request...' : 'Submit Sourcing Request'}
            </button>
          </form>
        </div>

        {/* Shipping Calculator & Visa Assistance */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Calculator */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-slate-800">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-500" />
                <span>China Freight Cost Calculator</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Estimate your shipping charges from China warehouses to Ghana.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Weight (KG)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Math.max(0.1, Number(e.target.value)))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Freight Speed & Shipping Type</label>
                <select
                  value={calcType}
                  onChange={(e) => setCalcType(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="air">Normal Air Freight (7-12 Days) - ${settings.airFreightRateUSD}/KG</option>
                  <option value="express">Express Air Cargo (3-5 Days) - ${settings.expressAirRateUSD}/KG</option>
                </select>
              </div>

              {/* Estimate Summary Box */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Calculated Freight USD:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    ${estimatedUSD.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1 border-t border-slate-800">
                  <span>Approx. Ghana Cedis:</span>
                  <span className="text-emerald-400 text-base">GHS {estimatedGHS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Equivalent in Chinese Yuan:</span>
                  <span className="font-mono">¥ {estimatedRMB.toFixed(2)} RMB</span>
                </div>
              </div>
            </div>
          </div>

          {/* China Visa Assistance Banner */}
          <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> China Business & Travel Visa Assistance
              </h4>
              <p className="text-xs text-slate-600 max-w-sm">
                Need official invitation letters or visa support to attend Canton Fair or visit China factories?
              </p>
            </div>

            <a
              href={`https://wa.me/${(settings?.whatsappPhone || '+233 54 385 4239').replace(/[+\s-()]/g, '')}?text=Hello%20Ben-J%20Classic,%20I%20would%20like%20assistance%20with%20a%20China%20Visa%20Application.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Contact Visa Desk
            </a>
          </div>

        </div>

      </div>

      {/* Sourcing Request Tracker */}
      {userSourcingRequests.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-slate-800">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Your Submitted Sourcing Requests</span>
          </h3>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {userSourcingRequests.map((req) => (
              <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>Qty: {req.quantity} units</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 font-mono text-[11px]">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 line-clamp-1 max-w-xl">{req.instructions}</p>
                  {req.adminNotes && (
                    <p className="text-amber-900 bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px]">
                      <strong>Admin Note:</strong> {req.adminNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {req.quotedPriceGHS && (
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Quote: GHS {req.quotedPriceGHS.toFixed(2)}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                      req.status === 'sourced' || req.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'quoted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
