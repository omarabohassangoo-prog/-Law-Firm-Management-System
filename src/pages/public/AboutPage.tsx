import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { SEO } from '../../components/seo/SEO';
import { api } from '../../core/api/client';
import {
  ShieldCheck,
  Award,
  Lock,
  Star,
  Heart,
  Check,
  Scale,
  Users,
} from 'lucide-react';

interface AboutData {
  contentAr: string;
  contentEn: string;
  foundedYear: number;
  highlights: string[];
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  specialty?: string;
}

export const AboutPage: React.FC = () => {
  const { locale, firmSettings } = useAppStore();
  const t = useTranslation(locale);

  const [aboutData, setAboutData] = useState<AboutData>({
    contentAr: firmSettings.aboutContentAr,
    contentEn: firmSettings.aboutContentEn,
    foundedYear: 2005,
    highlights: [
      'معتمدون من وزارة العدل والهيئة السعودية للمحامين',
      'فريق متخصص من 15 محامياً ومستشاراً قانونياً',
      'أكثر من 500 قضية ناجحة ومحكومة لصالح موكلينا',
      'اعتماد معايير الجودة العالمية ISO 9001 و ISO 27001',
    ],
  });

  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    let mounted = true;
    api
      .get<AboutData>('/api/public/about', 60 * 60 * 1000)
      .then((data) => {
        if (mounted && data) setAboutData(data);
      })
      .catch((e) => console.warn('About data fetch fallback:', e));

    api
      .get<TeamMember[]>('/api/public/team', 10 * 60 * 1000)
      .then((data) => {
        if (mounted && Array.isArray(data)) setTeam(data);
      })
      .catch((e) => console.warn('Team fetch fallback:', e));

    return () => {
      mounted = false;
    };
  }, []);

  const values = [
    {
      icon: ShieldCheck,
      titleAr: 'المصداقية والشفافية',
      titleEn: 'Truth & Integrity',
      descAr: 'نقول الحقيقة لشركائنا دائماً ونقدم تقييماً واقعياً وصريحاً لفرص كل دعوى.',
      descEn: 'Uncompromising honesty and frank appraisal of matter merits.',
    },
    {
      icon: Lock,
      titleAr: 'السرية المهنية',
      titleEn: 'Confidentiality',
      descAr: 'بياناتك ومستنداتك محمية بأحدث بروتوكولات الأمان المؤسسي الرقمي.',
      descEn: 'Your privileged communications and documents are stringently protected.',
    },
    {
      icon: Star,
      titleAr: 'الاحترافية والتميز',
      titleEn: 'Professional Excellence',
      descAr: 'نطبق أعلى معايير الصياغة القانونية والتحليل القضائي المستفيض.',
      descEn: 'Precision legal drafting, deep judicial research, and thorough advocacy.',
    },
    {
      icon: Heart,
      titleAr: 'الاهتمام والشراكة',
      titleEn: 'Client Focus',
      descAr: 'قضيتك أولويتنا ونجاحك هو المعيار الحقيقي لتميزنا المهني.',
      descEn: 'Your objectives drive our advocacy; client success defines our firm.',
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <SEO
        title={locale === 'ar' ? 'من نحن — مكتب العدالة للمحاماة' : 'About Us — Al-Adala Law Firm'}
        description={
          locale === 'ar'
            ? 'تعرف على قصة مكتب العدالة للمحاماة، قيمنا المؤسسية، وفريق المحامين والمستشارين المتخصصين منذ 2005.'
            : 'Discover the story, values, and distinguished attorney directory of Al-Adala Law Firm since 2005.'
        }
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: locale === 'ar' ? firmSettings.firmNameAr : firmSettings.firmNameEn,
          foundingDate: '2005',
          url: 'https://aladalah-law.com',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. Hero */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-500 text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'من نحن' : 'About Us'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
            {locale === 'ar' ? 'قصة مكتب العدالة ورسالتنا' : 'The Story & Mission of Al-Adala'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {locale === 'ar'
              ? 'رحلة 20 عاماً من التميز القانوني والريادة في حماية مصالح شركائنا في المملكة.'
              : 'A 20-year journey of legal excellence, integrity, and robust client advocacy.'}
          </p>
        </div>

        {/* 2. Story: 2-column text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-start">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
              {locale === 'ar' ? `تأسس في ${aboutData.foundedYear}م` : `Established ${aboutData.foundedYear}`}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'أكثر من عقدين من الريادة القضائية' : 'Over Two Decades of Judicial Advocacy'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {locale === 'ar' ? aboutData.contentAr : aboutData.contentEn}
            </p>

            <div className="space-y-2.5 pt-2">
              {aboutData.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl aspect-4/3">
              <img
                src="/src/assets/images/hero_law_firm_1794062333662.jpg"
                alt="Law Firm Library"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* 3. Values */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'قيمنا التي نسترشد بها' : 'Our Guiding Principles'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {locale === 'ar' ? 'المبادئ الأخلاقية والمهنية التي تحكم كل استشارة ومرافعة' : 'Ethical standards defining every brief and legal representation'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-start shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {locale === 'ar' ? v.titleAr : v.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {locale === 'ar' ? v.descAr : v.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Team Directory: Circular 120px Avatars */}
        {team.length > 0 && (
          <div>
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'فريق المحامين والمستشارين' : 'Our Legal Team'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {locale === 'ar' ? 'نخبة من الكفاءات القانونية المؤهلة للتمثيل القضائي' : 'Licensed advocates and legal consultants'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center flex flex-col items-center shadow-xs transition-transform hover:-translate-y-1"
                >
                  <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-2xl text-slate-700 dark:text-slate-300 mb-4 shrink-0 shadow-sm">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {member.name}
                  </h3>

                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-2">
                    {locale === 'ar'
                      ? member.role === 'lawyer'
                        ? 'محامي ممارس ومستشار'
                        : member.role === 'legal_assistant'
                        ? 'مساعد قانوني'
                        : member.role
                      : member.role === 'lawyer'
                      ? 'Legal Counsel'
                      : member.role}
                  </span>

                  {member.specialty && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {member.specialty}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
