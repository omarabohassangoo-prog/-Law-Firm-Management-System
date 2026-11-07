import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { Phone, ChevronLeft, ChevronRight, Scale } from 'lucide-react';

export const CTASection: React.FC = () => {
  const { locale, firmSettings, setCurrentView } = useAppStore();
  const t = useTranslation(locale);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 py-16 text-white text-center border-b border-slate-800">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Scale className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
          {locale === 'ar' ? 'هل تحتاج إلى استشارة أو تمثيل قانوني؟' : 'Need Strategic Legal Counsel or Representation?'}
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
          {locale === 'ar'
            ? 'فريقنا من نخبة المحامين المعتمدين جاهز لدراسة قضيتك وتقديم الحلول النظامية الأمثل.'
            : 'Our certified attorneys are prepared to evaluate your matter and deliver optimal counsel.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setCurrentView('contact')}
            className="w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
          >
            <span>{locale === 'ar' ? 'احجز استشارتك الآن' : 'Book Consultation Now'}</span>
            {locale === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <a
            href={`tel:${firmSettings.phone.replace(/\s+/g, '')}`}
            className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span dir="ltr">{firmSettings.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
