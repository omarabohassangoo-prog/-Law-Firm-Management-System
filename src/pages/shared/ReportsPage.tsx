import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { StatCard } from '../../components/ui/StatCard';
import { BarChart3, CreditCard, Briefcase, FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { locale, cases, invoices, clients, firmSettings, showToast } = useAppStore();
  const t = useTranslation(locale);

  const totalBilled = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalCollected = invoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
  const totalVAT = invoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.taxAmount, 0);

  const categoriesCount = {
    commercial: cases.filter((c) => c.category === 'commercial').length,
    civil: cases.filter((c) => c.category === 'civil').length,
    criminal: cases.filter((c) => c.category === 'criminal').length,
    labor: cases.filter((c) => c.category === 'labor').length,
    administrative: cases.filter((c) => c.category === 'administrative').length,
    family: cases.filter((c) => c.category === 'family').length,
  };

  const handleExportReport = () => {
    showToast(locale === 'ar' ? 'تم تجهيز تقرير الأداء المالي والتشغيلي وتحميله' : 'Performance report generated and downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.navReports}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'مؤشرات الأداء المالي والتشغيلي، التدفقات النقدية، ونسب إنجاز القضايا'
              : 'Operational KPIs, cashflow analysis, matter velocity, and tax settlements'}
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'تصدير التقرير الشامل (Excel)' : 'Export Full Report (Excel)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={locale === 'ar' ? 'إجمالي المطالبات والأتعاب المصدرة' : 'Gross Billed Fees'}
          value={`${totalBilled.toLocaleString()} ${firmSettings.currency}`}
          subtitle={locale === 'ar' ? `${invoices.length} فواتير مسجلة` : `${invoices.length} invoices issued`}
          icon={CreditCard}
        />
        <StatCard
          title={locale === 'ar' ? 'نسبة التحصيل الفعلي' : 'Collection Rate'}
          value={`${totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0}%`}
          subtitle={`${totalCollected.toLocaleString()} ${firmSettings.currency} ${locale === 'ar' ? 'محصل' : 'collected'}`}
          icon={BarChart3}
          trend={{ value: '+9.2%', isPositive: true }}
        />
        <StatCard
          title={locale === 'ar' ? 'ضريبة القيمة المضافة المسددة' : 'VAT 15% Settled'}
          value={`${totalVAT.toFixed(2)} ${firmSettings.currency}`}
          subtitle={locale === 'ar' ? 'إقرار هيئة الزكاة والضريبة' : 'ZATCA quarterly filing'}
          icon={CreditCard}
        />
      </div>

      {/* Caseload Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            {locale === 'ar' ? 'توزيع القضايا حسب الاختصاص القضائي' : 'Caseload by Practice Area'}
          </h3>
          <div className="space-y-3">
            {[
              { labelAr: 'القضايا والمنازعات التجارية', labelEn: 'Commercial & Corporate', count: categoriesCount.commercial, pct: 40 },
              { labelAr: 'التركات والأحوال الشخصية', labelEn: 'Estate & Family Law', count: categoriesCount.family, pct: 25 },
              { labelAr: 'القضاء الإداري (ديوان المظالم)', labelEn: 'Administrative Law', count: categoriesCount.administrative, pct: 15 },
              { labelAr: 'النزاعات العمالية', labelEn: 'Labor & Employment', count: categoriesCount.labor, pct: 10 },
              { labelAr: 'القضايا المدنية والعقارية', labelEn: 'Civil & Real Estate', count: categoriesCount.civil, pct: 10 },
            ].map((cat, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>{locale === 'ar' ? cat.labelAr : cat.labelEn}</span>
                  <span className="tabular-nums font-bold text-slate-900 dark:text-slate-100">{cat.count} {locale === 'ar' ? 'قضايا' : 'cases'}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 dark:bg-amber-400 rounded-full"
                    style={{ width: `${Math.max(10, cat.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Flow by Month */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            {locale === 'ar' ? 'التدفقات النقدية والتحصيل الربعي' : 'Quarterly Cashflow Distribution'}
          </h3>
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">الربع الأول (Q1 2026)</span>
                <span className="text-slate-400 text-[11px]">أتعاب تأسيس شركات وتحكيم</span>
              </div>
              <span className="font-bold text-sm tabular-nums text-slate-900 dark:text-slate-100">185,000 {firmSettings.currency}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">الربع الثاني (Q2 2026)</span>
                <span className="text-slate-400 text-[11px]">مستخلصات المقاولات والنزاعات العقدية</span>
              </div>
              <span className="font-bold text-sm tabular-nums text-slate-900 dark:text-slate-100">220,000 {firmSettings.currency}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">الربع الثالث (Q3 2026)</span>
                <span className="text-slate-400 text-[11px]">تصفية التركات والاستشارات السنوية</span>
              </div>
              <span className="font-bold text-sm tabular-nums text-slate-900 dark:text-slate-100">195,000 {firmSettings.currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
