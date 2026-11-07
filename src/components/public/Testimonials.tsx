import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../core/api/client';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company?: string;
  rating: number;
  avatar?: string;
}

export const Testimonials: React.FC = () => {
  const { locale } = useAppStore();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get<Testimonial[]>('/api/public/testimonials', 30 * 60 * 1000)
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch testimonials:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block mb-1">
            {locale === 'ar' ? 'شهادات العملاء' : 'Client Testimonials'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'ثقة شركائنا وقصص نجاحهم' : 'Client Trust & Endorsements'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 italic">
                  “{item.quote}”
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {item.author.charAt(0)}
                </div>
                <div className="text-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {item.author}
                  </span>
                  {item.company && (
                    <span className="text-[11px] text-slate-400 block">
                      {item.company}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
