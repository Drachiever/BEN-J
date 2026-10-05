import React, { useState } from 'react';
import { X, Smartphone, CreditCard, Store, CheckCircle, ShieldCheck, Mail, ArrowRight, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { CartItem } from './CartDrawer';
import { Order, PaymentMethod, User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  promoCodeApplied?: string;
  promoDiscountGHS?: number;
  deliveryFee: number;
  user: User | null;
  onOrderCompleted: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  promoCodeApplied,
  promoDiscountGHS = 0,
  deliveryFee,
  user,
  onOrderCompleted,
  onViewReceipt
}) => {
  if (!isOpen) return null;

  // Checkout Step
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [customerName, setCustomerName] = useState(user ? user.name : '');
  const [customerEmail, setCustomerEmail] = useState(user ? user.email : '');
  const [customerPhone, setCustomerPhone] = useState(user ? user.phone : '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'Accra, Ghana');
  const [deliveryCity, setDeliveryCity] = useState('Accra');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo_mtn');
  const [momoNumber, setMomoNumber] = useState(user ? user.phone : '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Computations
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - promoDiscountGHS + deliveryFee);

  const handleProcessPayment = async () => {
    setProcessing(true);
    setErrorMessage('');

    // Simulated multi-step payment gateway flow
    try {
      if (paymentMethod.startsWith('momo')) {
        setProcessingStatusText('Sending Mobile Money USSD prompt to phone...');
        await new Promise((r) => setTimeout(r, 1200));
        setProcessingStatusText('Waiting for PIN authorization on handset...');
        await new Promise((r) => setTimeout(r, 1500));
        setProcessingStatusText('Payment authorized by Bank & Network Gateway...');
        await new Promise((r) => setTimeout(r, 1000));
      } else if (paymentMethod === 'card') {
        setProcessingStatusText('Validating card details with Bank 3D Secure...');
        await new Promise((r) => setTimeout(r, 1800));
        setProcessingStatusText('Card charged successfully...');
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        setProcessingStatusText('Verifying Awoshie Shop pickup order details...');
        await new Promise((r) => setTimeout(r, 1000));
      }

      setProcessingStatusText('Generating automated email receipt & updating stock...');

      // API Call to create order and reduce stock
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('benj_token')
            ? { Authorization: `Bearer ${localStorage.getItem('benj_token')}` }
            : {})
        },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          promoCode: promoCodeApplied,
          shippingFee: deliveryFee,
          paymentMethod,
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          deliveryCity,
          notes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to place order');
      }

      const data = await res.json();
      setCompletedOrder(data.order);
      onOrderCompleted(data.order);
      setStep(4); // Move to success step
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white text-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block">
              Ben-J Classic Checkout
            </span>
            <h3 className="text-lg font-black text-white">
              {step === 1 && '1. Shipping & Customer Information'}
              {step === 2 && '2. Select Payment Method'}
              {step === 3 && '3. Payment Processing'}
              {step === 4 && '4. Purchase Complete & Receipt'}
            </h3>
          </div>

          {step < 4 && (
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: CUSTOMER DETAILS */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Kofi Mensah"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address * (For Automated Email Receipt)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number (MoMo / Contact) *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+233 24 123 4567"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery City / Region</label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="Accra, Kumasi, Takoradi..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Delivery Street Address or Landmark
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House No. 12, Awoshie - Anyaa Road..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for delivery driver..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                />
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-200">
                <span className="font-extrabold text-slate-900 text-sm">
                  Total: GHS {totalAmount.toFixed(2)}
                </span>
                <button
                  disabled={!customerName || !customerEmail || !customerPhone}
                  onClick={() => setStep(2)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && (
            <div className="space-y-6 text-xs">
              <div className="space-y-3">
                <label className="block font-bold text-slate-900 text-sm">Choose Payment Gateway</label>
                
                {/* Mobile Money Options */}
                <div
                  onClick={() => setPaymentMethod('momo_mtn')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'momo_mtn'
                      ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">MTN Mobile Money / Telecel Cash / AT Money</h4>
                      <p className="text-gray-500 text-[11px]">Instant USSD prompt authorization on your phone</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod.startsWith('momo')} readOnly className="accent-amber-600" />
                </div>

                {/* Card Payment */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Visa / Mastercard / Debit Card</h4>
                      <p className="text-gray-500 text-[11px]">3D Secure local and international cards</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'card'} readOnly className="accent-amber-600" />
                </div>

                {/* Awoshie Store Pickup */}
                <div
                  onClick={() => setPaymentMethod('cod_awoshie')}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'cod_awoshie'
                      ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Pay at Awoshie Shop / Pay on Delivery</h4>
                      <p className="text-gray-500 text-[11px]">Opposite Anyaa Police Station, Awoshie Branch</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'cod_awoshie'} readOnly className="accent-amber-600" />
                </div>
              </div>

              {/* Dynamic Sub-form for Selected Payment */}
              {paymentMethod.startsWith('momo') && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700">Mobile Money Phone Number *</label>
                  <input
                    type="tel"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="+233 24 XXX XXXX"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                  <p className="text-[11px] text-gray-500">
                    A payment prompt will be pushed to this handset. Enter your MoMo PIN when prompted.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Card Number *</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold placeholder:text-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center border-t border-slate-200">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-slate-900 font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  onClick={() => {
                    setStep(3);
                    handleProcessPayment();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>Pay GHS {totalAmount.toFixed(2)}</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING SPINNER */}
          {step === 3 && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
              <h4 className="text-base font-extrabold text-slate-900">Processing Payment Securely</h4>
              <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
                {processingStatusText || 'Communicating with Ben-J Classic Payment Gateway...'}
              </p>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS & AUTOMATED RECEIPT */}
          {step === 4 && completedOrder && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                  Order Successfully Completed!
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {completedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Thank you for your purchase! Your order has been registered in our Awoshie store inventory system.
                </p>
              </div>

              {/* Automated Email Notice Badge */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-800 text-left space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Automated Official Receipt Dispatched</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  An official itemized receipt was generated and emailed to <strong>{completedOrder.customerEmail}</strong>.
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-700 text-sm">GHS {completedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => onViewReceipt(completedOrder)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>View & Print Official Receipt</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-xl text-xs transition-all border border-slate-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
