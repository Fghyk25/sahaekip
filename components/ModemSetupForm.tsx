
import React, { useState } from 'react';
import { ModemSetupReport, ModemTipleri } from '../types';
import { Send, Loader2, Router, Wifi, CheckCircle2 } from 'lucide-react';

interface ModemSetupFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onReportAdded: (report: ModemSetupReport) => void;
  onComplete: () => void;
}

export const ModemSetupForm: React.FC<ModemSetupFormProps> = ({ ekipKodu, sheetUrl, onReportAdded, onComplete }) => {
  const [formData, setFormData] = useState({ hizmetNo: '', modemTipi: ModemTipleri[0], aciklama: 'KULLANICI ADI ŞİFRE' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHizmetNoChange = (val: string) => {
    const numericValue = val.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, hizmetNo: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newReport: ModemSetupReport = {
      id: crypto.randomUUID(), ...formData, ekipKodu,
      timestamp: new Date().toLocaleString('tr-TR'), status: 'sent', reportType: 'modem_setup'
    };
    if (sheetUrl) { try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(newReport) }); } catch (err) {} }
    onReportAdded(newReport);
    setIsSubmitting(false);
    onComplete();
  };

  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1.5 block";
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:border-indigo-500 outline-none text-xs transition-all";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-indigo-600 p-2.5 text-white flex items-center justify-center gap-2">
        <Router size={18} />
        <h3 className="font-black text-xs uppercase tracking-widest">MODEM KURULUM TALEBİ</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className={labelClass}>Hizmet No</label>
          <input required type="text" inputMode="numeric" pattern="[0-9]*" className={inputClass} value={formData.hizmetNo} onChange={e => handleHizmetNoChange(e.target.value)} placeholder="8821..."/>
        </div>
        
        <div>
          <label className={labelClass}>Modem Tipi</label>
          <select className={`${inputClass} cursor-pointer appearance-none`} value={formData.modemTipi} onChange={e => setFormData({...formData, modemTipi: e.target.value})}>
            {ModemTipleri.map(m => <option key={m} value={m} className="text-slate-900 bg-white font-bold">{m}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>İşlem Tipi</label>
          <select className={`${inputClass} cursor-pointer appearance-none`} value={formData.aciklama} onChange={e => setFormData({...formData, aciklama: e.target.value})}>
            {['KULLANICI ADI ŞİFRE', 'SİL TANIT', 'HIZ DÜŞÜR'].map(opt => (
              <option key={opt} value={opt} className="text-slate-900 bg-white font-bold">{opt}</option>
            ))}
          </select>
        </div>

        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center gap-3">
            <Wifi size={18} className="text-indigo-600 shrink-0" />
            <p className="text-[10px] text-indigo-800 font-bold uppercase leading-tight tracking-tighter">Wifi şifreleri ve aktivasyon sistemden otomatik tamamlanacaktır.</p>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase shadow-xl tracking-widest">
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} TALEBİ GÖNDER
        </button>
      </form>
    </div>
  );
};
