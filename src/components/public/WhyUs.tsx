import React from 'react';
import { useAppStore } from '../../store/appStore';
import { ShieldCheck, Users, Clock, Award } from 'lucide-react';

export const WhyUs: React.FC = () => {
  const { locale } = useAppStore();

  const features = [
    {
      icon: ShieldCheck,
      titleAr: 'سرية مهنية تامة',
      titleEn: 'Absolute Client Privilege',
      descAr: 'نلتزم بأعلى معايير السرية والخصوصية الرقمية المعتمدة وفق مواصفة ISO 27001.',
      descEn: 'Strict adherence to professional confidentiality and ISO 27001 security standards.',
    },
    {
      icon: Users,
      titleAr: 'فريق قانوني متخصص',
      titleEn: 'Dedicated Legal Team',
      descAr: 'محامون ومستشارون معتمدون من وزارة العدل في شتى فروع القانون التجاري والمدني.',
      descEn: 'Licensed advocates specializing across commercial, labor, and corporate jurisdictions.',
    },
    {
      icon: Clock,
      titleAr: 'استجابة سريعة ومتابعة حية',
      titleEn: 'Swift 24h Response',
      descAr: 'رد سريع خلال 24 ساعة ومتابعة لحظية لسير الجلسات عبر بوابة الموكل الرقمية.',
      descEn: 'Guaranteed 24-hour turnaround with real-time matter tracking on our portal.',
    },
    {
      icon: Award,
      titleAr: 'خبرة تزيد عن 20 عاماً',
      titleEn: '20+ Years Proven Excellence',
      descAr: 'سجل حافل بأكثر من 500 قضية ناجحة أمام المحاكم وهيئات التحكيم المعتمدة.',
      descEn: 'Track record of over 500 successfully resolved matters and arbitrations.',
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block mb-1">
            {locale === 'ar' ? 'مميزات التعامل معنا' : 'Our Differentiators'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'لماذا يختارنا كبرى الشركات والموكلين؟' : 'Why Leading Corporations Choose Us?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            {locale === 'ar'
              ? 'نجمع بين البراعة القضائية المعمقة واستخدام أحدث التقنيات لإدارة وتأمين معاملاتك.'
              : 'Combining judicial advocacy mastery with modern digital transparency to protect your enterprise.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 text-start"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                  {locale === 'ar' ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {locale === 'ar' ? item.descAr : item.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
