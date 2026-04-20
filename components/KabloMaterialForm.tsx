
import React, { useState } from 'react';
import { KabloMaterialReport, KabloMaterialItem } from '../types';
import { Package, Plus, Trash2, Send, Loader2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';

interface KabloMaterialFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onReportAdded: (report: KabloMaterialReport) => void;
  onComplete: () => void;
}

const MATERIAL_OPTIONS = [
  '2x05', '4x05', '6x05', '10x05', '20x05', '30x05', '50x05', '100x05', '200x04', 
  'BEKTA', 'BEKTB', 'BEKTC', 'DİREK'
];

export const KabloMaterialForm: React.FC<KabloMaterialFormProps> = ({ ekipKodu, sheetUrl, onReportAdded, onComplete }) => {
  const [actionType, setActionType] = useState<'AL' | 'KULLAN' | 'DEMONTE'>('AL');
  const [items, setItems] = useState<KabloMaterialItem[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState(MATERIAL_OPTIONS[0]);
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    if (!currentQuantity) return;
    setItems([...items, { material: currentMaterial, quantity: currentQuantity }]);
    setCurrentQuantity('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Lütfen en az bir malzeme ekleyin.");
      return;
    }
    
    setIsSubmitting(true);
    const newReport: KabloMaterialReport = {
      id: crypto.randomUUID(),
      actionType,
      items,
      ekipKodu,
      timestamp: new Date().toLocaleString('tr-TR'),
      status: 'sent',
      reportType: 'kablo_material'
    };

    try {
      // 1. Try PocketBase
      try {
        await pb.collection('reports').create({
          type: 'Kablo Malzeme Hareketleri',
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
      setItems([]);
      onComplete();
    } catch (err) {
      console.error("Submission error:", err);
      alert("Gönderim hatası!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1 block";
  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold focus:border-emerald-500 outline-none text-xs";
  const colors = { AL: 'bg-emerald-600', KULLAN: 'bg-indigo-600', DEMONTE: 'bg-red-600' };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className={`${colors[actionType]} p-2.5 text-white text-center transition-colors`}>
        <h3 className="font-black text-xs uppercase tracking-widest">MALZEME HAREKETİ</h3>
      </div>
      
      <div className="flex bg-slate-50 border-b p-1 gap-1">
        {(['AL', 'KULLAN', 'DEMONTE'] as const).map(type => (
          <button 
            key={type} 
            onClick={() => setActionType(type)} 
            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${actionType === type ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2 items-end">
          <div>
            <label className={labelClass}>Malzeme Seçin</label>
            <select 
              className={inputClass} 
              value={currentMaterial} 
              onChange={e => setCurrentMaterial(e.target.value)}
            >
              {MATERIAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Adet/Mt</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                className={inputClass} 
                value={currentQuantity} 
                onChange={e => setCurrentQuantity(e.target.value)} 
                placeholder="Miktar"
              />
              <button 
                type="button" 
                onClick={addItem}
                className="bg-slate-900 text-white p-2.5 rounded-lg active:scale-90 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-3 py-2 font-black uppercase">Malzeme</th>
                  <th className="px-3 py-2 font-black uppercase">Miktar</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 font-bold">{item.material}</td>
                    <td className="px-3 py-2 font-bold">{item.quantity}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeItem(idx)} className="text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || items.length === 0} 
          className={`w-full ${colors[actionType]} text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase shadow-lg tracking-widest disabled:opacity-50`}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} MALZEMEYİ İŞLE
        </button>
      </div>
    </div>
  );
};
