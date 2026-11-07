import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { SEO } from '../../components/seo/SEO';
import { HeroSection } from '../../components/public/HeroSection';
import { StatsBar } from '../../components/public/StatsBar';
import { ServicesGrid } from '../../components/public/ServicesGrid';
import { WhyUs } from '../../components/public/WhyUs';
import { Testimonials } from '../../components/public/Testimonials';
import { CTASection } from '../../components/public/CTASection';
import { ArrowUpRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { locale, firmSettings, setCurrentView } = useAppStore();
  const t = useTranslation(locale);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: locale === 'ar' ? firmSettings.firmNameAr : firmSettings.firmNameEn,
    description: locale === 'ar' ? firmSettings.aboutContentAr : firmSettings.aboutContentEn,
    telephone: firmSettings.phone,
    email: firmSettings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: firmSettings.addressAr,
      addressLocality: 'الرياض',
      addressCountry: 'SA',
    },
    openingHours: 'Su-Th 08:30-17:30',
    priceRange: '$$',
  };

  return (
    <div>
      <SEO
        title={locale === 'ar' ? 'مكتب العدالة للمحاماة — خدمات قانونية احترافية' : 'Al-Adala Law Firm — Professional Legal Advisory'}
        description={
          locale === 'ar'
            ? 'خدمات قانونية متخصصة في القضايا التجارية والعقارية والأحوال الشخصية والتحكيم. خبرة 20+ سنة في المملكة.'
            : 'Specialized counsel in commercial litigation, corporate governance, real estate, and arbitration. 20+ years of practice.'
        }
        keywords={['محامي', 'مكتب محاماة', 'استشارات قانونية', 'قضايا تجارية', 'تحكيم تجاري', 'الرياض']}
        structuredData={structuredData}
      />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Stats Bar */}
      <StatsBar />

      {/* 3. Featured Services Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block mb-1">
                {locale === 'ar' ? 'مجالات الاختصاص' : 'Practice Areas'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'أبرز خدماتنا القانونية' : 'Featured Legal Practices'}
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('services')}
              className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors"
            >
              <span>{locale === 'ar' ? 'عرض كافة الخدمات' : 'View All Practices'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <ServicesGrid featuredOnly={true} limit={6} />
        </div>
      </section>

      {/* 4. Why Us */}
      <WhyUs />

      {/* 5. Client Testimonials */}
      <Testimonials />

      {/* 6. CTA Section */}
      <CTASection />
    </div>
  );
};
