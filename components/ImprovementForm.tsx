
import React, { useState, useRef } from 'react';
import { ImprovementReport, DurumSecenekleri } from '../types';
import { Send, Loader2, Camera, MapPin, CheckCircle } from 'lucide-react';

interface ImprovementFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onReportAdded: (report: ImprovementReport) => void;
  onComplete: () => void;
}

export const ImprovementForm: React.FC<ImprovementFormProps> = ({ ekipKodu, sheetUrl, onReportAdded, onComplete }) => {
  const [formData, setFormData] = useState({
    yerlesimAdi: '',
    bakimTarihi: new Date().toISOString().split('T')[0],
    kabloDurumu: 'İYİ', menholDurumu: 'İYİ', direkDurumu: 'İYİ', direkDonanimDurumu: 'İYİ', kutuKabinDurumu: 'İYİ',
    takdirPuani: 5
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newReport: ImprovementReport = {
      id: crypto.randomUUID(), ...formData, photo: photo || undefined, location: location || undefined, ekipKodu,
      timestamp: new Date().toLocaleString('tr-TR'), status: 'sent', reportType: 'improvement'
    };
    if (sheetUrl) { try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(newReport) }); } catch (err) {} }
    onReportAdded(newReport);
    setIsSubmitting(false);
    onComplete();
  };

  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1.5 block";
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:border-teal-500 outline-none text-xs transition-all";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-teal-600 p-2.5 text-white flex items-center justify-center gap-2">
        <CheckCircle size={18} />
        <h3 className="font-black text-xs uppercase tracking-widest">İYİLEŞTİRME & BAKIM</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className={labelClass}>SANTRAL/SAHA/LOKAL</label>
          <input required type="text" className={inputClass} value={formData.yerlesimAdi} onChange={e => setFormData({...formData, yerlesimAdi: e.target.value})} placeholder="Santral, Saha veya Lokal Adı"/>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'kabloDurumu', label: 'KABLO' },
            { id: 'menholDurumu', label: 'MENHOL' },
            { id: 'direkDurumu', label: 'DİREK' },
            { id: 'kutuKabinDurumu', label: 'KUTU' }
          ].map(field => (
            <div key={field.id}>
              <label className={labelClass}>{field.label}</label>
              <select className={`${inputClass} appearance-none cursor-pointer`} value={(formData as any)[field.id]} onChange={e => setFormData({...formData, [field.id]: e.target.value})}>
                {DurumSecenekleri.map(d=><option key={d} value={d} className="text-slate-900 bg-white font-bold">{d}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} className={`flex items-center justify-center gap-2 border-2 border-dashed p-3 rounded-xl text-[10px] font-black transition-all ${photo ? 'bg-teal-50 border-teal-200 text-teal-700' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <Camera size={16} /> FOTOĞRAF
          </button>
          <button type="button" onClick={() => { navigator.geolocation.getCurrentPosition(p=>setLocation({lat:p.coords.latitude,lng:p.coords.longitude})); }} className={`flex items-center justify-center gap-2 border-2 border-dashed p-3 rounded-xl text-[10px] font-black transition-all ${location ? 'bg-teal-50 border-teal-200 text-teal-700' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <MapPin size={16} /> KONUM
          </button>
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={e=>{const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onloadend=()=>setPhoto(r.result as string); r.readAsDataURL(f);}}} />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase shadow-xl tracking-widest">
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} KAYIT ET
        </button>
      </form>
    </div>
  );
};
