import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useTranslation } from '../utils/translations';
import { DisplayControls } from '../components/ui/DisplayControls';
import { api } from '../core/api/client';
import {
  Scale,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

import { useAuthStore } from '../store/auth.store';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { currentView, setCurrentView, locale, firmSettings, updateFirmSettings } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const t = useTranslation(locale);

  const [hasScrolled, setHasScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [footerServices, setFooterServices] = useState<any[]>([]);

  // Fetch public settings & services
  useEffect(() => {
    let mounted = true;
    api
      .get<any>('/api/public/settings', 60 * 60 * 1000)
      .then((data) => {
        if (mounted && data) {
          updateFirmSettings({
            firmNameAr: data.firmName || firmSettings.firmNameAr,
            firmNameEn: data.firmNameEn || firmSettings.firmNameEn,
            phone: data.phone || firmSettings.phone,
            email: data.email || firmSettings.email,
            addressAr: data.address || firmSettings.addressAr,
            workingHoursAr: data.workingHours || firmSettings.workingHoursAr,
          });
        }
      })
      .catch((e) => console.warn('Public settings fetch fallback:', e));

    api
      .get<any[]>('/api/public/services?limit=4', 10 * 60 * 1000)
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setFooterServices(data);
        }
      })
      .catch((e) => console.warn('Footer services fetch fallback:', e));

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      mounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { key: 'home', label: t.home },
    { key: 'about', label: t.about },
    { key: 'services', label: t.services },
    { key: 'contact', label: t.contact },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 z-50 px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold shadow-lg"
      >
        {locale === 'ar' ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>

      {/* Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 ${
          hasScrolled ? 'shadow-md shadow-slate-900/5' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Left: Brand logo + name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 text-start"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight leading-tight">
                  {locale === 'ar' ? firmSettings.firmNameAr.split(' ')[0] + ' ' + firmSettings.firmNameAr.split(' ')[1] : 'Al-Adala Law'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  {locale === 'ar' ? 'للمحاماة والاستشارات القانونية' : 'Legal Advisory & Arbitration'}
                </span>
              </div>
            </button>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => {
              const isActive = currentView === link.key;
              return (
                <button
                  key={link.key}
                  onClick={() => setCurrentView(link.key)}
                  className={`transition-colors whitespace-nowrap py-1 relative ${
                    isActive
                      ? 'text-slate-900 dark:text-slate-100 font-bold'
                      : 'hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-900 dark:bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Display controls + Login button */}
          <div className="flex items-center gap-3 shrink-0">
            <DisplayControls />
            <button
              onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            >
              {isAuthenticated ? t.dashboard : t.login}
            </button>
          </div>
        </div>

        {/* Mobile Slide Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => {
                  setCurrentView(link.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-start px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === link.key
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Responsive 4-Column Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Column 1: About Firm */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? firmSettings.firmNameAr : firmSettings.firmNameEn}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {locale === 'ar' ? firmSettings.aboutContentAr : firmSettings.aboutContentEn}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>ISO 27001</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>ISO 9001</span>
                </span>
              </div>
            </div>

            {/* Column 2: Services (Top 4) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
                {t.services}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                {(footerServices.length > 0 ? footerServices : [
                  { id: '1', titleAr: 'التقاضي والتحكيم التجاري', titleEn: 'Commercial Litigation' },
                  { id: '2', titleAr: 'تأسيس الشركات وحوكمتها', titleEn: 'Corporate Governance' },
                  { id: '3', titleAr: 'حماية الملكية الفكرية', titleEn: 'Intellectual Property' },
                  { id: '4', titleAr: 'القضايا العقارية والإنشاءات', titleEn: 'Real Estate & Construction' },
                ]).map((srv) => (
                  <li key={srv.id}>
                    <button
                      onClick={() => setCurrentView('services')}
                      className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-start"
                    >
                      {locale === 'ar' ? srv.titleAr : srv.titleEn}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
                {locale === 'ar' ? 'روابط سريعة' : 'Quick Navigation'}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                {navLinks.map((link) => (
                  <li key={link.key}>
                    <button
                      onClick={() => setCurrentView(link.key)}
                      className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setCurrentView('login')}
                    className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    {t.clientPortal}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Hours */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
                {t.contact}
              </h4>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{locale === 'ar' ? firmSettings.addressAr : firmSettings.addressEn}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span dir="ltr" className="font-mono">{firmSettings.phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{firmSettings.email}</span>
                </li>
                <li className="flex items-center gap-2.5 pt-1">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{locale === 'ar' ? firmSettings.workingHoursAr : firmSettings.workingHoursEn}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Legal */}
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
                {locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}
              </span>
              <span>·</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
                {locale === 'ar' ? 'ترخيص وزارة العدل' : 'MoJ License'} ({firmSettings.licenseNumber})
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
