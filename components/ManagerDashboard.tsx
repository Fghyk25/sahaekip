
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart3, 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Car, 
  RefreshCw,
  Search,
  ArrowRight,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  Table as TableIcon,
  Bell,
  Send,
  Loader2
} from 'lucide-react';

interface ManagerDashboardProps {
  sheetUrl?: string;
  onUpdateUrl: (url: string) => void;
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ sheetUrl, onUpdateUrl, onLogout }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Duyuru Form Durumu
  const [announcement, setAnnouncement] = useState({ target: 'HEPSİ', title: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  const fetchData = async () => {
    if (!sheetUrl) return;
    setLoading(true);
    try {
      const response = await fetch(sheetUrl);
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Veriler alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = (categoryName: string) => {
    const rows = data[categoryName] || [];
    if (rows.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, categoryName);
    XLSX.writeFile(workbook, `${categoryName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    fetchData();
  }, [sheetUrl]);

  const sendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl) return;
    setIsSending(true);
    
    const payload = {
      reportType: 'announcement',
      targetTeam: announcement.target,
      title: announcement.title,
      message: announcement.message,
      sender: 'Yönetici'
    };

    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });
      alert("Duyuru başarıyla gönderildi!");
      setAnnouncement({ target: 'HEPSİ', title: '', message: '' });
      fetchData();
    } catch (err) {
      alert("Gönderim hatası!");
    } finally {
      setIsSending(false);
    }
  };

  if (!sheetUrl) {
    return (
      <div className="mt-10 max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <h3 className="font-black text-slate-900 mb-4 uppercase tracking-tighter">BAĞLANTI GEREKLİ</h3>
        <button onClick={onLogout} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs">ÇIKIŞ YAP</button>
      </div>
    );
  }

  const categories = data ? Object.keys(data) : [];
  
  const getTeamList = () => {
    const teams = new Set<string>();
    Object.values(data || {}).forEach((sheetData: any) => {
      if (Array.isArray(sheetData)) {
        sheetData.forEach((row: any) => {
          if (row["Ekip"]) teams.add(row["Ekip"]);
        });
      }
    });
    return Array.from(teams).sort();
  };

  const getTeamStats = () => {
    const teams: Record<string, number> = {};
    Object.values(data || {}).forEach((sheetData: any) => {
      if (Array.isArray(sheetData)) {
        sheetData.forEach((row: any) => {
          const team = row["Ekip"];
          if (team) teams[team] = (teams[team] || 0) + 1;
        });
      }
    });
    return Object.entries(teams).sort((a, b) => b[1] - a[1]).slice(0, 10);
  };

  const renderCellValue = (val: any) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === 'object') return JSON.stringify(val);
    const strVal = String(val);
    if (strVal.startsWith('=IMAGE')) return <span className="text-blue-500 italic">Görsel</span>;
    if (typeof val === 'string' && val.includes(',') && !isNaN(parseFloat(val.split(',')[0]))) {
      return <a href={`https://www.google.com/maps?q=${val}`} target="_blank" className="text-indigo-600 underline font-black">KONUM</a>;
    }
    return strVal;
  };

  const renderTable = (categoryName: string) => {
    const rows = data[categoryName] || [];
    const filteredRows = rows.filter((row: any) => 
      Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (filteredRows.length === 0) return <div className="p-10 text-center text-slate-400 font-bold text-xs uppercase">Bulunamadı</div>;
    const headers = Object.keys(filteredRows[0]);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map(h => <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map((row: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {headers.map(h => <td key={h} className="px-4 py-3 text-[10px] font-bold text-slate-700 whitespace-nowrap">{renderCellValue(row[h])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm sticky top-20 z-40 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setActiveView('overview')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeView === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
              <LayoutDashboard size={14} /> ÖZET
            </button>
            <button onClick={() => setActiveView('teams')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeView === 'teams' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
              <Users size={14} /> EKİPLER
            </button>
            <button onClick={() => setActiveView('notify')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeView === 'notify' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
              <Bell size={14} /> DUYURU GÖNDER
            </button>
            <button 
              onClick={() => {
                const workbook = XLSX.utils.book_new();
                categories.forEach(cat => {
                  const rows = data[cat] || [];
                  if (rows.length > 0) {
                    const worksheet = XLSX.utils.json_to_sheet(rows);
                    XLSX.utils.book_append_sheet(workbook, worksheet, cat);
                  }
                });
                XLSX.writeFile(workbook, `ATS_SAHA_TUM_VERILER_${new Date().toISOString().split('T')[0]}.xlsx`);
              }} 
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
            >
              <Download size={14} /> TÜMÜNÜ İNDİR
            </button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button onClick={fetchData} disabled={loading} className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Ara..." className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none text-slate-900" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveView(cat)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all ${activeView === cat ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border-slate-200'}`}>
              {cat} ({data[cat]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {activeView === 'notify' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
           <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
              <Bell size={20} />
              <h3 className="font-black text-sm uppercase tracking-widest">YENİ DUYURU OLUŞTUR</h3>
           </div>
           <form onSubmit={sendAnnouncement} className="p-6 space-y-4">
              <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Hedef Ekip</label>
                 <select 
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-xs outline-none focus:border-indigo-500 text-slate-900"
                    value={announcement.target}
                    onChange={e => setAnnouncement({...announcement, target: e.target.value})}
                 >
                    <option value="HEPSİ">TÜM EKİPLER (GENEL)</option>
                    {getTeamList().map(t => <option key={t} value={t} className="text-slate-900">{t} EKİBİ</option>)}
                 </select>
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Başlık</label>
                 <input 
                    required 
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-xs outline-none focus:border-indigo-500 text-slate-900"
                    placeholder="Duyuru başlığı..."
                    value={announcement.title}
                    onChange={e => setAnnouncement({...announcement, title: e.target.value})}
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Mesaj İçeriği</label>
                 <textarea 
                    required 
                    rows={6}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-xs outline-none focus:border-indigo-500 text-slate-900"
                    placeholder="Ekiplere iletilecek detaylı mesaj..."
                    value={announcement.message}
                    onChange={e => setAnnouncement({...announcement, message: e.target.value})}
                 />
              </div>
              <button 
                type="submit" 
                disabled={isSending} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg uppercase tracking-widest"
              >
                {isSending ? <Loader2 className="animate-spin" /> : <Send size={18} />} BİLDİRİMİ GÖNDER
              </button>
           </form>
        </div>
      )}

      {activeView === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'SORUNLAR', value: data?.["Sorunlar"]?.length || 0, icon: <AlertTriangle size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'DUYURULAR', value: data?.["Duyurular"]?.length || 0, icon: <Bell size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'TAMAMLANAN', value: data?.["İş Tamamlamalar"]?.reduce((acc: any, curr: any) => acc + (Number(curr["Adet"]) || 0), 0) || 0, icon: <CheckCircle2 size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'ENVANTER', value: data?.["Envanter Kayıtları"]?.length || 0, icon: <TrendingUp size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'ARAÇ', value: data?.["Araç Kayıtları"]?.length || 0, icon: <Car size={18} />, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className={`${s.bg} ${s.color} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>{s.icon}</div>
                <div className="text-xl font-black text-slate-900 leading-none mb-1">{s.value}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'teams' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Users size={16} className="text-indigo-400" />
                <h3 className="font-black text-xs uppercase tracking-widest">EKİP LİSTESİ VE AKTİVİTE</h3>
             </div>
             <button 
                onClick={() => {
                  const stats = getTeamStats().map(([team, count]) => ({ "Ekip Kodu": team, "Toplam İşlem": count }));
                  const worksheet = XLSX.utils.json_to_sheet(stats);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, "Ekipler");
                  XLSX.writeFile(workbook, `EKIP_LISTESI_${new Date().toISOString().split('T')[0]}.xlsx`);
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-[10px] font-black transition-colors"
              >
                <Download size={12} /> EXCEL İNDİR
              </button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getTeamStats().map(([team, count]) => (
              <div key={team} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">EKİP KODU</div>
                  <div className="font-black text-slate-900">{team}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase">İŞLEM</div>
                  <div className="text-xl font-black text-indigo-600">{count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {categories.includes(activeView) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
             <div className="flex items-center gap-2">
                <TableIcon size={16} className="text-indigo-400" />
                <h3 className="font-black text-xs uppercase tracking-widest">{activeView} LİSTESİ</h3>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => downloadExcel(activeView)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-[10px] font-black transition-colors"
                >
                  <Download size={12} /> EXCEL İNDİR
                </button>
                <div className="text-[10px] font-black bg-white/10 px-2 py-1 rounded">TOPLAM: {data[activeView]?.length || 0}</div>
             </div>
          </div>
          {renderTable(activeView)}
        </div>
      )}
    </div>
  );
};
