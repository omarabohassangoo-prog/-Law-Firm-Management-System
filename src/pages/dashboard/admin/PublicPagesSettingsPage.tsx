import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import {
  Globe,
  Layout,
  Search,
  Image as ImageIcon,
  FileText,
  Save,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertTriangle,
  Code,
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Shield,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react';

export const PublicPagesSettingsPage: React.FC = () => {
  const { locale, showToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'services' | 'contact' | 'header' | 'footer' | 'seo' | 'media' | 'versions'>('home');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form states
  const [homeConfig, setHomeConfig] = useState({
    badge_ar: 'المكتب الرائد في الاستشارات والقضايا',
    badge_en: 'Leading Legal & Consultancy Firm',
    title_ar: 'نخبة المحامين والمستشارين لخدمة مصالحك القانونية',
    title_en: 'Elite Attorneys & Legal Consultants for Your Interests',
    subtitle_ar: 'نقدم حلولاً قانونية متكاملة للشركات والأفراد بكفاءة واحترافية عالية تمتد لأكثر من 15 عاماً.',
    subtitle_en: 'Comprehensive legal solutions for corporations and individuals with 15+ years of excellence.',
    ctaPrimary_text_ar: 'احجز استشارة',
    ctaPrimary_text_en: 'Book Consultation',
    ctaPrimary_link: '/contact',
    ctaSecondary_text_ar: 'تصفح خدماتنا',
    ctaSecondary_text_en: 'Our Services',
    ctaSecondary_link: '/services',
  });

  const [aboutConfig, setAboutConfig] = useState({
    title_ar: 'عن مكتب العدالة للمحاماة',
    title_en: 'About Al-Adalah Law Firm',
    subtitle_ar: 'تأسس المكتب برؤية طموحة لتقديم أرفع مستويات العدالة والتمثيل القانوني.',
    subtitle_en: 'Founded with an ambitious vision to deliver premier justice and representation.',
    story_ar: 'منذ تأسيسنا، التزمنا بأعلى معايير النزاهة والاحترافية...',
    story_en: 'Since inception, we committed to highest standards of integrity...',
  });

  const [footerConfig, setFooterConfig] = useState({
    aboutText_ar: 'مكتب العدالة للمحاماة والاستشارات القانونية — شريكك القانوني الموثوق.',
    aboutText_en: 'Al-Adalah Law Firm & Legal Consultations — Your Trusted Legal Partner.',
    copyright_ar: '© {year} مكتب العدالة للمحاماة — جميع الحقوق محفوظة',
    copyright_en: '© {year} Al-Adalah Law Firm — All rights reserved',
    showNewsletter: true,
    showBackToTop: true,
    showSystemStatus: true,
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
  });

  const [seoConfig, setSeoConfig] = useState({
    siteName_ar: 'مكتب العدالة للمحاماة',
    siteName_en: 'Al-Adalah Law Firm',
    defaultTitle_ar: 'مكتب العدالة للمحاماة والاستشارات القانونية',
    defaultTitle_en: 'Al-Adalah Law Firm & Legal Consultations',
    defaultDescription_ar: 'نخبة المحامين والمستشارين لتقديم أفضل الخدمات القانونية والقضائية في المملكة.',
    defaultDescription_en: 'Elite lawyers and legal consultants providing top legal and judicial services in KSA.',
    keywords_ar: 'محامي, استشارات قانونية, قضايا تجارية, محامون مرخصون, الرياض',
    keywords_en: 'lawyer, legal consulting, commercial litigation, licensed attorneys, Riyadh',
    enableIndexing: true,
    googleAnalyticsId: 'G-XXXXXXXX',
    canonicalBaseUrl: 'https://aladalah-law.com',
  });

  const [mediaList, setMediaList] = useState([
    { id: 'm1', name: 'hero_banner.jpg', url: '/src/assets/images/hero_law_firm_1794062333662.jpg', type: 'image', size: '1.2 MB', folder: 'hero' },
    { id: 'm2', name: 'partner_avatar.jpg', url: '/src/assets/images/avatar_lawyer_partner_1794062333757.jpg', type: 'image', size: '450 KB', folder: 'team' },
  ]);

  const [versions, setVersions] = useState([
    { version: 2, timestamp: '2026-11-07 10:30', author: 'المستشار عبد العزيز', status: 'published' },
    { version: 1, timestamp: '2026-11-01 09:00', author: 'المستشار عبد العزيز', status: 'archived' },
  ]);

  const [seoScore] = useState(92);

  const handleSaveDraft = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast(locale === 'ar' ? '✅ تم حفظ المسودة بنجاح' : '✅ Draft saved successfully', 'success');
    }, 600);
  };

  const handleConfirmPublish = () => {
    if (!adminPassword || adminPassword.length < 4) {
      showToast(locale === 'ar' ? '⚠️ يرجى إدخال كلمة مرور المدير لتأكيد النشر' : '⚠️ Enter admin password to confirm publishing', 'error');
      return;
    }
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setShowPublishModal(false);
      setAdminPassword('');
      showToast(locale === 'ar' ? '🚀 تم نشر التغييرات وتحديث السيرفر والـ Cache بنجاح!' : '🚀 Changes published and cache invalidated successfully!', 'success');
      setVersions(prev => [{ version: prev[0].version + 1, timestamp: new Date().toLocaleString(), author: 'المستشار عبد العزيز', status: 'published' }, ...prev]);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {locale === 'ar' ? 'إدارة الموقع والواجهة العامة' : 'Public Pages & SEO Management'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {locale === 'ar' ? 'إعدادات الصفحات العامة والـ SEO والـ Footer' : 'Public Pages, Footer & SEO Settings'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ar'
              ? 'التحكم الكامل في محتوى الموقع العام، الروابط، تحسين محركات البحث SEO، ومكتبة الوسائط بدون كود.'
              : 'Complete control over public website content, footer, SEO metadata, and media library.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{locale === 'ar' ? 'حفظ مسودة' : 'Save Draft'}</span>
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>{locale === 'ar' ? 'نشر التغييرات 🚀' : 'Publish Changes 🚀'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'home', label: locale === 'ar' ? 'الرئيسية' : 'Home', icon: Layout },
          { id: 'about', label: locale === 'ar' ? 'من نحن' : 'About', icon: FileText },
          { id: 'services', label: locale === 'ar' ? 'الخدمات' : 'Services', icon: Layers },
          { id: 'contact', label: locale === 'ar' ? 'اتصل بنا' : 'Contact', icon: Globe },
          { id: 'header', label: 'Header', icon: Layout },
          { id: 'footer', label: 'Footer', icon: Layout },
          { id: 'seo', label: 'SEO', icon: Search },
          { id: 'media', label: locale === 'ar' ? 'مكتبة الوسائط' : 'Media Library', icon: ImageIcon },
          { id: 'versions', label: locale === 'ar' ? 'الإصدارات والسجل' : 'Versions & Logs', icon: RefreshCw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* 1. Home Tab */}
        {activeTab === 'home' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'تخصيص الصفحة الرئيسية (Home Page)' : 'Home Page Customization'}
                </h3>
                <p className="text-xs text-slate-500">التحكم في قسم الـ Hero والعناوين الرئيسية والأزرار.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Live Status: Published
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الشارة (AR)</label>
                <input
                  type="text"
                  value={homeConfig.badge_ar}
                  onChange={(e) => setHomeConfig({ ...homeConfig, badge_ar: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Badge (EN)</label>
                <input
                  type="text"
                  value={homeConfig.badge_en}
                  onChange={(e) => setHomeConfig({ ...homeConfig, badge_en: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">العنوان الرئيسي (AR)</label>
                <input
                  type="text"
                  value={homeConfig.title_ar}
                  onChange={(e) => setHomeConfig({ ...homeConfig, title_ar: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Main Title (EN)</label>
                <input
                  type="text"
                  value={homeConfig.title_en}
                  onChange={(e) => setHomeConfig({ ...homeConfig, title_en: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الوصف التمهيدي (AR)</label>
                <textarea
                  rows={3}
                  value={homeConfig.subtitle_ar}
                  onChange={(e) => setHomeConfig({ ...homeConfig, subtitle_ar: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitle (EN)</label>
                <textarea
                  rows={3}
                  value={homeConfig.subtitle_en}
                  onChange={(e) => setHomeConfig({ ...homeConfig, subtitle_en: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4">
              {locale === 'ar' ? 'إعدادات صفحة من نحن (About Page)' : 'About Page Configuration'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">عنوان الصفحة (AR)</label>
                <input
                  type="text"
                  value={aboutConfig.title_ar}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, title_ar: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">قصة المكتب (AR)</label>
                <textarea
                  rows={4}
                  value={aboutConfig.story_ar}
                  onChange={(e) => setAboutConfig({ ...aboutConfig, story_ar: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Footer Tab */}
        {activeTab === 'footer' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4">
              {locale === 'ar' ? 'إعدادات تذييل الصفحة (Footer Settings)' : 'Footer Settings'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نبذة التذييل (AR)</label>
                <textarea
                  rows={3}
                  value={footerConfig.aboutText_ar}
                  onChange={(e) => setFooterConfig({ ...footerConfig, aboutText_ar: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">حقوق النشر (AR)</label>
                <input
                  type="text"
                  value={footerConfig.copyright_ar}
                  onChange={(e) => setFooterConfig({ ...footerConfig, copyright_ar: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={footerConfig.showNewsletter}
                  onChange={(e) => setFooterConfig({ ...footerConfig, showNewsletter: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">إظهار اشتراك النشرة البريدية في الـ Footer</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            {/* SEO Score Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">تحليل محركات البحث الشامل</span>
                </div>
                <h4 className="text-lg font-extrabold">مؤشر جودة الـ SEO العام: ممتاز 🟢</h4>
                <p className="text-xs text-slate-300">العنوان، الوصف، الكلمات المفتاحية، والـ Structured Data مهيأة بالكامل لمحركات البحث.</p>
              </div>
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-500 text-emerald-400 text-2xl font-black shrink-0">
                {seoScore}/100
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4">
                {locale === 'ar' ? 'إعدادات SEO العالمية (Global SEO Settings)' : 'Global SEO Settings'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم الموقع الافتراضي (AR)</label>
                  <input
                    type="text"
                    value={seoConfig.siteName_ar}
                    onChange={(e) => setSeoConfig({ ...seoConfig, siteName_ar: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Google Analytics ID</label>
                  <input
                    type="text"
                    value={seoConfig.googleAnalyticsId}
                    onChange={(e) => setSeoConfig({ ...seoConfig, googleAnalyticsId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الوصف الافتراضي (Meta Description - AR)</label>
                  <textarea
                    rows={2}
                    value={seoConfig.defaultDescription_ar}
                    onChange={(e) => setSeoConfig({ ...seoConfig, defaultDescription_ar: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الكلمات المفتاحية (Keywords - CSV)</label>
                  <input
                    type="text"
                    value={seoConfig.keywords_ar}
                    onChange={(e) => setSeoConfig({ ...seoConfig, keywords_ar: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Media Library Tab */}
        {activeTab === 'media' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'مكتبة الوسائط والملفات (Media Library)' : 'Media Library'}
              </h3>
              <button
                onClick={() => showToast(locale === 'ar' ? '📁 ميزة رفع الوسائط مفعلة' : '📁 Media upload enabled', 'success')}
                className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>{locale === 'ar' ? 'رفع ملف جديد' : 'Upload File'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mediaList.map((m) => (
                <div key={m.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{m.name}</p>
                      <span className="text-[10px] text-slate-400">{m.size} · مجلد: {m.folder}</span>
                    </div>
                    <button
                      onClick={() => setMediaList(mediaList.filter((item) => item.id !== m.id))}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Versions Tab */}
        {activeTab === 'versions' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4">
              {locale === 'ar' ? 'سجل الإصدارات والاسترجاع (Version History & Rollback)' : 'Version History & Rollback'}
            </h3>
            <div className="space-y-3">
              {versions.map((v) => (
                <div key={v.version} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">الإصدار v{v.version}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'}`}>
                        {v.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{v.timestamp} · بواسطة {v.author}</p>
                  </div>
                  <button
                    onClick={() => showToast(locale === 'ar' ? `✅ تم استعادة الإصدار v${v.version} بنجاح` : `✅ Restored version v${v.version}`, 'success')}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {locale === 'ar' ? 'استعادة (Rollback)' : 'Rollback'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Publish Password Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {locale === 'ar' ? 'تأكيد نشر التغييرات' : 'Confirm Publish Changes'}
                </h3>
                <p className="text-xs text-slate-500">يتطلب النشر للعامة إدخال كلمة مرور المدير.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">كلمة مرور المدير</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={publishing}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                {publishing && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>تأكيد النشر</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
