
import React, { useState, useRef } from 'react';
import { DamageReport } from '../types';
import { Send, Loader2, FileText, Camera, MapPin, AlertOctagon } from 'lucide-react';

interface DamageReportFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onReportAdded: (report: DamageReport) => void;
  onComplete: () => void;
}

export const DamageReportForm: React.FC<DamageReportFormProps> = ({ ekipKodu, sheetUrl, onReportAdded, onComplete }) => {
  const [formData, setFormData] = useState({
    projeId: '', hasarYapanAdSoyad: '', tcKimlik: '', vergiNo: '', telNo: '', cepTel: '',
    hasarYapanAdres: '', hasarTarihi: new Date().toISOString().split('T')[0],
    hasarSaati: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    hasarYeri: '', hasarOlusSekli: '', tesisCinsiMiktari: '', etkilenenAboneSayisi: '',
    duzenleyenPersonel: '', duzenleyenUnvan: '', tanikBilgileri: '', guvenlikGorevlisi: '',
    ihbarEden: '', kullanilanMalzemeler: ''
  });

  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newReport: DamageReport = {
      id: crypto.randomUUID(), ...formData, photo: photo || undefined, location: location || undefined,
      ekipKodu, timestamp: new Date().toLocaleString('tr-TR'), status: 'sent', reportType: 'damage_report'
    };
    if (sheetUrl) { try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(newReport) }); } catch (err) {} }
    onReportAdded(newReport);
    setIsSubmitting(false);
    onComplete();
  };

  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1 block";
  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold outline-none text-xs focus:border-red-500 transition-colors";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-red-600 p-2.5 text-white flex items-center justify-center gap-2">
        <AlertOctagon size={18} />
        <h3 className="font-black text-xs uppercase tracking-wider">HASAR TESPİT TUTANAĞI</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-3.5 space-y-4 overflow-y-auto max-h-[75vh]">
        <div className="grid grid-cols-3 gap-2">
           <div><label className={labelClass}>Proje ID</label><input required type="text" className={inputClass} value={formData.projeId} onChange={e=>setFormData({...formData, projeId:e.target.value})} placeholder="P-123"/></div>
           <div><label className={labelClass}>Tarih</label><input type="date" className={inputClass} value={formData.hasarTarihi} onChange={e=>setFormData({...formData, hasarTarihi:e.target.value})}/></div>
           <div><label className={labelClass}>Saat</label><input type="time" className={inputClass} value={formData.hasarSaati} onChange={e=>setFormData({...formData, hasarSaati:e.target.value})}/></div>
        </div>

        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-1.5 flex items-center justify-between">
              <span>Fail / Muhatap Bilgileri</span>
           </h4>
           <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2"><label className={labelClass}>Ad Soyad / Şirket Unvanı</label><input required type="text" className={inputClass} value={formData.hasarYapanAdSoyad} onChange={e=>setFormData({...formData, hasarYapanAdSoyad:e.target.value})} placeholder="Fail Bilgisi"/></div>
              <div><label className={labelClass}>TC Kimlik No</label><input type="text" className={inputClass} value={formData.tcKimlik} onChange={e=>setFormData({...formData, tcKimlik:e.target.value})} placeholder="11 Hane"/></div>
              <div><label className={labelClass}>Vergi No</label><input type="text" className={inputClass} value={formData.vergiNo} onChange={e=>setFormData({...formData, vergiNo:e.target.value})} placeholder="Vergi No"/></div>
              <div><label className={labelClass}>İrtibat Tel</label><input type="tel" className={inputClass} value={formData.telNo} onChange={e=>setFormData({...formData, telNo:e.target.value})} placeholder="Sabit Hat"/></div>
              <div><label className={labelClass}>Cep Telefonu</label><input type="tel" className={inputClass} value={formData.cepTel} onChange={e=>setFormData({...formData, cepTel:e.target.value})} placeholder="05XX..."/></div>
           </div>
           <div><label className={labelClass}>Daimi Tebligat Adresi</label><input type="text" className={inputClass} value={formData.hasarYapanAdres} onChange={e=>setFormData({...formData, hasarYapanAdres:e.target.value})} placeholder="Şahıs/Firma yasal adresi"/></div>
        </div>

        <div className="space-y-3">
           <div><label className={labelClass}>Hasar Mevkii (Açık Adres)</label><input required type="text" className={inputClass} value={formData.hasarYeri} onChange={e=>setFormData({...formData, hasarYeri:e.target.value})} placeholder="Sokak, Bina No, Önemli Mevki"/></div>
           <div><label className={labelClass}>Olayın Özeti ve Oluş Şekli</label><textarea required className={`${inputClass} h-16 resize-none`} value={formData.hasarOlusSekli} onChange={e=>setFormData({...formData, hasarOlusSekli:e.target.value})} placeholder="Kepçe darbesi, araç çarpması, izinsiz kazı vb."/></div>
           <div className="grid grid-cols-2 gap-2">
              <div><label className={labelClass}>Zarar Gören Tesis / Miktar</label><input type="text" className={inputClass} value={formData.tesisCinsiMiktari} onChange={e=>setFormData({...formData, tesisCinsiMiktari:e.target.value})} placeholder="Örn: 96F Fiber, 2 adet ek muflu"/></div>
              <div><label className={labelClass}>Kesilen Abone Sayısı</label><input type="number" className={inputClass} value={formData.etkilenenAboneSayisi} onChange={e=>setFormData({...formData, etkilenenAboneSayisi:e.target.value})} placeholder="Abone"/></div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
           <div><label className={labelClass}>Düzenleyen Personel</label><input required type="text" className={inputClass} value={formData.duzenleyenPersonel} onChange={e=>setFormData({...formData, duzenleyenPersonel:e.target.value})} placeholder="Ad Soyad"/></div>
           <div><label className={labelClass}>Unvan</label><input type="text" className={inputClass} value={formData.duzenleyenUnvan} onChange={e=>setFormData({...formData, duzenleyenUnvan:e.target.value})} placeholder="Personel Unvanı"/></div>
           <div><label className={labelClass}>Tanık Bilgileri</label><input type="text" className={inputClass} value={formData.tanikBilgileri} onChange={e=>setFormData({...formData, tanikBilgileri:e.target.value})} placeholder="İsim / Tel"/></div>
           <div><label className={labelClass}>Güvenlik Birimi</label><input type="text" className={inputClass} value={formData.guvenlikGorevlisi} onChange={e=>setFormData({...formData, guvenlikGorevlisi:e.target.value})} placeholder="Varsa Güvenlik"/></div>
           <div><label className={labelClass}>İhbar Eden Mercii</label><input type="text" className={inputClass} value={formData.ihbarEden} onChange={e=>setFormData({...formData, ihbarEden:e.target.value})} placeholder="Polis/Jandarma/Şahıs"/></div>
           <div><label className={labelClass}>Kullanılan Malzemeler</label><input type="text" className={inputClass} value={formData.kullanilanMalzemeler} onChange={e=>setFormData({...formData, kullanilanMalzemeler:e.target.value})} placeholder="Onarım Malzemeleri"/></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={()=>fileInputRef.current?.click()} className={`flex items-center justify-center gap-2 border-2 border-dashed p-4 rounded-xl text-[10px] font-black transition-all ${photo?'bg-red-50 border-red-200 text-red-700':'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <Camera size={18}/> {photo?'FOTO KAYITLI':'FOTOĞRAF ÇEK'}
          </button>
          <button type="button" onClick={()=>{navigator.geolocation.getCurrentPosition(p=>setLocation({lat:p.coords.latitude,lng:p.coords.longitude}))}} className={`flex items-center justify-center gap-2 border-2 border-dashed p-4 rounded-xl text-[10px] font-black transition-all ${location?'bg-red-50 border-red-200 text-red-700':'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <MapPin size={18}/> {location?'KONUM KAYITLI':'KONUMU AL'}
          </button>
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={e=>{const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onloadend=()=>setPhoto(r.result as string); r.readAsDataURL(f);}}} />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase shadow-xl tracking-widest">
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />} TUTANAĞI KAYDET VE GÖNDER
        </button>
      </form>
    </div>
  );
};
