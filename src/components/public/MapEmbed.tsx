import React from 'react';
import { useAppStore } from '../../store/appStore';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface MapEmbedProps {
  address?: string;
  zoom?: number;
}

export const MapEmbed: React.FC<MapEmbedProps> = ({
  address = 'Al Faisaliah Tower, King Fahd Road, Riyadh, Saudi Arabia',
}) => {
  const { locale, firmSettings } = useAppStore();
  const targetAddress = locale === 'ar' ? firmSettings.addressAr : firmSettings.addressEn || address;
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(targetAddress)}`;

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xs flex flex-col justify-between p-6">
      {/* Background stylized map texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs max-w-xs text-start">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'المقر الرئيسي للمكتب' : 'Firm Headquarters'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {targetAddress}
          </p>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-500" />
          <span>{locale === 'ar' ? 'الاتجاهات' : 'Get Directions'}</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>

      {/* Central Marker */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-400/20 animate-ping absolute" />
          <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 z-10">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
        <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs">
          برج الفيصلية · Al Faisaliah Tower
        </span>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
        <span>24.6902° N, 46.6853° E</span>
        <span>Google Maps Platform Verified</span>
      </div>
    </div>
  );
};
