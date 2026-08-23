import React, { useState, useEffect, useMemo } from 'react';
import { Report } from '../types';
import { ReportForm } from './ReportForm';
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  MapPin, 
  Camera, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Building2, 
  Hash, 
  Filter, 
  PlusCircle, 
  FileSpreadsheet, 
  ExternalLink,
  Eye,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ProblemSectionProps {
  ekipKodu: string;
  sheetUrl?: string;
  reports: Report[];
  onReportAdded: (report: Report) => void;
  isKabloTeam: boolean;
}

export interface ProblemItem {
  id: string;
  timestamp: string;
  ekip: string;
  hizmetNo: string;
  saha: string;
  kutu: string;
  sorunTipi: string;
  aciklama: string;
  konum?: string;
  photo?: string;
  rawDate?: Date | null;
}

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const ProblemSection: React.FC<ProblemSectionProps> = ({
  ekipKodu,
  sheetUrl,
  reports,
  onReportAdded,
  isKabloTeam
}) => {
  // Kablo ekipleri varsayılan olarak "list" görünümünü görür, diğer ekipler de sekmeden geçebilir
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>(isKabloTeam ? 'list' : 'list');
  const [sheetProblems, setSheetProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonthMode, setSelectedMonthMode] = useState<'current' | 'prev' | 'all'>('current');
  const [selectedSorunTipi, setSelectedSorunTipi] = useState<string>('all');
  const [selectedSaha, setSelectedSaha] = useState<string>('all');
  const [copiedHizmetNo, setCopiedHizmetNo] = useState<string | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  const currentMonthName = TURKISH_MONTHS[currentMonthIdx];
  const prevMonthIdx = (currentMonthIdx + 11) % 12;
  const prevMonthYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;
  const prevMonthName = TURKISH_MONTHS[prevMonthIdx];

  // Helper to parse Turkish or standard date
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const cleanStr = String(dateStr).trim();
    
    // Pattern: dd.MM.yyyy or dd/MM/yyyy (with optional HH:mm:ss)
    const dmyMatch = cleanStr.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
      const minute = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
      const second = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
      return new Date(year, month, day, hour, minute, second);
    }

    // Pattern: yyyy-MM-dd
    const ymdMatch = cleanStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      return new Date(year, month, day);
    }

    const standardDate = new Date(cleanStr);
    return isNaN(standardDate.getTime()) ? null : standardDate;
  };

  // Helper to parse formula image
  const extractPhotoUrl = (raw: any): string | undefined => {
    if (!raw) return undefined;
    const str = String(raw).trim();
    if (str.startsWith('=IMAGE("') && str.endsWith('")')) {
      return str.substring(8, str.length - 2);
    }
    if (str.startsWith('http') || str.startsWith('data:image/')) {
      return str;
    }
    return undefined;
  };

  const fetchProblemsFromSheet = async () => {
    if (!sheetUrl) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(sheetUrl);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      const rawRows = json['Sorunlar'] || [];

      const parsedRows: ProblemItem[] = rawRows.map((r: any, idx: number) => {
        const timestamp = String(r['Zaman Damgası'] || r['Tarih'] || '');
        return {
          id: `sheet-${idx}-${r['Hizmet No'] || ''}`,
          timestamp: timestamp,
          ekip: String(r['Ekip'] || '-'),
          hizmetNo: String(r['Hizmet No'] || '-'),
          saha: String(r['Saha'] || '-'),
          kutu: String(r['Kutu'] || '-'),
          sorunTipi: String(r['Sorun'] || r['Sorun Tipi'] || 'Diğer'),
          aciklama: String(r['Açıklama'] || '-'),
          konum: r['Konum'] ? String(r['Konum']) : undefined,
          photo: extractPhotoUrl(r['Foto'] || r['Fotoğraf']),
          rawDate: parseDate(timestamp)
        };
      });

      setSheetProblems(parsedRows.reverse());
      setLastUpdated(new Date().toLocaleTimeString('tr-TR'));
    } catch (err: any) {
      console.error("Sorunlar çekilirken hata:", err);
      setFetchError("Google Sheets'ten sorun verileri alınamadı. İnternet bağlantınızı kontrol ediniz.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemsFromSheet();
    const interval = setInterval(fetchProblemsFromSheet, 45000); // 45 saniyede bir otomatik yenile
    return () => clearInterval(interval);
  }, [sheetUrl]);

  // Combine Google Sheet problems + Local reports
  const allProblems = useMemo(() => {
    const localConverted: ProblemItem[] = reports.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      ekip: r.ekipKodu,
      hizmetNo: r.hizmetNo,
      saha: r.saha,
      kutu: r.kutu,
      sorunTipi: r.sorunTipi,
      aciklama: r.aciklama,
      konum: r.location ? `${r.location.lat},${r.location.lng}` : undefined,
      photo: r.photo,
      rawDate: parseDate(r.timestamp)
    }));

    // Deduplicate between local and sheet by hizmetNo + date snippet
    const sheetHizmetMap = new Set(sheetProblems.map(p => `${p.hizmetNo}_${p.timestamp.substring(0, 10)}`));
    const uniqueLocals = localConverted.filter(l => !sheetHizmetMap.has(`${l.hizmetNo}_${l.timestamp.substring(0, 10)}`));

    return [...uniqueLocals, ...sheetProblems];
  }, [sheetProblems, reports]);

  // Unique lists for filters
  const uniqueSorunTipleri = useMemo(() => {
    const set = new Set<string>();
    allProblems.forEach(p => {
      if (p.sorunTipi && p.sorunTipi !== '-') set.add(p.sorunTipi);
    });
    return Array.from(set);
  }, [allProblems]);

  const uniqueSahalar = useMemo(() => {
    const set = new Set<string>();
    allProblems.forEach(p => {
      if (p.saha && p.saha !== '-') set.add(p.saha);
    });
    return Array.from(set).sort();
  }, [allProblems]);

  // Filtered problems according to Month & User selections
  const filteredProblems = useMemo(() => {
    return allProblems.filter(item => {
      // 1. Month Filter
      if (selectedMonthMode === 'current') {
        if (item.rawDate) {
          const itemMonth = item.rawDate.getMonth();
          const itemYear = item.rawDate.getFullYear();
          if (itemMonth !== currentMonthIdx || itemYear !== currentYear) return false;
        } else {
          // Fallback string matching
          const monthPad = String(currentMonthIdx + 1).padStart(2, '0');
          if (!item.timestamp.includes(`.${monthPad}.${currentYear}`) && !item.timestamp.includes(`/${monthPad}/${currentYear}`)) {
            return false;
          }
        }
      } else if (selectedMonthMode === 'prev') {
        if (item.rawDate) {
          const itemMonth = item.rawDate.getMonth();
          const itemYear = item.rawDate.getFullYear();
          if (itemMonth !== prevMonthIdx || itemYear !== prevMonthYear) return false;
        } else {
          const monthPad = String(prevMonthIdx + 1).padStart(2, '0');
          if (!item.timestamp.includes(`.${monthPad}.${prevMonthYear}`) && !item.timestamp.includes(`/${monthPad}/${prevMonthYear}`)) {
            return false;
          }
        }
      }

      // 2. Sorun Tipi Filter
      if (selectedSorunTipi !== 'all' && item.sorunTipi !== selectedSorunTipi) {
        return false;
      }

      // 3. Saha Filter
      if (selectedSaha !== 'all' && item.saha !== selectedSaha) {
        return false;
      }

      // 4. Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches = (
          item.hizmetNo.toLowerCase().includes(query) ||
          item.saha.toLowerCase().includes(query) ||
          item.kutu.toLowerCase().includes(query) ||
          item.aciklama.toLowerCase().includes(query) ||
          item.ekip.toLowerCase().includes(query) ||
          item.sorunTipi.toLowerCase().includes(query)
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [allProblems, selectedMonthMode, selectedSorunTipi, selectedSaha, searchTerm, currentMonthIdx, currentYear, prevMonthIdx, prevMonthYear]);

  // Copy Hizmet No handler
  const handleCopyHizmetNo = (hNo: string) => {
    if (!hNo || hNo === '-') return;
    navigator.clipboard.writeText(hNo);
    setCopiedHizmetNo(hNo);
    setTimeout(() => setCopiedHizmetNo(null), 2000);
  };

  // Excel Export
  const exportToExcel = () => {
    if (filteredProblems.length === 0) {
      alert("İndirilecek sorunlu iş kaydı bulunamadı!");
      return;
    }

    const exportData = filteredProblems.map((p, index) => ({
      "Sıra": index + 1,
      "Tarih / Saat": p.timestamp,
      "Ekip": p.ekip,
      "Hizmet No": p.hizmetNo,
      "Santral / Saha": p.saha,
      "Kutu / Devre": p.kutu,
      "Sorun Tipi": p.sorunTipi,
      "Açıklama": p.aciklama,
      "Konum": p.konum || "-",
      "Fotoğraf": p.photo || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sorunlu_Isler");

    const monthLabel = selectedMonthMode === 'current' 
      ? `${currentMonthName}_${currentYear}` 
      : selectedMonthMode === 'prev' 
        ? `${prevMonthName}_${prevMonthYear}` 
        : 'Tumu';

    XLSX.writeFile(wb, `Sorunlu_Isler_${monthLabel}_${ekipKodu}.xlsx`);
  };

  return (
    <div className="space-y-3" id="problem-section-root">
      {/* Üst Sekme Başlığı & Gezinme Düğmeleri */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            id="tab-btn-problem-list"
            onClick={() => setActiveSubTab('list')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
              activeSubTab === 'list'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardList size={15} />
            <span>BU AYIN SORUNLU İŞLERİ</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeSubTab === 'list' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {filteredProblems.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-btn-problem-create"
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
              activeSubTab === 'create'
                ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-400/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PlusCircle size={15} />
            <span>YENİ SORUN BİLDİR</span>
          </button>
        </div>

        {activeSubTab === 'list' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={exportToExcel}
              title="Excel Olarak İndir"
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-2 rounded-lg text-[11px] font-black transition-all active:scale-95 shadow-sm"
            >
              <Download size={14} />
              <span className="hidden sm:inline">EXCEL</span>
            </button>
            <button
              type="button"
              onClick={fetchProblemsFromSheet}
              disabled={loading}
              title="Yenile"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 border border-slate-200"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        )}
      </div>

      {/* SUB TAB: YENİ SORUN BİLDİRİM FORMU */}
      {activeSubTab === 'create' && (
        <div>
          <ReportForm
            ekipKodu={ekipKodu}
            sheetUrl={sheetUrl}
            onReportAdded={(rep) => {
              onReportAdded(rep);
              setActiveSubTab('list');
              fetchProblemsFromSheet();
            }}
            onComplete={() => {
              setActiveSubTab('list');
              fetchProblemsFromSheet();
            }}
          />
        </div>
      )}

      {/* SUB TAB: BU AYIN SORUNLU İŞLERİ LİSTESİ */}
      {activeSubTab === 'list' && (
        <div className="space-y-3">
          {/* Özet Bilgi Kartı */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-xl p-3.5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-500/30 text-blue-200 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-blue-400/20">
                    KABLO & ARIZA BİRİMİ
                  </span>
                  {lastUpdated && (
                    <span className="text-[10px] text-blue-200/70 font-mono">
                      Güncellendi: {lastUpdated}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-300" />
                  {selectedMonthMode === 'current' && `${currentMonthName.toUpperCase()} ${currentYear} SORUNLU İŞ LİSTESİ`}
                  {selectedMonthMode === 'prev' && `${prevMonthName.toUpperCase()} ${prevMonthYear} SORUNLU İŞ LİSTESİ`}
                  {selectedMonthMode === 'all' && `TÜM ZAMANLAR SORUNLU İŞ LİSTESİ`}
                </h2>
                <p className="text-xs text-blue-100 font-medium">
                  Saha ve arıza ekiplerinin bildirdiği sorunlu işleri anlık takip edin ve müdahale planı yapın.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                <div className="text-right">
                  <div className="text-[9px] font-black text-blue-200 uppercase">KAYIT SAYISI</div>
                  <div className="text-xl font-black font-mono text-amber-300">{filteredProblems.length}</div>
                </div>
                <div className="h-8 w-[1px] bg-white/20"></div>
                <div className="text-right">
                  <div className="text-[9px] font-black text-blue-200 uppercase">FARKLI SAHA</div>
                  <div className="text-xl font-black font-mono text-white">
                    {new Set(filteredProblems.map(p => p.saha).filter(s => s && s !== '-')).size}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtre ve Arama Çubuğu */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-2.5">
            {/* Ay Seçici Düğmeleri */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">DÖNEM:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="month-btn-current"
                  onClick={() => setSelectedMonthMode('current')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedMonthMode === 'current'
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  📅 Bu Ay ({currentMonthName})
                </button>
                <button
                  type="button"
                  id="month-btn-prev"
                  onClick={() => setSelectedMonthMode('prev')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedMonthMode === 'prev'
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Geçen Ay ({prevMonthName})
                </button>
                <button
                  type="button"
                  id="month-btn-all"
                  onClick={() => setSelectedMonthMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedMonthMode === 'all'
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tümü
                </button>
              </div>
            </div>

            {/* Arama & Dropdown Filtreler */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Arama */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="problem-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Hizmet no, saha, kutu veya açıklama ara..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:border-blue-500 outline-none text-xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sorun Tipi */}
              <div className="relative">
                <select
                  id="problem-type-filter"
                  value={selectedSorunTipi}
                  onChange={(e) => setSelectedSorunTipi(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Tüm Sorun Tipleri ({uniqueSorunTipleri.length})</option>
                  {uniqueSorunTipleri.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Saha / Santral */}
              <div className="relative">
                <select
                  id="problem-saha-filter"
                  value={selectedSaha}
                  onChange={(e) => setSelectedSaha(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Tüm Sahalar ({uniqueSahalar.length})</option>
                  {uniqueSahalar.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hata Bildirimi */}
          {fetchError && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-amber-800 text-xs font-bold">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                <span>{fetchError}</span>
              </div>
              <button
                type="button"
                onClick={fetchProblemsFromSheet}
                className="underline text-amber-900 ml-2 whitespace-nowrap"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {/* Liste Görünümü */}
          {loading && filteredProblems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
              <RefreshCw size={32} className="mx-auto text-blue-600 animate-spin" />
              <p className="text-xs font-bold text-slate-600 uppercase">
                Google Sheets'ten sorunlu iş kayıtları yükleniyor...
              </p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm space-y-3 p-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles size={28} />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                Kayıt Bulunamadı
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                {searchTerm || selectedSorunTipi !== 'all' || selectedSaha !== 'all'
                  ? 'Uygulanan filtrelere uygun sorunlu iş kaydı bulunamadı.'
                  : `${selectedMonthMode === 'current' ? currentMonthName : prevMonthName} ayı için henüz sorunlu iş kaydı girilmemiş.`}
              </p>
              {(searchTerm || selectedSorunTipi !== 'all' || selectedSaha !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSorunTipi('all');
                    setSelectedSaha('all');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-black transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProblems.map((problem) => {
                const isCopied = copiedHizmetNo === problem.hizmetNo;
                return (
                  <div
                    key={problem.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Kart Üst Barı */}
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Calendar size={12} className="text-slate-400" />
                          {problem.timestamp}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                            Ekip: {problem.ekip}
                          </span>
                        </div>
                      </div>

                      {/* Hizmet No & Sorun Rozeti */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">
                            HİZMET NO
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-base text-slate-900 tracking-tight">
                              {problem.hizmetNo}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyHizmetNo(problem.hizmetNo)}
                              title="Hizmet Numarasını Kopyala"
                              className={`p-1 rounded transition-colors ${
                                isCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isCopied ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                            {problem.sorunTipi}
                          </span>
                        </div>
                      </div>

                      {/* Saha & Kutu Bilgisi */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">SANTRAL / SAHA</span>
                          <span className="font-bold text-slate-800">{problem.saha}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block">KUTU / DEVRE</span>
                          <span className="font-bold text-slate-800">{problem.kutu}</span>
                        </div>
                      </div>

                      {/* Hata Açıklaması */}
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                          HATA DETAYI / NOT
                        </span>
                        <p className="text-xs text-slate-700 font-medium bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/60 leading-relaxed whitespace-pre-wrap">
                          {problem.aciklama}
                        </p>
                      </div>

                      {/* Fotoğraf Önizleme (Varsa) */}
                      {problem.photo && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoUrl(problem.photo || null)}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
                          >
                            <span className="flex items-center gap-1.5">
                              <Camera size={15} />
                              <span>Saha Fotoğrafını Görüntüle</span>
                            </span>
                            <Eye size={15} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Kart Alt Butonları */}
                    <div className="bg-slate-50 px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-400 font-mono">
                        {problem.id.startsWith('sheet') ? 'Google Sheets' : 'Yerel Kayıt'}
                      </div>

                      <div className="flex items-center gap-2">
                        {problem.konum && (
                          <a
                            href={`https://www.google.com/maps?q=${problem.konum}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-white hover:bg-slate-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-black border border-slate-200 shadow-sm transition-all"
                          >
                            <MapPin size={12} className="text-red-500" />
                            <span>HARİTADA GÖR</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyHizmetNo(problem.hizmetNo)}
                          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-md text-[10px] font-black shadow-sm transition-all"
                        >
                          {isCopied ? 'KOPYALANDI' : 'HİZMET NO AL'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Fotoğraf Modal Popup */}
      {previewPhotoUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} /> Saha Fotoğrafı Önizleme
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center min-h-[250px] max-h-[70vh] overflow-auto">
              <img
                src={previewPhotoUrl}
                alt="Saha Sorun Fotoğrafı"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <a
                href={previewPhotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink size={14} /> Yeni Sekmede Aç
              </a>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
