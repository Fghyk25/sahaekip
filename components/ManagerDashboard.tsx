
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
  Loader2,
  Settings,
  Router
} from 'lucide-react';
import { ConfigTab } from './ConfigTab';

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
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  // Duyuru Form Durumu
  const [announcement, setAnnouncement] = useState({ target: 'HEPSİ', title: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [currentReplyingHizmetNo, setCurrentReplyingHizmetNo] = useState<string | null>(null);

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
    const interval = setInterval(fetchData, 120000); // 2 dakikada bir yenile
    return () => clearInterval(interval);
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

      setCurrentReplyingHizmetNo(null);
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
          if (isWithinDateRange(row)) {
            const team = row["Ekip"];
            if (team) teams[team] = (teams[team] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(teams).sort((a, b) => b[1] - a[1]).slice(0, 10);
  };

  const isWithinDateRange = (row: any) => {
    const dateVal = row["Tarih"] || row["Zaman Damgası"] || row["Tarih/Saat"] || row["Kayıt Tarihi"];
    if (!dateVal) return true;
    
    try {
      let rowDate: Date;
      const strDate = String(dateVal);
      
      if (strDate.includes('.')) {
        const parts = strDate.split(' ')[0].split('.');
        if (parts.length === 3) {
          rowDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          rowDate = new Date(strDate);
        }
      } else {
        rowDate = new Date(strDate);
      }

      if (isNaN(rowDate.getTime())) return true;

      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return rowDate >= start && rowDate <= end;
    } catch (e) {
      return true;
    }
  };


  const renderCellValue = (val: any) => {
    if (val === null || val === undefined) return "-";
    
    let processedVal = val;
    
    // Fallback: If value is a string that looks like an object, try to parse it
    if (typeof val === 'string' && val.trim().startsWith('{')) {
      try {
        processedVal = JSON.parse(val);
      } catch (e) {
        // Not a valid JSON object
      }
    }

    // Handle object values (like Google Sheets image objects)
    if (typeof processedVal === 'object') {
      const obj = processedVal;
      
      // Exhaustive search for something that looks like an image URL or base64 in the object
      let foundUrl: string | null = null;
      const keysToSearch = ['url', 'source', 'link', 'imageUrl', 'image', 'value', 'data', 'content', 'file'];
      
      // 1. First check priority keys
      for (const key of keysToSearch) {
        if (typeof obj[key] === 'string' && (obj[key].startsWith('http') || obj[key].startsWith('data:image/') || obj[key].length > 500)) {
          foundUrl = obj[key];
          break;
        }
      }
      
      // 2. If not found, search ALL keys for any long string or URL
      if (!foundUrl) {
        for (const key in obj) {
          if (typeof obj[key] === 'string' && (obj[key].startsWith('http') || obj[key].length > 100)) {
            foundUrl = obj[key];
            break;
          }
        }
      }

      if (foundUrl) {
        const finalUrl = (foundUrl.length > 500 && !foundUrl.startsWith('http') && !foundUrl.startsWith('data:')) 
          ? `data:image/jpeg;base64,${foundUrl}` 
          : foundUrl;

        return (
          <div className="group relative inline-block">
            <img 
              src={finalUrl} 
              alt="Saha Fotoğrafı" 
              className="h-10 w-10 object-cover rounded border border-slate-200 cursor-zoom-in hover:scale-150 transition-transform shadow-sm"
              referrerPolicy="no-referrer"
              onClick={() => window.open(finalUrl, '_blank')}
            />
          </div>
        );
      }
      
      // Fallback for IMAGE markers that don't have extracted data
      if (obj.valueType === 'IMAGE' || obj.type === 'IMAGE') {
         return <span className="text-[9px] text-red-500 font-black italic break-all">VERİSİZ GÖRSEL: {JSON.stringify(obj)}</span>;
      }

      return <span className="text-[9px] text-slate-500 break-all">{JSON.stringify(obj)}</span>;
    }

    const strVal = String(val).trim();

    // Handle base64 image strings
    if (strVal.startsWith('data:image/')) {
      return (
        <div className="group relative inline-block">
          <img 
            src={strVal} 
            alt="Base64 Fotoğraf" 
            className="h-10 w-10 object-cover rounded border border-slate-200 cursor-zoom-in hover:scale-150 transition-transform"
            referrerPolicy="no-referrer"
            onClick={() => {
              const win = window.open();
              win?.document.write(`<img src="${strVal}" style="max-width:100%">`);
            }}
          />
        </div>
      );
    }

    // Handle raw base64 strings
    if (strVal.length > 500 && /^[A-Za-z0-9+/=]+$/.test(strVal) && !strVal.includes(' ') && !strVal.startsWith('http')) {
      const base64Url = `data:image/jpeg;base64,${strVal}`;
      return (
        <div className="group relative inline-block">
          <img 
            src={base64Url} 
            alt="Raw Base64 Fotoğraf" 
            className="h-10 w-10 object-cover rounded border border-slate-200 cursor-zoom-in hover:scale-150 transition-transform"
            referrerPolicy="no-referrer"
            onClick={() => {
              const win = window.open();
              win?.document.write(`<img src="${base64Url}" style="max-width:100%">`);
            }}
          />
        </div>
      );
    }

    // Handle Google Sheets =IMAGE("URL") formula
    if (strVal.startsWith('=IMAGE')) {
      const match = strVal.match(/=IMAGE\("([^"]+)"/i);
      if (match && match[1]) {
        return (
          <div className="group relative inline-block">
            <img 
              src={match[1]} 
              alt="Saha Fotoğrafı" 
              className="h-10 w-10 object-cover rounded border border-slate-200 cursor-zoom-in hover:scale-150 transition-transform"
              referrerPolicy="no-referrer"
              onClick={() => window.open(match[1], '_blank')}
            />
          </div>
        );
      }
      return <span className="text-blue-500 italic text-[10px]">Görsel</span>;
    }

    // Handle direct image URLs
    if (strVal.startsWith('http') && (/\.(jpeg|jpg|gif|png|webp)$/i.test(strVal) || strVal.includes('googleusercontent') || strVal.includes('drive.google.com'))) {
      return (
        <div className="group relative inline-block">
          <img 
            src={strVal} 
            alt="Fotoğraf" 
            className="h-10 w-10 object-cover rounded border border-slate-200 cursor-zoom-in hover:scale-150 transition-transform"
            referrerPolicy="no-referrer"
            onClick={() => window.open(strVal, '_blank')}
          />
        </div>
      );
    }

    // Handle coordinates
    if (strVal.includes(',') && !isNaN(parseFloat(strVal.split(',')[0]))) {
      return <a href={`https://www.google.com/maps?q=${strVal}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-black">KONUM</a>;
    }
    
    return strVal;
  };

  const renderTable = (categoryName: string) => {
    const rows = data[categoryName] || [];
    const filteredRows = rows.filter((row: any) => {
      const matchesSearch = Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDate = isWithinDateRange(row);
      return matchesSearch && matchesDate;
    });
    if (filteredRows.length === 0) return <div className="p-10 text-center text-slate-400 font-bold text-xs uppercase">Bulunamadı veya bu tarihlerde kayıt yok</div>;
    const headers = Object.keys(filteredRows[0]);
    const isModemSetup = categoryName === 'Modem Kurulumlar';

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map(h => <th key={h} className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">{h}</th>)}
              {isModemSetup && <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">İŞLEM</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map((row: any, idx: number) => {
              const announcements = data?.['Duyurular'] || [];
              const isReplied = isModemSetup && row["Hizmet No"] && announcements.some((a: any) => 
                String(a["Başlık"]).startsWith(String(row["Hizmet No"]))
              );
              
              return (
                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isReplied ? 'bg-emerald-50/30' : ''}`}>
                  {headers.map(h => (
                    <td key={h} className="px-4 py-3 text-[10px] font-bold text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {renderCellValue(row[h])}
                        {h === "Hizmet No" && isReplied && (
                          <span className="bg-emerald-100 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ring-1 ring-emerald-200">YANITLANDI</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {isModemSetup && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button 
                        onClick={() => {
                          const hNo = row["Hizmet No"] ? String(row["Hizmet No"]) : '';
                          setAnnouncement({
                            target: row["Ekip"] || 'HEPSİ',
                            title: hNo ? `${hNo} - ${row["Notlar"] || ''}` : (row["Notlar"] || ''),
                            message: ''
                          });
                          setCurrentReplyingHizmetNo(hNo);
                          setActiveView('notify');
                        }}
                        className={`flex items-center gap-1 ${isReplied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-2 py-1 rounded text-[9px] font-black transition-all active:scale-95 shadow-sm`}
                      >
                        <Send size={10} /> {isReplied ? 'TEKRAR YANITLA' : 'YANITLA'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
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
            <button onClick={() => { setActiveView('overview'); setCurrentReplyingHizmetNo(null); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeView === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
              <LayoutDashboard size={14} /> ÖZET
            </button>
            <button onClick={() => { setActiveView('teams'); setCurrentReplyingHizmetNo(null); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeView === 'teams' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
              <Users size={14} /> EKİPLER
            </button>
            <button onClick={() => { setActiveView('notify'); setCurrentReplyingHizmetNo(null); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeView === 'notify' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
              <Bell size={14} /> DUYURU GÖNDER
            </button>
            <button onClick={() => { setActiveView('settings'); setCurrentReplyingHizmetNo(null); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeView === 'settings' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}>
              <Settings size={14} /> AYARLAR
            </button>
            <button 
              onClick={() => {
                const workbook = XLSX.utils.book_new();
                categories.forEach(cat => {
                  const rows = data[cat] || [];
                  const filtered = rows.filter(isWithinDateRange);
                  if (filtered.length > 0) {
                    const worksheet = XLSX.utils.json_to_sheet(filtered);
                    XLSX.utils.book_append_sheet(workbook, worksheet, cat);
                  }
                });
                XLSX.writeFile(workbook, `ATS_SAHA_FILTRELI_VERILER_${startDate}_${endDate}.xlsx`);
              }} 
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
            >
              <Download size={14} /> TÜMÜNÜ İNDİR
            </button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <Calendar size={12} className="text-slate-400" />
              <input 
                type="date" 
                className="bg-transparent text-[10px] font-bold outline-none text-slate-900" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
              />
              <span className="text-slate-300">-</span>
              <input 
                type="date" 
                className="bg-transparent text-[10px] font-bold outline-none text-slate-900" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
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
              {cat} ({data[cat]?.filter(isWithinDateRange).length || 0})
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

      {activeView === 'settings' && (
        <div className="max-w-xl mx-auto">
          <ConfigTab sheetUrl={sheetUrl || ''} onUpdate={onUpdateUrl} />
        </div>
      )}

      {activeView === 'overview' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'SORUNLAR', value: data?.["Sorunlar"]?.filter(isWithinDateRange).length || 0, icon: <AlertTriangle size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', view: 'Sorunlar' },
              { label: 'DUYURULAR', value: data?.["Duyurular"]?.filter(isWithinDateRange).length || 0, icon: <Bell size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50', view: 'Duyurular' },
              { label: 'TAMAMLANAN', value: data?.["İş Tamamlamalar"]?.filter(isWithinDateRange).reduce((acc: any, curr: any) => acc + (Number(curr["Adet"]) || 0), 0) || 0, icon: <CheckCircle2 size={18} />, color: 'text-orange-600', bg: 'bg-orange-50', view: 'İş Tamamlamalar' },
              { label: 'MODEM', value: data?.["Modem Kurulumlar"]?.filter(isWithinDateRange).length || 0, icon: <Router size={18} />, color: 'text-purple-600', bg: 'bg-purple-50', view: 'Modem Kurulumlar' },
              { label: 'ENVANTER', value: data?.["Envanter Kayıtları"]?.filter(isWithinDateRange).length || 0, icon: <TrendingUp size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50', view: 'Envanter Kayıtları' },
              { label: 'ARAÇ', value: data?.["Araç Kayıtları"]?.filter(isWithinDateRange).length || 0, icon: <Car size={18} />, color: 'text-cyan-600', bg: 'bg-cyan-50', view: 'Araç Kayıtları' },
            ].map((s, i) => (
              <div 
                key={i} 
                onClick={() => setActiveView(s.view)}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md active:scale-95 transition-all group"
              >
                <div className={`${s.bg} ${s.color} w-8 h-8 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>{s.icon}</div>
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
                  onClick={() => {
                    const rows = data[activeView] || [];
                    const filtered = rows.filter(isWithinDateRange);
                    if (filtered.length === 0) return;
                    const worksheet = XLSX.utils.json_to_sheet(filtered);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, activeView);
                    XLSX.writeFile(workbook, `${activeView}_FILTRELI_${startDate}_${endDate}.xlsx`);
                  }}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-[10px] font-black transition-colors"
                >
                  <Download size={12} /> EXCEL İNDİR
                </button>
                <div className="text-[10px] font-black bg-white/10 px-2 py-1 rounded">TOPLAM: {data[activeView]?.filter(isWithinDateRange).length || 0}</div>
             </div>
          </div>
          {renderTable(activeView)}
        </div>
      )}
    </div>
  );
};
