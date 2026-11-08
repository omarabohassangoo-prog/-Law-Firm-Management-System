import React, { useState } from 'react';
import { useAppStore } from '../../../../store/appStore';
import {
  FileText,
  Printer,
  BarChart3,
  Bell,
  Plus,
  Search,
  Eye,
  Download,
  Play,
  CheckCircle2,
  Copy,
  Edit3,
  Code2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface TemplateItem {
  id: string;
  name: string;
  type: 'print' | 'report' | 'notification';
  description: string;
  category: string;
  sampleData: Record<string, any>;
}

export const TemplatesDashboardPage: React.FC = () => {
  const { locale, firmSettings, currentUser, showToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'print' | 'report' | 'notification'>('print');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [rendering, setRendering] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [templateDataJson, setTemplateDataJson] = useState<string>('');

  const standardTemplates: TemplateItem[] = [
    {
      id: 'legal-notice-ar',
      name: 'إنذار عدلي وتنبيه قانوني رسمي',
      type: 'print',
      category: 'مطالبات ومنازعات',
      description: 'قالب إنذار رسمي موجه للخصوم مع أرقام التراخيص، الباركود، والختم الزمني المشفر.',
      sampleData: {
        date: new Date().toISOString().split('T')[0],
        opponentName: 'شركة التقنية المتقدمة للتجارة',
        clientName: 'شركة الأفق للاستثمار والتطوير',
        caseNumber: 'CAS-2024-001',
        amount: '185,000',
        contractDate: '2023-05-15',
        lawyerName: currentUser.name || 'د. خالد المنصور',
        barcode: 'SA-LEGAL-789012',
        timestamp: new Date().toUTCString(),
      },
    },
    {
      id: 'retainer-contract-ar',
      name: 'عقد اتفاقية أتعاب محاماة وتمثيل قضائي',
      type: 'print',
      category: 'عقود واتفاقيات',
      description: 'صيغة نموذجية معتمدة لعقد تمثيل قضائي وتحديد الأتعاب والدفوع وفق نظام المحاماة.',
      sampleData: {
        date: new Date().toISOString().split('T')[0],
        lawyerName: currentUser.name || 'أ. عبد العزيز المقرن',
        clientName: 'سعود بن عبد الله الفايز',
        nationalId: '1087654321',
        caseNumber: 'CAS-2024-002',
        court: 'المحكمة التجارية بالرياض',
        fee: '45,000',
      },
    },
  ];

  const handleSelectTemplate = async (template: TemplateItem) => {
    setSelectedTemplate(template);
    setTemplateDataJson(JSON.stringify(template.sampleData, null, 2));
    await renderTemplatePreview(template.id, template.sampleData);
  };

  const renderTemplatePreview = async (templateId: string, data: any) => {
    setRendering(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (response.ok) {
        const html = await response.text();
        setPreviewHtml(html);
      } else {
        showToast('تعذر معالجة القالب عبر محرك Handlebars', 'error');
      }
    } catch (err) {
      console.warn('Render error:', err);
      showToast('خطأ في الاتصال بمحرك القوالب', 'error');
    } finally {
      setRendering(false);
    }
  };

  const handleUpdatePreview = () => {
    if (!selectedTemplate) return;
    try {
      const parsed = JSON.parse(templateDataJson);
      renderTemplatePreview(selectedTemplate.id, parsed);
      showToast('تم تحديث المعاينة الحية للمستند بنجاح', 'success');
    } catch (e) {
      showToast('يرجى التحقق من صحة صياغة بيانات JSON', 'error');
    }
  };

  const handleExportPdf = async () => {
    if (!selectedTemplate) return;
    setExporting(true);
    try {
      const parsed = JSON.parse(templateDataJson);
      const response = await fetch(`/api/templates/${selectedTemplate.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsed, format: 'pdf' }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTemplate.id}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('تم توليد وتنزيل ملف الـ PDF بنجاح عبر محرك Puppeteer', 'success');
      } else {
        showToast('فشل تصدير ملف الـ PDF', 'error');
      }
    } catch (err) {
      showToast('خطأ أثناء تصدير مستند الـ PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {locale === 'ar' ? 'استوديو ومحرر القوالب القانونية المتكامل' : 'Legal Template Studio & Generator'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {locale === 'ar' ? 'محرر النماذج وتوليد مستندات PDF المعتمدة' : 'Template Studio & PDF Generation Engine'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ar'
              ? 'توليد المذكرات والعقود والإنذارات آلياً مع الباركود والأرقام التسلسلية ومحرك Handlebars و Puppeteer.'
              : 'Automated legal briefs, retainer contracts, barcodes, Handlebars & Puppeteer engine.'}
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Templates Selector (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {locale === 'ar' ? 'القوالب القانونية الجاهزة' : 'Standard Legal Templates'}
            </h3>
            <div className="space-y-2">
              {standardTemplates.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`w-full text-start p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{tpl.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{tpl.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Data Editor */}
          {selectedTemplate && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-amber-500" />
                  <span>متغيرات القالب (JSON Data):</span>
                </span>
                <button
                  onClick={handleUpdatePreview}
                  disabled={rendering}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <RefreshCw className={`w-3 h-3 ${rendering ? 'animate-spin' : ''}`} />
                  <span>تحديث المعاينة</span>
                </button>
              </div>

              <textarea
                rows={9}
                value={templateDataJson}
                onChange={(e) => setTemplateDataJson(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Live Preview & Export Container (Right 8 cols) */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-full min-h-[580px]">
            {/* Action Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedTemplate
                    ? `المعاينة المباشرة: ${selectedTemplate.name}`
                    : 'يرجى اختيار قالب من القائمة لبدء المعاينة والتوليد'}
                </span>
              </div>

              {selectedTemplate && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPdf}
                    disabled={exporting}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-amber-400 dark:text-slate-950 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    {exporting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{locale === 'ar' ? 'تصدير وتحميل PDF رسمي' : 'Export Official PDF'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Preview Frame */}
            <div className="p-6 flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              {previewHtml ? (
                <div
                  className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-md p-6 border border-slate-200 min-h-[480px]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="text-center space-y-3 p-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-500">
                    اختر أي نموذج من القائمة على اليمين لمعاينته فوراً وتعديل متغيراته وتصديره لـ PDF
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
