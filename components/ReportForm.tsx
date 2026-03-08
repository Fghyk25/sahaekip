
import React, { useState, useRef } from 'react';
import { SorunTipi, Report } from '../types';
import { Send, Loader2, ClipboardList, Camera, MapPin } from 'lucide-react';

interface ReportFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onReportAdded: (report: Report) => void;
  onComplete: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ ekipKodu, sheetUrl, onReportAdded, onComplete }) => {
  const [formData, setFormData] = useState({ hizmetNo: '', saha: '', kutu: '', sorunTipi: SorunTipi.GPON_SEVIYE_YOK, aciklama: '' });
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHizmetNoChange = (val: string) => {
    const numericValue = val.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, hizmetNo: numericValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newReport: Report = {
      id: crypto.randomUUID(), ...formData, photo: photo || undefined, location: location || undefined,
      ekipKodu, timestamp: new Date().toLocaleString('tr-TR'), status: 'sent', reportType: 'problem'
    };
    if (sheetUrl) { try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(newReport) }); } catch (err) {} }
    onReportAdded(newReport);
    setIsSubmitting(false);
    onComplete();
  };

  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1 block";
  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none text-xs";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-blue-600 p-2.5 text-white flex items-center justify-center gap-2">
        <ClipboardList size={18} />
        <h3 className="font-black text-xs uppercase tracking-wider">SORUNLU İŞ BİLDİRİMİ</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-3.5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Hizmet No</label>
            <input required type="text" inputMode="numeric" pattern="\d{10}" minLength={10} maxLength={10} className={inputClass} value={formData.hizmetNo} onChange={e => handleHizmetNoChange(e.target.value)} placeholder="10 Haneli No"/>
            {formData.hizmetNo.length > 0 && formData.hizmetNo.length < 10 && <p className="text-[8px] text-red-500 font-bold">Eksik: {10 - formData.hizmetNo.length}</p>}
          </div>
          <div><label className={labelClass}>Santral/Saha</label><input required type="text" className={inputClass} value={formData.saha} onChange={e => setFormData({...formData, saha: e.target.value})} placeholder="SH-04"/></div>
          <div><label className={labelClass}>Kutu/Devre</label><input required type="text" className={inputClass} value={formData.kutu} onChange={e => setFormData({...formData, kutu: e.target.value})} placeholder="K-05"/></div>
          <div><label className={labelClass}>Sorun Tipi</label><select className={`${inputClass} appearance-none cursor-pointer`} value={formData.sorunTipi} onChange={e => setFormData({...formData, sorunTipi: e.target.value as SorunTipi})}>{Object.values(SorunTipi).map(t => <option key={t} value={t} className="text-slate-900 bg-white font-bold">{t}</option>)}</select></div>
        </div>
        <div><label className={labelClass}>Hata Detayı</label><input required type="text" className={inputClass} value={formData.aciklama} onChange={e => setFormData({...formData, aciklama: e.target.value})} placeholder="Kısa hata özeti..."/></div>
        
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} className={`flex items-center justify-center gap-2 border-2 border-dashed p-4 rounded-xl text-[10px] font-black transition-all ${photo ? 'bg-blue-50 border-blue-200 text-blue-700' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <Camera size={18}/> {photo?'FOTO TAMAM':'FOTO EKLE'}
          </button>
          <button type="button" onClick={() => { navigator.geolocation.getCurrentPosition(p=>setLocation({lat:p.coords.latitude,lng:p.coords.longitude})); }} className={`flex items-center justify-center gap-2 border-2 border-dashed p-4 rounded-xl text-[10px] font-black transition-all ${location ? 'bg-blue-50 border-blue-200 text-blue-700' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <MapPin size={18}/> {location?'GPS OK':'KONUM'}
          </button>
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={e => { const f = e.target.files?.[0]; if(f){const r=new FileReader(); r.onloadend=()=>setPhoto(r.result as string); r.readAsDataURL(f);} }} />
        </div>
        
        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs shadow-lg uppercase tracking-widest">
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} BİLDİRİMİ KAYDET
        </button>
      </form>
    </div>
  );
};
