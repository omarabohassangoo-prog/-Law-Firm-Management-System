import { Request, Response } from 'express';
import { TemplateService } from './templates.service';
import { getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { doc } from 'firebase/firestore';

export const STANDARD_TEMPLATES: Record<string, any> = {
  'legal-notice-ar': {
    id: 'legal-notice-ar',
    type: 'print',
    name: 'إنذار عدلي وقانوني رسمي',
    content: `
      <div style="font-family: Arial, sans-serif; direction: rtl; padding: 30px; line-height: 1.8;">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px;">مكتب العدالة للمحاماة والاستشارات القانونية</h1>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">ترخيص رقم: 1029384756 | سجل تجاري: 1010887766</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0 0 10px; font-size: 18px; text-align: center;">إنـذار وتنبـيه عـدلي رسـمي</h2>
          <p style="margin: 4px 0;"><strong>التاريخ:</strong> {{date}}</p>
          <p style="margin: 4px 0;"><strong>إلى المنذر ضده:</strong> {{opponentName}}</p>
          <p style="margin: 4px 0;"><strong>بناءً على طلب الموكل:</strong> {{clientName}}</p>
          <p style="margin: 4px 0;"><strong>رقم الملف / القضية:</strong> {{caseNumber}}</p>
        </div>
        <div style="font-size: 14px; color: #1e293b; margin-bottom: 30px;">
          <p>بصفتنا الوكلاء الشرعيين للموكل أعلاه، نوجه إليكم هذا الإنذار الرسمي لسداد المبلغ المستحق وقدره <strong>{{amount}} ريال سعودي</strong> الناتج عن الإخلال بالعقد المؤرخ في {{contractDate}}.</p>
          <p>نمنحكم مهلة أقصاها <strong>(خمسة أيام عمل)</strong> من تاريخ استلام هذا الإنذار لتسوية النزاع ودياً، وفي حال عدم الالتزام سيتم قيد الدعوى لدى المحكمة المختصة والمطالبة بالأصل والأتعاب والتعويضات.</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 40px; border-top: 1px dashed #cbd5e1; pt: 20px;">
          <div>
            <p style="margin: 0; font-weight: bold;">ختم وتوقيع المحامي المسؤول:</p>
            <p style="margin: 5px 0 0; color: #475569;">{{lawyerName}}</p>
          </div>
          <div style="text-align: left; font-family: monospace; font-size: 11px; color: #64748b;">
            <p style="margin: 0;">Verified Barcode: {{barcode}}</p>
            <p style="margin: 2px 0 0;">TSA Timestamp: {{timestamp}}</p>
          </div>
        </div>
      </div>
    `,
  },
  'retainer-contract-ar': {
    id: 'retainer-contract-ar',
    type: 'print',
    name: 'عقد اتفاقية أتعاب محاماة وتمثيل قضائي',
    content: `
      <div style="font-family: Arial, sans-serif; direction: rtl; padding: 30px; line-height: 1.8;">
        <h2 style="text-align: center; color: #0f172a; margin-bottom: 25px;">عـقد أتعـاب وتمـثيل قضـائي</h2>
        <p>بعون الله وتوفيقه، تم الاتفاق في يوم {{date}} بين كل من:</p>
        <p><strong>الطرف الأول (المكتب):</strong> مكتب العدالة للمحاماة، ويمثله المحامي {{lawyerName}}.</p>
        <p><strong>الطرف الثاني (الموكل):</strong> {{clientName}}، هوية/سجل رقم: {{nationalId}}.</p>
        <p><strong>موضوع التمثيل:</strong> الترافع والمدافعة في القضية المقيدة برقم {{caseNumber}} لدى {{court}}.</p>
        <p><strong>الأتعاب المتفق عليها:</strong> مبلغ وقدره {{fee}} ريال سعودي، غير شاملة ضريبة القيمة المضافة.</p>
        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p>حرر هذا العقد من نسختين أصليتين بيد كل طرف نسخة للعمل بموجبها نظاماً.</p>
        </div>
      </div>
    `,
  },
};

export const TemplateController = {
  async render(req: Request, res: Response) {
    const { id } = req.params;
    const { data } = req.body;

    let template: any = STANDARD_TEMPLATES[id];

    if (!template) {
      try {
        const templateDoc = await getDoc(doc(db, 'templates', id));
        if (templateDoc.exists()) {
          template = templateDoc.data();
        }
      } catch (e) {
        console.warn('Firestore template fetch fallback:', e);
      }
    }

    if (!template) {
      // Direct raw render if content provided in body
      if (req.body.content) {
        template = { type: 'print', content: req.body.content };
      } else {
        return res.status(404).send('Template not found');
      }
    }

    const rendered = await TemplateService.renderTemplate(template, data || {});
    res.send(rendered);
  },

  async export(req: Request, res: Response) {
    const { id } = req.params;
    const { data, format } = req.body;

    let template: any = STANDARD_TEMPLATES[id];

    if (!template) {
      try {
        const templateDoc = await getDoc(doc(db, 'templates', id));
        if (templateDoc.exists()) {
          template = templateDoc.data();
        }
      } catch (e) {
        console.warn('Firestore template fetch fallback:', e);
      }
    }

    if (!template) {
      if (req.body.content) {
        template = { type: 'print', content: req.body.content };
      } else {
        return res.status(404).send('Template not found');
      }
    }

    const buffer = await TemplateService.exportTemplate(template, data || {}, format);

    res.setHeader(
      'Content-Type',
      format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
  },

  async list(req: Request, res: Response) {
    const list = Object.values(STANDARD_TEMPLATES).map((t: any) => ({
      id: t.id,
      name: t.name,
      type: t.type,
    }));
    res.json(list);
  },
};
