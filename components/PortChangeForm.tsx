
import React, { useState } from 'react';
import { PortChangeReport } from '../types';
import { Send, Loader2, CheckCircle2, Shuffle, Hash } from 'lucide-react';
import { pb } from '../lib/pocketbase';

interface PortChangeFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onReportAdded: (report: PortChangeReport) => void;
  onComplete: () => void;
}

export const PortChangeForm: React.FC<PortChangeFormProps> = ({ ekipKodu, sheetUrl, onReportAdded, onComplete }) => {
  const [formData, setFormData] = useState({ hizmetNo: '', yeniPort: '', yeniDevre: '', aciklama: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHizmetNoChange = (val: string) => {
    const numericValue = val.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, hizmetNo: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newReport: PortChangeReport = {
      id: crypto.randomUUID(), ...formData, ekipKodu,
      timestamp: new Date().toLocaleString('tr-TR'), status: 'sent', reportType: 'port_change'
    };

    try {
      // 1. Try PocketBase
      try {
        await pb.collection('reports').create({
          type: 'Port / Devre Değişimleri',
          ekip_kodu: ekipKodu,
          data: JSON.stringify(newReport)
        });
      } catch (pbErr) {
        console.warn("PocketBase submission failed, falling back to Sheets:", pbErr);
        // 2. Fallback to Google Sheets
        if (sheetUrl) {
          await fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(newReport)
          });
        }
      }
      
      onReportAdded(newReport);
      onComplete();
    } catch (err) {
      console.error("Submission error:", err);
      alert("Gönderim hatası!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "text-[9px] font-black text-slate-500 uppercase leading-none mb-0.5 block";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-violet-700 p-2 text-white flex items-center justify-center gap-2">
        <Shuffle size={16} />
        <h3 className="font-black text-xs uppercase">PORT / DEVRE DEĞİŞİMİ</h3>
      </div>
      <div className="p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-0.5">
            <label className={labelClass}>Hizmet No</label>
            <input required type="text" inputMode="numeric" pattern="\d{10}" minLength={10} maxLength={10} className="w-full px-3 py-2 rounded-lg border text-xs font-bold" value={formData.hizmetNo} onChange={e => handleHizmetNoChange(e.target.value)} placeholder="10 Haneli No" />
            {formData.hizmetNo.length > 0 && formData.hizmetNo.length < 10 && <p className="text-[8px] text-red-500 font-bold">Eksik: {10 - formData.hizmetNo.length}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className={labelClass}>Yeni Port</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border text-xs font-bold" value={formData.yeniPort} onChange={e => setFormData({...formData, yeniPort: e.target.value})} placeholder="S-P" />
            </div>
            <div className="space-y-0.5">
              <label className={labelClass}>Yeni Devre</label>
              <input type="text" className="w-full px-3 py-2 rounded-lg border text-xs font-bold" value={formData.yeniDevre} onChange={e => setFormData({...formData, yeniDevre: e.target.value})} placeholder="D-No" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs shadow-md uppercase">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} KAYDET
          </button>
        </form>
      </div>
    </div>
  );
};
