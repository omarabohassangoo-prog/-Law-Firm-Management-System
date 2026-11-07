import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { SEO } from '../../components/seo/SEO';
import { ServicesGrid } from '../../components/public/ServicesGrid';
import { Award, Phone, ChevronRight, ChevronLeft, ArrowUpRight } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { locale, services, setCurrentView } = useAppStore();
  const t = useTranslation(locale);

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { key: 'all', labelAr: 'الكل', labelEn: 'All' },
    { key: 'commercial', labelAr: 'تجاري وتحكيم', labelEn: 'Commercial & Arbitration' },
    { key: 'corporate', labelAr: 'شركات وحوكمة', labelEn: 'Corporate' },
    { key: 'realestate', labelAr: 'عقاري وإنشاءات', labelEn: 'Real Estate' },
    { key: 'family', labelAr: 'أحوال شخصية وتركات', labelEn: 'Estate & Family' },
    { key: 'labor', labelAr: 'عمالي وموارد بشرية', labelEn: 'Labor' },
  ];

  return (
    <div className="py-12 sm:py-16">
      <SEO
        title={locale === 'ar' ? 'خدماتنا القانونية ومجالات الممارسة — مكتب العدالة' : 'Legal Practices & Services — Al-Adala Law Firm'}
        description={
          locale === 'ar'
            ? 'خدمات قانونية متكاملة في الترافع والتحكيم التجاري، تأسيس الشركات، الملكية الفكرية، القضايا العقارية والتركات.'
            : 'Comprehensive legal practices in commercial litigation, corporate governance, arbitration, real estate, and IP protection.'
        }
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: services.map((s, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: s.titleAr,
            description: s.descriptionAr,
          })),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Hero */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-500 text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'خدماتنا' : 'Our Services'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
            {locale === 'ar' ? 'خدمات قانونية متكاملة وموثوقة' : 'Comprehensive Legal Advisory Services'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {locale === 'ar'
              ? 'نغطي كافة احتياجاتك القانونية بخبرة قضائية تزيد عن عقدين، لضمان أعلى درجات الأمان النظامي لأعمالك.'
              : 'Covering all corporate and private legal needs with over two decades of judicial advocacy mastery.'}
          </p>
        </div>

        {/* 2. Client-Side Category Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-full overflow-x-auto text-xs font-semibold">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {locale === 'ar' ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* 3. Services Grid */}
        <ServicesGrid
          featuredOnly={false}
          categoryFilter={activeCategory}
          onSelectService={() => setCurrentView('contact')}
        />

        {/* 4. CTA */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-center flex flex-col items-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            {locale === 'ar' ? 'لم تجد الخدمة المحددة التي تبحث عنها؟' : 'Looking for a Customized Practice Area?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-6">
            {locale === 'ar'
              ? 'تواصل مع مستشارينا لمناقشة وقائع قضيتك أو استشارتك الخاصة بسرية تامة.'
              : 'Reach out to our senior counsel to discuss the specifics of your matter in complete privilege.'}
          </p>
          <button
            onClick={() => setCurrentView('contact')}
            className="px-6 py-3 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-md flex items-center gap-2"
          >
            <span>{locale === 'ar' ? 'اتصل بنا واحجز استشارتك' : 'Contact Us & Book Consultation'}</span>
            {locale === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
