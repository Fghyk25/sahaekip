
import React, { useState } from 'react';
import { VehicleLog } from '../types';
import { Car, Gauge, CheckCircle2, Loader2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';

interface VehicleLogFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onReportAdded: (report: VehicleLog) => void;
  onComplete: () => void;
}

export const VehicleLogForm: React.FC<VehicleLogFormProps> = ({ ekipKodu, sheetUrl, onReportAdded, onComplete }) => {
  const [plaka, setPlaka] = useState('');
  const [kilometre, setKilometre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newLog: VehicleLog = {
      id: crypto.randomUUID(),
      plaka: plaka.toUpperCase(),
      kilometre: Number(kilometre),
      ekipKodu,
      timestamp: new Date().toLocaleString('tr-TR'),
      status: 'sent',
      reportType: 'vehicle_log'
    };

    try {
      // 1. Try PocketBase
      try {
        await pb.collection('reports').create({
          type: 'Araç Kilometre Kayıtları',
          ekip_kodu: ekipKodu,
          data: JSON.stringify(newLog)
        });
      } catch (pbErr) {
        console.warn("PocketBase submission failed, falling back to Sheets:", pbErr);
        // 2. Fallback to Google Sheets
        if (sheetUrl) {
          await fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(newLog)
          });
        }
      }
      
      onReportAdded(newLog);
      onComplete();
    } catch (err) {
      console.error("Submission error:", err);
      alert("Gönderim hatası!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-cyan-700 p-2 text-white flex items-center justify-center gap-2">
        <Car size={16} />
        <h3 className="font-black text-xs uppercase">İŞ BAŞI & ARAÇ KAYDI</h3>
      </div>
      <div className="p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase block">Plaka</label>
              <input required type="text" className="w-full px-3 py-3 rounded-lg border border-slate-300 font-black text-sm uppercase text-center" value={plaka} onChange={e => setPlaka(e.target.value)} placeholder="34 ABC 12" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase block">KM</label>
              <input required type="number" className="w-full px-3 py-3 rounded-lg border border-slate-300 font-black text-sm text-center" value={kilometre} onChange={e => setKilometre(e.target.value)} placeholder="00000" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md uppercase tracking-widest text-sm">
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} className="text-cyan-400" />}
            İŞ BAŞI YAP
          </button>
          <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-tighter italic">Lütfen plakayı örneğe uygun yazınız</p>
        </form>
      </div>
    </div>
  );
};
