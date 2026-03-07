
import React, { useState, useEffect, useRef } from 'react';
import { InventoryLog, InventoryAction } from '../types';
import { Package, Scan, Loader2, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

// Kamera sorunlarını önlemek için izole edilmiş tarayıcı bileşeni
const BarcodeScanner: React.FC<{ onScan: (text: string) => void, onClose: () => void }> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // DOM'un hazır olduğundan emin olmak için çok kısa bir bekleme
    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 260, height: 160 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (navigator.vibrate) navigator.vibrate(80);
            onScan(decodedText);
          },
          () => {} // Sessiz hata
        );
      } catch (err) {
        console.error("Scanner Error:", err);
        onClose();
      }
    };

    const timer = setTimeout(initScanner, 100);
    
    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.error("Stop Error:", e));
      }
    };
  }, []);

  return (
    <div className="rounded-xl overflow-hidden border-2 border-slate-900 bg-black h-[280px] relative flex items-center justify-center shadow-2xl">
      <div id="qr-reader" className="absolute inset-0 z-10"></div>
      
      {/* Kırmızı Çizgi Overlay */}
      <div className="scanner-overlay z-20">
        <div className="scanner-line"></div>
      </div>
      
      {/* Alt Bilgi Kutusu */}
      <div className="absolute inset-x-0 bottom-4 text-center z-30">
        <span className="bg-slate-900/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
          Barkodu Kırmızı Çizgiye Getirin
        </span>
      </div>

      {/* Kapat Butonu (Tarayıcı Üstünde) */}
      <button 
        type="button" 
        onClick={onClose} 
        className="absolute top-3 right-3 z-40 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-sm transition-all active:scale-90"
      >
        <X size={20} />
      </button>
    </div>
  );
};

interface InventoryFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onLogAdded: (log: InventoryLog) => void;
  onComplete: () => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({ ekipKodu, sheetUrl, onLogAdded, onComplete }) => {
  const [actionType, setActionType] = useState<InventoryAction>('receive');
  const [formData, setFormData] = useState({ serialNumber: '', hizmetNo: '', deviceType: 'MODEM' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleHizmetNoChange = (val: string) => {
    const numericValue = val.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, hizmetNo: numericValue }));
  };

  const handleScanSuccess = (text: string) => {
    setFormData(prev => ({ ...prev, serialNumber: text.toUpperCase() }));
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newLog: InventoryLog = {
      id: crypto.randomUUID(), actionType, serialNumber: formData.serialNumber.toUpperCase(),
      hizmetNo: formData.hizmetNo || undefined, deviceType: formData.deviceType, ekipKodu,
      timestamp: new Date().toLocaleString('tr-TR'), status: 'sent', reportType: 'inventory'
    };
    if (sheetUrl) { try { await fetch(sheetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(newLog) }); } catch (err) {} }
    onLogAdded(newLog);
    setIsSubmitting(false);
    setFormData({ ...formData, serialNumber: '', hizmetNo: '' });
  };

  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1 block";
  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold focus:border-emerald-500 outline-none text-xs";
  const colors = { receive: 'bg-emerald-600', install: 'bg-indigo-600', return: 'bg-red-600' };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
      <div className={`${colors[actionType]} p-2.5 text-white text-center transition-colors`}>
        <h3 className="font-black text-xs uppercase tracking-widest">ENVANTER HAREKETİ</h3>
      </div>
      
      <div className="flex bg-slate-50 border-b p-1 gap-1">
        {(['receive', 'install', 'return'] as InventoryAction[]).map(type => (
          <button key={type} onClick={() => setActionType(type)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${actionType === type ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:bg-slate-100'}`}>
            {type === 'receive' ? 'AL' : type === 'install' ? 'KUR' : 'İADE'}
          </button>
        ))}
      </div>

      <div className="p-3.5 space-y-4">
        {showScanner ? (
          <BarcodeScanner onScan={handleScanSuccess} onClose={() => setShowScanner(false)} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {actionType !== 'receive' && (
              <div>
                <label className={labelClass}>Hizmet No</label>
                <input required type="text" inputMode="numeric" pattern="[0-9]*" className={inputClass} value={formData.hizmetNo} onChange={e => handleHizmetNoChange(e.target.value)} placeholder="8821..."/>
              </div>
            )}
            
            <div className="relative">
              <label className={labelClass}>Seri No / Barkod</label>
              <div className="flex gap-2">
                <input required type="text" className={`${inputClass} flex-1 uppercase`} value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} placeholder="Metin veya Barkod"/>
                <button type="button" onClick={() => setShowScanner(true)} className="p-2.5 rounded-xl bg-slate-900 text-white transition-all shadow-md active:scale-90 flex items-center justify-center">
                  <Scan size={20}/>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {['MODEM', 'HGW', 'ONT', 'MESH', 'IPTV', 'UYDU'].map(t => (
                <button key={t} type="button" onClick={() => setFormData({...formData, deviceType: t})} className={`py-2 rounded-lg text-[10px] font-black border transition-colors ${formData.deviceType === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{t}</button>
              ))}
            </div>

            <button type="submit" disabled={isSubmitting} className={`w-full ${colors[actionType]} text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase shadow-lg tracking-widest`}>
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Package size={18} />} ENVANTERE İŞLE
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
