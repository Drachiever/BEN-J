import React from 'react';
import { MapPin, Tag, Phone, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface BannerNoticeProps {
  settings: StoreSettings;
}

export const BannerNotice: React.FC<BannerNoticeProps> = ({ settings }) => {
  return (
    <div className="bg-amber-500 text-slate-900 text-xs sm:text-sm font-semibold py-2 px-4 text-center flex justify-center items-center gap-2 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-900 shrink-0" />
          <span>Visit our Physical Shop: Accra - Awoshie (Opposite Anyaa Police Station)</span>
        </div>

        {settings.isSiteWideDiscountActive && settings.announcementDiscount > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FLASH SALE: {settings.announcementDiscount}% OFF! Code: <span className="bg-amber-400 text-slate-950 px-1 rounded font-black">BENJ10</span></span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-900 border-l border-slate-950/20 pl-4">
          <Phone className="w-3.5 h-3.5" />
          <span>Tel: +233 54 385 4239</span>
        </div>
      </div>
    </div>
  );
};
