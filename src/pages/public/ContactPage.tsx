import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { SEO } from '../../components/seo/SEO';
import { ContactForm } from '../../components/public/ContactForm';
import { MapEmbed } from '../../components/public/MapEmbed';
import { MapPin, Phone, Mail, Award, ExternalLink } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { locale, firmSettings } = useAppStore();
  const t = useTranslation(locale);

  const contactCards = [
    {
      icon: MapPin,
      titleAr: 'المقر والعنوان',
      titleEn: 'Office Location',
      content: locale === 'ar' ? firmSettings.addressAr : firmSettings.addressEn,
      actionText: locale === 'ar' ? 'عرض على خرائط Google' : 'Open in Google Maps',
      link: `https://maps.google.com/?q=${encodeURIComponent(firmSettings.addressAr)}`,
      external: true,
    },
    {
      icon: Phone,
      titleAr: 'الاتصال الموحد',
      titleEn: 'Telephone',
      content: firmSettings.phone,
      actionText: locale === 'ar' ? 'اتصال مباشر' : 'Call Now',
      link: `tel:${firmSettings.phone.replace(/\s+/g, '')}`,
      external: false,
    },
    {
      icon: Mail,
      titleAr: 'البريد الإلكتروني',
      titleEn: 'Official Email',
      content: firmSettings.email,
      actionText: locale === 'ar' ? 'إرسال بريد' : 'Send Email',
      link: `mailto:${firmSettings.email}`,
      external: false,
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <SEO
        title={locale === 'ar' ? 'اتصل بنا — مكتب العدالة للمحاماة' : 'Contact Us — Al-Adala Law Firm'}
        description={
          locale === 'ar'
            ? `تواصل معنا لحجز استشارة قانونية سرية. هاتف: ${firmSettings.phone} | بريد: ${firmSettings.email}`
            : `Contact Al-Adala Law Firm to book a privileged consultation. Phone: ${firmSettings.phone} | Email: ${firmSettings.email}`
        }
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: firmSettings.phone,
            email: firmSettings.email,
            contactType: 'customer service',
            availableLanguage: ['Arabic', 'English'],
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Hero */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-500 text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
            {locale === 'ar' ? 'نحن هنا لحماية مصالحك القانونية' : 'We Are Here to Protect Your Interests'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {locale === 'ar'
              ? 'احجز استشارتك اليوم مع نخبة المحامين المعتمدين، أو تفضل بزيارة مقرنا الرئيسي في برج الفيصلية بالرياض.'
              : 'Book your confidential consultation today, or visit our headquarters in Al Faisaliah Tower, Riyadh.'}
          </p>
        </div>

        {/* 2. Contact Info Cards (3 cards grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-xs transition-transform hover:-translate-y-1"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {locale === 'ar' ? card.titleAr : card.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {card.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <a
                    href={card.link}
                    target={card.external ? '_blank' : undefined}
                    rel={card.external ? 'noopener noreferrer' : undefined}
                    className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{card.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Form Left (60%) + Map Right (40%) on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <div className="lg:col-span-5 sticky top-24">
            <MapEmbed address={firmSettings.addressAr} />
          </div>
        </div>
      </div>
    </div>
  );
};
