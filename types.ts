
export interface Report {
  id: string;
  hizmetNo: string;
  saha: string;
  kutu: string;
  sorunTipi: string;
  aciklama: string;
  photo?: string;
  location?: {
    lat: number;
    lng: number;
  };
  ekipKodu: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'error';
  reportType: 'problem';
}

export interface Announcement {
  id: string;
  timestamp: string;
  targetTeam: string;
  title: string;
  message: string;
  sender: string;
  reportType: 'announcement';
}

export interface ImprovementReport {
  id: string;
  yerlesimAdi: string;
  bakimTarihi: string;
  kabloDurumu: string;
  menholDurumu: string;
  direkDurumu: string;
  direkDonanimDurumu: string;
  kutuKabinDurumu: string;
  takdirPuani: number;
  photo?: string;
  location?: {
    lat: number;
    lng: number;
  };
  ekipKodu: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'error';
  reportType: 'improvement';
}

export interface ModemSetupReport {
  id: string;
  hizmetNo: string;
  modemTipi: string;
  aciklama: string;
  ekipKodu: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'error';
  reportType: 'modem_setup';
}

export interface DamageReport {
  id: string;
  projeId: string;
  hasarYapanAdSoyad: string;
  tcKimlik: string;
  vergiNo: string;
  telNo: string;
  cepTel: string;
  hasarYapanAdres: string;
  hasarTarihi: string;
  hasarSaati: string;
  hasarYeri: string;
  hasarOlusSekli: string;
  tesisCinsiMiktari: string;
  etkilenenAboneSayisi: string;
  duzenleyenPersonel: string;
  duzenleyenUnvan: string;
  tanikBilgileri: string;
  guvenlikGorevlisi: string;
  ihbarEden: string;
  kullanilanMalzemeler: string;
  photo?: string;
  location?: {
    lat: number;
    lng: number;
  };
  ekipKodu: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'error';
  reportType: 'damage_report';
}

export interface JobCompletionReport {
  id: string;
  hizmetNo: string;
  isTipi: 'ARIZA' | 'TESİS';
  isAdedi: number;
  ekipKodu: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'error';
  reportType: 'job_completion';
}

export interface VehicleLog {
  id: string;
  plaka: string;
  kilometre: number;
  ekipKodu: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'error';
  reportType: 'vehicle_log';
}

export interface PortChangeReport {
  id: string;
  hizmetNo: string;
  yeniPort: string;
  yeniDevre: string;
  aciklama: string;
  ekipKodu: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'error';
  reportType: 'port_change';
}

export type InventoryAction = 'receive' | 'install' | 'return';

export interface InventoryLog {
  id: string;
  actionType: InventoryAction;
  hizmetNo?: string;
  serialNumber: string;
  deviceType?: string;
  ekipKodu: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'error';
  reportType: 'inventory';
}

export enum SorunTipi {
  GPON_SEVIYE_YOK = 'GPON SEVİYE YOK',
  DISS_MODEM_ARIZASI = 'DISS MODEM ARIZASI',
  HATALI_ADRES = 'HATALI ADRES (SAHA KUTU)',
  HAES_KART_ARIZASI = 'HAES KART ARIZASI',
  SINYAL_YOK = 'SİNYAL YOK',
  KABLO_HASARI = 'KABLO HASARI',
  KUTU_ARIZASI = 'KUTU ARIZASI',
  KAPASITE_SORUNU = 'KAPASİTE SORUNU',
  DIGER = 'DİĞER'
}

export const DurumSecenekleri = ['İYİ', 'ORTA', 'KÖTÜ', 'YOK', 'ONARILDI'];
export const ModemTipleri = ['VDSL', 'GPON'];

export interface AppState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  ekipKodu: string;
  reports: Report[];
  improvementReports: ImprovementReport[];
  modemReports: ModemSetupReport[];
  damageReports: DamageReport[];
  jobCompletions: JobCompletionReport[];
  vehicleLogs: VehicleLog[];
  portChanges: PortChangeReport[];
  inventoryLogs: InventoryLog[];
  announcements: Announcement[];
  sheetUrl?: string;
}
