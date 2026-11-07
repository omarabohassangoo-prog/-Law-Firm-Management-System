import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { Award, ChevronLeft, ChevronRight, Scale, ArrowUpRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { locale, setCurrentView } = useAppStore();
  const t = useTranslation(locale);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
      {/* Background Justice & Library Illustration with Scrim */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/src/assets/images/hero_law_firm_1794062333662.jpg"
          alt="Law Firm Library & Partner Office"
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        {/* Subtle geometric SVG decorative pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text and CTAs */}
          <div className="lg:col-span-7 text-start">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-6">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{locale === 'ar' ? 'مكتب محاماة معتمد ومصنف' : 'Certified & Accredited Law Practice'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4 text-wrap-balance">
              {locale === 'ar' ? 'مكتب العدالة للمحاماة والاستشارات' : 'Al-Adala Law Firm & Legal Consultants'}
            </h1>

            <p className="text-lg sm:text-xl font-medium text-amber-200/90 mb-4">
              {locale === 'ar'
                ? 'خدمات قانونية احترافية بأعلى معايير الجودة والسرية'
                : 'Professional legal advisory adhering to the highest quality and privilege standards'}
            </p>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-2xl">
              {locale === 'ar'
                ? 'أكثر من 20 عاماً من الخبرة في القضايا التجارية، التحكيم، العقود الاستثمارية، والأحوال الشخصية أمام المحاكم السعودية والهيئات القضائية.'
                : 'Over 20 years of proven excellence in commercial litigation, arbitration tribunals, contract drafting, and estate settlements.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={() => setCurrentView('contact')}
                className="px-7 py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-lg shadow-amber-400/15 flex items-center justify-center gap-2"
              >
                <span>{locale === 'ar' ? 'احجز استشارة' : 'Book a Consultation'}</span>
                {locale === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setCurrentView('services')}
                className="px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>{locale === 'ar' ? 'تعرف على خدماتنا' : 'Explore Practice Areas'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Card / Hero Graphic */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {locale === 'ar' ? 'حماية قانونية استباقية لأعمالك' : 'Strategic Legal Foresight for Enterprise'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {locale === 'ar'
                  ? 'نوفر دراسات نظامية متعمقة تسهم في تلافي المخاطر التعاقدية وتسريع تسوية النزاعات بأقل تكلفة وأقصر مدة زمنية.'
                  : 'Delivering comprehensive regulatory assessments to preempt contractual liability and expedite commercial resolutions.'}
              </p>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-amber-300">
                <span>{locale === 'ar' ? 'الرياض · جدة · الدمام' : 'Riyadh · Jeddah · Dammam'}</span>
                <span className="font-semibold">{locale === 'ar' ? 'مرخص نظاماً' : 'Officially Licensed'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
