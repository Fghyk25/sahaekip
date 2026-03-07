
import React, { useState, useEffect } from 'react';
import { ReportForm } from './ReportForm';
import { ImprovementForm } from './ImprovementForm';
import { ModemSetupForm } from './ModemSetupForm';
import { DamageReportForm } from './DamageReportForm';
import { JobCompletionForm } from './JobCompletionForm';
import { VehicleLogForm } from './VehicleLogForm';
import { PortChangeForm } from './PortChangeForm';
import { InventoryForm } from './InventoryForm';
import { ReportList } from './ReportList';
import { ConfigTab } from './ConfigTab';
import { Report, ImprovementReport, ModemSetupReport, DamageReport, JobCompletionReport, VehicleLog, PortChangeReport, InventoryLog, Announcement } from '../types';
import { 
  LayoutGrid, 
  ClipboardList, 
  Settings, 
  Router, 
  AlertTriangle, 
  CheckCircle, 
  Car, 
  Shuffle, 
  Package,
  ChevronDown,
  X,
  Users,
  Trophy,
  Bell,
  Clock,
  RefreshCw,
  Zap
} from 'lucide-react';

interface DashboardProps {
  ekipKodu: string;
  reports: Report[];
  improvementReports: ImprovementReport[];
  modemReports: ModemSetupReport[];
  damageReports: DamageReport[];
  jobCompletions: JobCompletionReport[];
  vehicleLogs: VehicleLog[];
  portChanges: PortChangeReport[];
  inventoryLogs: InventoryLog[];
  sheetUrl?: string;
  onReportAdded: (report: Report) => void;
  onImprovementReportAdded: (report: ImprovementReport) => void;
  onModemReportAdded: (report: ModemSetupReport) => void;
  onDamageReportAdded: (report: DamageReport) => void;
  onJobCompletionAdded: (report: JobCompletionReport) => void;
  onVehicleLogAdded: (report: VehicleLog) => void;
  onPortChangeAdded: (report: PortChangeReport) => void;
  onInventoryLogAdded: (log: InventoryLog) => void;
  onUpdateSheetUrl: (url: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  ekipKodu, reports, improvementReports, modemReports, damageReports, 
  jobCompletions, vehicleLogs, portChanges, inventoryLogs, sheetUrl, 
  onReportAdded, onImprovementReportAdded, onModemReportAdded, onDamageReportAdded, 
  onJobCompletionAdded, onVehicleLogAdded, onPortChangeAdded, onInventoryLogAdded, onUpdateSheetUrl 
}) => {
  const [activeTab, setActiveTab] = useState<'problem' | 'improvement' | 'modem' | 'damage' | 'job' | 'vehicle' | 'port' | 'inventory' | 'history' | 'settings' | 'notices'>('vehicle');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);

  const fetchAnnouncements = async () => {
    if (!sheetUrl) return;
    setLoadingNotices(true);
    try {
      const response = await fetch(sheetUrl);
      const json = await response.json();
      const allNotices = json["Duyurular"] || [];
      const myNotices = allNotices
        .filter((n: any) => n["Hedef Ekip"] === ekipKodu || n["Hedef Ekip"] === 'HEPSİ')
        .map((n: any) => ({
          id: Math.random().toString(),
          timestamp: n["Zaman Damgası"],
          targetTeam: n["Hedef Ekip"],
          title: n["Başlık"],
          message: n["Mesaj"],
          sender: n["Yönetici"],
          reportType: 'announcement'
        }));
      setAnnouncements(myNotices.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [sheetUrl, ekipKodu]);

  const totalJobsDone = jobCompletions.reduce((acc, curr) => acc + curr.isAdedi, 0);

  const tabs = [
    { id: 'vehicle', label: 'İŞBAŞI', icon: <Car size={16} />, color: 'bg-cyan-700' },
    { id: 'notices', label: 'BİLDİRİMLER', icon: <Bell size={16} />, color: 'bg-indigo-600' },
    { id: 'job', label: 'İŞ BİTİR', icon: <CheckCircle size={16} />, color: 'bg-orange-600' },
    { id: 'inventory', label: 'ENVANTER', icon: <Package size={16} />, color: 'bg-emerald-600' },
    { id: 'modem', label: 'MODEM KURULUM', icon: <Router size={16} />, color: 'bg-indigo-600' },
    { id: 'problem', label: 'SORUNLU İŞ', icon: <ClipboardList size={16} />, color: 'bg-blue-600' },
    { id: 'damage', label: 'HASAR KAYDI', icon: <AlertTriangle size={16} />, color: 'bg-red-600' },
    { id: 'improvement', label: 'İYİLEŞTİRME', icon: <Zap size={16} />, color: 'bg-teal-600' },
    { id: 'port', label: 'PORT DEĞİŞİM', icon: <Shuffle size={16} />, color: 'bg-violet-600' },
    { id: 'history', label: 'GEÇMİŞ', icon: <LayoutGrid size={16} />, color: 'bg-slate-800' },
    { id: 'settings', label: 'AYARLAR', icon: <Settings size={16} />, color: 'bg-slate-600' },
  ] as const;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'notices':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Bell size={16} className="text-indigo-600"/> BİLDİRİMLER</h3>
              <button onClick={fetchAnnouncements} className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <RefreshCw size={14} className={loadingNotices ? 'animate-spin' : ''}/>
              </button>
            </div>
            {announcements.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-2xl border border-dashed border-slate-200">
                <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Henüz bildiriminiz yok</p>
              </div>
            ) : (
              announcements.map((n) => (
                <div key={n.id} className="bg-white p-5 rounded-2xl border-l-4 border-indigo-600 shadow-md border-y border-r border-slate-100 space-y-3">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{n.title}</h4>
                        <p className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 mt-1">
                          <Clock size={12}/> {n.timestamp}
                        </p>
                     </div>
                     <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${n.targetTeam === 'HEPSİ' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                        {n.targetTeam === 'HEPSİ' ? 'GENEL' : 'ÖZEL'}
                     </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 font-medium leading-relaxed border border-slate-100 whitespace-pre-wrap">
                    {n.message}
                  </div>
                  <div className="text-[9px] font-black text-slate-400 uppercase text-right italic">
                    Gönderen: {n.sender}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'problem':
        return <ReportForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} onReportAdded={onReportAdded} onComplete={() => setActiveTab('history')} />;
      case 'inventory':
        return <InventoryForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} onLogAdded={onInventoryLogAdded} onComplete={() => {}} />;
      case 'job':
        return <JobCompletionForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} jobCompletions={jobCompletions} onReportAdded={onJobCompletionAdded} onComplete={() => {}} />;
      case 'vehicle':
        return <VehicleLogForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} onReportAdded={onVehicleLogAdded} onComplete={() => setActiveTab('history')} />;
      case 'modem':
        return <ModemSetupForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} onReportAdded={onModemReportAdded} onComplete={() => setActiveTab('history')} />;
      case 'damage':
        return <DamageReportForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} onReportAdded={onDamageReportAdded} onComplete={() => setActiveTab('history')} />;
      case 'improvement':
        return <ImprovementForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} onReportAdded={onImprovementReportAdded} onComplete={() => setActiveTab('history')} />;
      case 'port':
        return <PortChangeForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} onReportAdded={onPortChangeAdded} onComplete={() => setActiveTab('history')} />;
      case 'history':
        return <div className="space-y-2"><ReportList reports={reports} /></div>;
      case 'settings':
        return <ConfigTab sheetUrl={sheetUrl || ''} onUpdate={onUpdateSheetUrl} />;
      default:
        return <VehicleLogForm ekipKodu={ekipKodu} sheetUrl={sheetUrl} onReportAdded={onVehicleLogAdded} onComplete={() => setActiveTab('history')} />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-200 flex items-center gap-3">
           <div className="bg-slate-900 text-white p-2 rounded-lg"><Users size={16} /></div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">EKİP</p>
              <h3 className="text-xs font-black text-slate-900 font-mono">{ekipKodu}</h3>
           </div>
        </div>
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-200 flex items-center gap-3">
           <div className="bg-orange-500 text-white p-2 rounded-lg"><Trophy size={16} /></div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">TOPLAM İŞ</p>
              <h3 className="text-sm font-black text-orange-600">{totalJobsDone}</h3>
           </div>
        </div>
      </div>

      {announcements.length > 0 && activeTab !== 'notices' && (
        <button 
          onClick={() => setActiveTab('notices')}
          className="w-full bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center justify-between group animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
              <Bell size={16} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-indigo-900 uppercase">YENİ DUYURU VAR</p>
              <p className="text-[10px] font-bold text-indigo-600 line-clamp-1">{announcements[0].title}</p>
            </div>
          </div>
          <ChevronDown size={16} className="text-indigo-400 -rotate-90" />
        </button>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="md:hidden w-full sticky top-[72px] z-40">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-full flex items-center justify-between p-3 rounded-xl shadow-md border-2 border-white transition-all ${currentTab.color} text-white`}
          >
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">{currentTab.icon}</div>
              <div className="text-left">
                <p className="text-[8px] font-black opacity-70 uppercase tracking-tighter">İŞLEM</p>
                <h2 className="text-xs font-black tracking-tight leading-none">{currentTab.label}</h2>
              </div>
            </div>
            {isMenuOpen ? <X size={16} /> : <ChevronDown size={16} />}
          </button>
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
              <div className="grid grid-cols-1 divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 p-3 transition-colors ${activeTab === tab.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`p-1.5 rounded-lg text-white ${tab.color}`}>{tab.icon}</div>
                    <span className={`text-[11px] font-black ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="hidden md:block w-60 flex-shrink-0 sticky top-20">
          <nav className="bg-white rounded-xl p-1 shadow-sm border border-slate-200 flex flex-col gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2 py-2.5 px-3 rounded-lg font-bold transition-all text-[10px] uppercase tracking-wider ${activeTab === tab.id ? `${tab.color} text-white shadow-md` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 w-full animate-in fade-in duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
