import React, { useRef, useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAppStore } from '../../store/appStore';
import { PenTool, CheckCircle, RotateCcw, ShieldCheck, Lock, Hash, Clock } from 'lucide-react';
import { DocumentItem } from '../../types';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentItem: DocumentItem | null;
  onSignComplete: (docId: string, signatureDataUrl: string, signerName: string) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  documentItem,
  onSignComplete,
}) => {
  const { locale, currentUser } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(currentUser.name || '');

  // Reset or clear canvas when modal opens
  useEffect(() => {
    if (isOpen) {
      setSignerName(currentUser.name || '');
      setHasDrawn(false);
      setTimeout(() => {
        handleClear();
      }, 50);
    }
  }, [isOpen, currentUser.name]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmSignature = () => {
    if (!documentItem || !hasDrawn) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL('image/png');
    onSignComplete(documentItem.id, signatureDataUrl, signerName);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        locale === 'ar'
          ? 'التوقيع الإلكتروني المعتمد والختم الزمني المشفر'
          : 'Digital E-Signature & TSA Verification'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Document Info Header */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">{documentItem?.title}</p>
            <p className="text-slate-500 font-mono">{documentItem?.fileName}</p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            {documentItem?.category}
          </span>
        </div>

        {/* Signer Name Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {locale === 'ar' ? 'اسم الموقع قانونياً:' : 'Signer Legal Name:'}
          </label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
            placeholder={locale === 'ar' ? 'اكتب الاسم الرباعي...' : 'Full legal name...'}
          />
        </div>

        {/* Signature Canvas Area */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-amber-500" />
              <span>{locale === 'ar' ? 'لوحة التوقيع الحي:' : 'Live Signature Pad:'}</span>
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{locale === 'ar' ? 'مسح وإعادة' : 'Clear'}</span>
            </button>
          </div>

          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={450}
              height={160}
              className="w-full h-40 touch-none cursor-crosshair block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs font-medium text-slate-400">
                {locale === 'ar' ? 'وقع هنا بواسطة الفأرة أو شاشة اللمس' : 'Sign here using mouse or touch'}
              </div>
            )}
          </div>
        </div>

        {/* Legal & TSA Security Badges */}
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{locale === 'ar' ? 'معايير الأمان والتوافق النظامي المعتمدة' : 'Compliance & Security Attestation'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-emerald-700 dark:text-emerald-400">
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>بصمة SHA-256 مشفرة</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>ختم زمني RFC-3161 TSA</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>غير قابل للتعديل بعد التوقيع</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>متوافق مع نظام التعاملات الإلكترونية</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirmSignature}
            disabled={!hasDrawn || !signerName.trim()}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{locale === 'ar' ? 'اعتماد وتثبيت التوقيع المشفر' : 'Confirm & Apply Signature'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
