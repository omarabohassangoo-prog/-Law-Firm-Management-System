import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { Scale, Phone, Mail, MapPin, ShieldCheck, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { locale, firmSettings, setCurrentView } = useAppStore();
  const t = useTranslation(locale);

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1: About Firm */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? t.firmNameShort : 'Al-Adalah Law'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {locale === 'ar' ? firmSettings.aboutContentAr : firmSettings.aboutContentEn}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>ISO 27001</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>ISO 9001</span>
              </div>
            </div>
          </div>

          {/* Column 2: Legal Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              {t.services}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setCurrentView('services')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {locale === 'ar' ? 'التقاضي والتحكيم التجاري' : 'Commercial Litigation'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('services')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {locale === 'ar' ? 'تأسيس الشركات وحوكمتها' : 'Corporate Formation'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('services')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {locale === 'ar' ? 'حماية الملكية الفكرية' : 'Intellectual Property'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('services')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {locale === 'ar' ? 'عقود العقارات والإنشاءات' : 'Real Estate & Construction'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('services')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {locale === 'ar' ? 'قسمة التركات والأوقاف' : 'Estate Distribution & Trusts'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {t.home}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {t.about}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {t.contact}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('dashboard')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  {t.dashboard}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('db_architecture')} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium text-slate-800 dark:text-slate-200">
                  {t.navDbArchitecture}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              {t.contact}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{locale === 'ar' ? firmSettings.addressAr : firmSettings.addressEn}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span dir="ltr" className="tabular-nums">{firmSettings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{firmSettings.email}</span>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                <span>{locale === 'ar' ? firmSettings.workingHoursAr : firmSettings.workingHoursEn}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & copyright bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {locale === 'ar' ? firmSettings.firmNameAr : firmSettings.firmNameEn}. {t.allRightsReserved}.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </span>
            <span>·</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              {locale === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
            </span>
            <span>·</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
              {locale === 'ar' ? 'ميثاق المحاماة' : 'Bar Ethics Code'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
