import React from 'react';
import { ShoppingBag, PlaneTakeoff, Send, User, ShieldCheck, ShoppingCart, LogOut, PhoneCall } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  activeTab: 'shop' | 'import' | 'transfer' | 'customer' | 'admin';
  setActiveTab: (tab: 'shop' | 'import' | 'transfer' | 'customer' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  user: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  user,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-4">
        
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => setActiveTab('shop')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-amber-500 text-slate-900 p-2 rounded-lg font-bold text-xl leading-none flex items-center justify-center">
            B-J
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none text-white group-hover:text-amber-400 transition-colors">
              Ben-J Classic
            </h1>
            <span className="text-xs text-amber-400 block font-medium mt-0.5">
              Fashion • Tech • Importations
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-2 bg-slate-800 p-1 rounded-lg text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold transition-all whitespace-nowrap ${
              activeTab === 'shop'
                ? 'bg-amber-500 text-slate-900 shadow-sm'
                : 'hover:bg-slate-700 text-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Retail Shop</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold transition-all whitespace-nowrap ${
              activeTab === 'import'
                ? 'bg-amber-500 text-slate-900 shadow-sm'
                : 'hover:bg-slate-700 text-gray-200'
            }`}
          >
            <PlaneTakeoff className="w-4 h-4" />
            <span>China Imports</span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold transition-all whitespace-nowrap ${
              activeTab === 'transfer'
                ? 'bg-amber-500 text-slate-900 shadow-sm'
                : 'hover:bg-slate-700 text-gray-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Money Transfer</span>
          </button>
        </nav>

        {/* Right Utility Buttons: Cart, Auth, Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-amber-400 flex items-center gap-2 transition-colors"
            title="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium text-amber-400">Cart</span>
            {cartCount > 0 && (
              <span className="bg-amber-500 text-slate-900 font-bold text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(user.role === 'admin' ? 'admin' : 'customer')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  user.role === 'admin'
                    ? 'bg-purple-900/60 border border-purple-500/50 text-purple-200 hover:bg-purple-800/80'
                    : 'bg-slate-800 text-gray-200 hover:bg-slate-700'
                }`}
              >
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                ) : (
                  <User className="w-4 h-4 text-amber-400" />
                )}
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                {user.role === 'admin' && (
                  <span className="bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                    Admin
                  </span>
                )}
              </button>

              <button
                onClick={onLogout}
                className="bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-white p-2 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-md transition-all"
            >
              <User className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          )}

          {/* Direct WhatsApp Call Quick Link */}
          <a
            href="https://wa.me/233543854239?text=Hello%20Ben-J%20Classic!%20I%20have%20an%20inquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-all shadow-sm"
            title="Chat on WhatsApp"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Awoshie Shop</span>
          </a>

        </div>

      </div>
    </header>
  );
};
