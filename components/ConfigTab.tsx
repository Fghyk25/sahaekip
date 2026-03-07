
import React, { useState } from 'react';
import { Check, Settings, AlertCircle, FileCode, Copy, RefreshCw, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface ConfigTabProps {
  sheetUrl: string;
  onUpdate: (url: string) => void;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({ sheetUrl, onUpdate }) => {
  const [url, setUrl] = useState(sheetUrl);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const scriptCode = `/**
 * SahaRapor v15 - Duyuru Sistemi Destekli
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const result = {};

  sheets.forEach(sheet => {
    const name = sheet.getName();
    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0];
      const rows = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });
      result[name] = rows;
    } else {
      result[name] = [];
    }
  });

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  if (!e || !e.postData) return ContentService.createTextOutput("Hata: Veri Yok").setMimeType(ContentService.MimeType.TEXT);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    const reportType = data.reportType || 'generic';
    
    let sheetName = "Kayıtlar";
    let headers = ["Zaman Damgası", "Ekip"];

    switch(reportType) {
      case 'problem': 
        sheetName = "Sorunlar"; 
        headers = ["Zaman Damgası", "Ekip", "Hizmet No", "Saha", "Kutu", "Sorun", "Açıklama", "Konum", "Foto"]; 
        break;
      case 'announcement':
        sheetName = "Duyurular";
        headers = ["Zaman Damgası", "Yönetici", "Hedef Ekip", "Başlık", "Mesaj"];
        break;
      case 'damage_report': 
        sheetName = "Hasar Tespitleri"; 
        headers = ["Zaman Damgası", "Ekip", "Proje ID", "Hasar Yapan", "TC/Vergi", "İletişim", "Adres", "Tarih/Saat", "Yer", "Oluş Şekli", "Miktar", "Abone", "Düzenleyen", "Ünvan", "Tanık", "Güvenlik", "İhbar", "Malzeme", "Konum", "Foto"]; 
        break;
      case 'inventory': 
        sheetName = "Envanter Kayıtları"; 
        headers = ["Zaman Damgası", "Ekip", "İşlem", "Seri No", "Hizmet No", "Tip"]; 
        break;
      case 'job_completion': 
        sheetName = "İş Tamamlamalar"; 
        headers = ["Zaman Damgası", "Ekip", "Hizmet No", "Tip", "Adet"]; 
        break;
      case 'vehicle_log': 
        sheetName = "Araç Kayıtları"; 
        headers = ["Zaman Damgası", "Ekip", "Plaka", "KM"]; 
        break;
      case 'modem_setup': 
        sheetName = "Modem Kurulumlar"; 
        headers = ["Zaman Damgası", "Ekip", "Hizmet No", "Modem", "Notlar"]; 
        break;
      case 'port_change': 
        sheetName = "Port Değişimleri"; 
        headers = ["Zaman Damgası", "Ekip", "Hizmet No", "Port", "Devre", "Notlar"]; 
        break;
      case 'improvement': 
        sheetName = "İyileştirmeler"; 
        headers = ["Zaman Damgası", "Ekip", "Yer", "Tarih", "Kablo", "Menhol", "Direk", "Donanım", "Kutu", "Puan", "Konum", "Foto"]; 
        break;
    }

    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    }

    const now = new Date();
    const timestamp = Utilities.formatDate(now, "GMT+3", "dd.MM.yyyy HH:mm:ss");
    const locationStr = data.location ? (data.location.lat + "," + data.location.lng) : "-";
    
    let photoData = "";
    if (data.photo && data.photo.includes("base64")) {
      try {
        const folderName = "SahaRapor_Fotoğraflar";
        const folders = DriveApp.getFoldersByName(folderName);
        const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
        const fileName = reportType + "_" + (data.hizmetNo || now.getTime()) + ".jpg";
        const blob = Utilities.newBlob(Utilities.base64Decode(data.photo.split(',')[1]), 'image/jpeg', fileName);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        photoData = '=IMAGE("https://drive.google.com/uc?export=view&id=' + file.getId() + '")';
      } catch (e) {
        photoData = "HATA";
      }
    }

    let row = [timestamp];
    
    if (reportType === 'announcement') {
      row.push(data.sender || "Yönetici", data.targetTeam, data.title, data.message);
    } else {
      row.push(data.ekipKodu || "-");
      if (reportType === 'problem') {
        row.push(data.hizmetNo, data.saha, data.kutu, data.sorunTipi, data.aciklama, locationStr, photoData);
      } else if (reportType === 'damage_report') {
        row.push(data.projeId, data.hasarYapanAdSoyad, data.tcKimlik + "/" + data.vergiNo, data.telNo, data.hasarYapanAdres, data.hasarTarihi + " " + data.hasarSaati, data.hasarYeri, data.hasarOlusSekli, data.tesisCinsiMiktari, data.etkilenenAboneSayisi, data.duzenleyenPersonel, data.duzenleyenUnvan, data.tanikBilgileri, data.guvenlikGorevlisi, data.ihbarEden, data.kullanilanMalzemeler, locationStr, photoData);
      } else if (reportType === 'inventory') {
        row.push(data.actionType, data.serialNumber, data.hizmetNo || "-", data.deviceType);
      } else if (reportType === 'job_completion') {
        row.push(data.hizmetNo, data.isTipi, data.isAdedi);
      } else if (reportType === 'vehicle_log') {
        row.push(data.plaka, data.kilometre);
      } else if (reportType === 'modem_setup') {
        row.push(data.hizmetNo, data.modemTipi, data.aciklama);
      } else if (reportType === 'port_change') {
        row.push(data.hizmetNo, data.yeniPort, data.yeniDevre, data.aciklama);
      } else if (reportType === 'improvement') {
        row.push(data.yerlesimAdi, data.bakimTarihi, data.kabloDurumu, data.menholDurumu, data.direkDurumu, data.direkDonanimDurumu, data.kutuKabinDurumu, data.takdirPuani, locationStr, photoData);
      }
    }

    sheet.appendRow(row);
    if (photoData.startsWith("=")) sheet.setRowHeight(sheet.getLastRow(), 100);

    return ContentService.createTextOutput("Başarılı").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Hata: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}`;

  const handleSave = () => {
    onUpdate(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings size={18} className="text-blue-400" />
          <h3 className="font-black text-sm uppercase tracking-widest">SİSTEM AYARLARI</h3>
        </div>
        <div className="flex gap-2">
          <span className="text-[9px] bg-indigo-500/20 px-2 py-1 rounded text-indigo-400 font-bold border border-indigo-500/30">NOTIFICATION SUPPORT</span>
          <span className="text-[9px] bg-blue-500/20 px-2 py-1 rounded text-blue-400 font-bold border border-blue-500/30">V15 STABLE</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Google Apps Script URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold outline-none text-xs font-mono"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
            />
            <button onClick={handleSave} className="bg-blue-600 text-white px-6 rounded-xl font-black text-xs active:scale-95 transition-all">
              {saved ? <Check size={20} /> : 'KAYDET'}
            </button>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-3">
           <div className="flex gap-3">
              <RefreshCw className="text-indigo-600 shrink-0" size={20} />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-800 uppercase">Duyuru Sistemi İçin Güncelleme Şart</p>
                <p className="text-[10px] text-indigo-700 font-bold leading-relaxed uppercase">
                  Yeni v15 kodu, yönetici duyurularını "Duyurular" sekmesine kaydetmenizi sağlar.
                </p>
              </div>
           </div>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-2">
                <FileCode size={14} /> v15 Google Apps Script Kodu
              </span>
              <button onClick={copyCode} className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-full font-black uppercase tracking-tighter flex items-center gap-1">
                {copied ? <Check size={12}/> : <Copy size={12}/>}
                {copied ? 'KOPYALANDI' : 'KODU KOPYALA'}
              </button>
           </div>
           <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-[9px] overflow-x-auto max-h-60 font-mono leading-relaxed ring-1 ring-slate-800 shadow-inner">
             {scriptCode}
           </pre>
        </div>
      </div>
    </div>
  );
};
