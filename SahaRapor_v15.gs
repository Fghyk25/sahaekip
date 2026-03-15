/**
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
      case 'improvement_notification': 
        sheetName = "İyileştirme Bildirimleri"; 
        headers = ["Zaman Damgası", "Ekip", "Yer", "Tarih", "Kablo", "Menhol", "Direk", "Donanım", "Kutu", "Puan", "Konum", "Foto"]; 
        break;
      case 'improvement_production': 
        sheetName = "İyileştirme İmalatları"; 
        headers = ["Zaman Damgası", "Ekip", "Yer", "Tarih", "Kablo", "Menhol", "Direk", "Donanım", "Kutu", "Puan", "Konum", "Foto"]; 
        break;
      case 'kablo_material':
        sheetName = "KABLO MALZEME";
        headers = ["Zaman Damgası", "Ekip", "İşlem", "Malzeme", "Miktar"];
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
      } else if (reportType === 'improvement_notification' || reportType === 'improvement_production') {
        row.push(data.yerlesimAdi, data.bakimTarihi, data.kabloDurumu, data.menholDurumu, data.direkDurumu, data.direkDonanimDurumu, data.kutuKabinDurumu, data.takdirPuani, locationStr, photoData);
      } else if (reportType === 'kablo_material') {
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach(item => {
            sheet.appendRow([timestamp, data.ekipKodu, data.actionType, item.material, item.quantity]);
          });
          return ContentService.createTextOutput("Başarılı").setMimeType(ContentService.MimeType.TEXT);
        }
      }
    }

    sheet.appendRow(row);
    if (photoData.startsWith("=")) sheet.setRowHeight(sheet.getLastRow(), 100);

    return ContentService.createTextOutput("Başarılı").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Hata: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}
