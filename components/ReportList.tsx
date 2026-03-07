
import React from 'react';
import { Report } from '../types';
import { Calendar, Hash, MapPin, Box, HelpCircle, CheckCircle2, AlignLeft, Eye } from 'lucide-react';

interface ReportListProps {
  reports: Report[];
}

export const ReportList: React.FC<ReportListProps> = ({ reports }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <HelpCircle className="mx-auto text-slate-300 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Henüz bir bildirim kaydı bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div 
          key={report.id} 
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-4 sm:p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  report.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {report.status === 'sent' ? 'İletildi' : 'Beklemede'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {report.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {report.location && (
                  <a 
                    href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Haritada Gör"
                  >
                    <MapPin size={18} />
                  </a>
                )}
                <CheckCircle2 size={18} className="text-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Hash size={10} /> Hizmet No
                </span>
                <p className="font-mono text-sm font-semibold text-slate-800">{report.hizmetNo}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MapPin size={10} /> SANTRAL/SAHA
                </span>
                <p className="text-sm font-semibold text-slate-800">{report.saha}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Box size={10} /> KUTU/DEVRE
                </span>
                <p className="text-sm font-semibold text-slate-800">{report.kutu}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <HelpCircle size={10} /> Sorun
                </span>
                <p className="text-sm font-semibold text-red-600">{report.sorunTipi}</p>
              </div>
            </div>

            <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <AlignLeft size={10} /> Açıklama
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{report.aciklama}</p>
            </div>

            {report.photo && (
              <div className="mb-4">
                 <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
                  <Eye size={10} /> Fotoğraf Kanıtı
                </span>
                <img 
                  src={report.photo} 
                  alt="Saha Fotoğrafı" 
                  className="w-full h-40 object-cover rounded-lg border border-slate-200 cursor-zoom-in" 
                  onClick={() => window.open(report.photo)}
                />
              </div>
            )}
          </div>
          <div className="bg-slate-50 px-5 py-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-400">Rapor ID: {report.id.substring(0, 8)}</span>
            <div className="flex gap-4">
              {report.location && (
                <span className="text-[10px] font-medium text-blue-600 flex items-center gap-1 italic">
                  GPS Aktif
                </span>
              )}
              <span className="text-[10px] font-medium text-slate-500">Ekip Kodu: <span className="font-mono">{report.ekipKodu}</span></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
