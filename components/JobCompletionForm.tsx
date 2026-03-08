
import React, { useState } from 'react';
import { JobCompletionReport } from '../types';
import { Loader2, CheckCircle2, ListOrdered, TrendingUp, Activity } from 'lucide-react';

interface JobCompletionFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  jobCompletions: JobCompletionReport[];
  onReportAdded: (report: JobCompletionReport) => void;
  onComplete: () => void;
}

export const JobCompletionForm: React.FC<JobCompletionFormProps> = ({ ekipKodu, sheetUrl, jobCompletions, onReportAdded, onComplete }) => {
  const [hizmetNo, setHizmetNo] = useState('');
  const [isTipi, setIsTipi] = useState<'ARIZA' | 'TESİS'>('ARIZA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const arizaCount = jobCompletions.filter(jc => jc.isTipi === 'ARIZA').reduce((acc, curr) => acc + curr.isAdedi, 0);
  const tesisCount = jobCompletions.filter(jc => jc.isTipi === 'TESİS').reduce((acc, curr) => acc + curr.isAdedi, 0);

  const handleHizmetNoChange = (val: string) => {
    const numericValue = val.replace(/[^0-9]/g, '').slice(0, 10);
    setHizmetNo(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newReport: JobCompletionReport = {
      id: crypto.randomUUID(),
      hizmetNo, isTipi, isAdedi: 1, ekipKodu,
      timestamp: new Date().toLocaleString('tr-TR'),
      status: 'sent',
      reportType: 'job_completion'
    };
    if (sheetUrl) { try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(newReport) }); } catch (err) {} }
    onReportAdded(newReport);
    setIsSubmitting(false);
    setHizmetNo('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-orange-600 p-2 text-white flex items-center justify-center gap-2">
        <ListOrdered size={16} />
        <h3 className="font-black text-xs uppercase tracking-tighter">İŞ TAMAMLAMA SAYAÇLARI</h3>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg text-center">
            <span className="text-[8px] font-black text-orange-600 uppercase block">ARIZA</span>
            <div className="text-xl font-black text-orange-700">{arizaCount}</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-center">
            <span className="text-[8px] font-black text-blue-600 uppercase block">TESİS</span>
            <div className="text-xl font-black text-blue-700">{tesisCount}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase block leading-none">Hizmet No</label>
            <input required type="text" inputMode="numeric" pattern="\d{10}" minLength={10} maxLength={10} className="w-full px-3 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-bold text-center tracking-widest text-lg" value={hizmetNo} onChange={e => handleHizmetNoChange(e.target.value)} placeholder="10 HANELİ NO" />
            {hizmetNo.length > 0 && hizmetNo.length < 10 && <p className="text-[8px] text-red-500 font-bold text-center">Eksik: {10 - hizmetNo.length} hane kaldı</p>}
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button type="button" onClick={() => setIsTipi('ARIZA')} className={`flex-1 py-2.5 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1 ${isTipi === 'ARIZA' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>
              <Activity size={14} /> ARIZA
            </button>
            <button type="button" onClick={() => setIsTipi('TESİS')} className={`flex-1 py-2.5 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1 ${isTipi === 'TESİS' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
              <TrendingUp size={14} /> TESİS
            </button>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md uppercase tracking-widest text-sm">
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} className="text-orange-400" />}
            SİSTEME İŞLE
          </button>
        </form>
      </div>
    </div>
  );
};
