import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Download, 
  CloudUpload, 
  Search, 
  Check, 
  Copy, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Layers,
  Wrench,
  Package,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface FastBookRow {
  Tarih: string;
  ProjeID: string;
  Santral: string;
  Saha: string;
  Kutu: string;
  IscilikPoz: string;
  IscilikAciklama: string;
  IscilikMiktar: string;
  IscilikBirim: string;
  MalzemePoz: string;
  MalzemeAdi: string;
  MalzemeMiktar: string;
  MalzemeBirim: string;
}

interface FastBookFormProps {
  ekipKodu: string;
  sheetUrl?: string;
  onComplete?: () => void;
}

const jobDataRaw = `POZ;ESAS;Miktar
1.1;Direk Dikimi;Ad.
1.1d;Direk Demontajı;Ad.
1.2;Lente Yapımı;Ad.
1.2d;Lente Demontajı;Ad.
1.3;Direğe veya Duvara Fider Çıkılması;Ad.
1.3d;Fider Demontajı;Ad.
1.4;Abone Tesis Fider Montajı;Ad.
1.4d;Abone Tesis Fider Demontajı;Ad.
1.5;Ağaç Budama;Ad.
2.1;Havai Güzargahta (Direkte/Blokta) Her Kapasitede ve Tipte Kablo Çekimi;Mt.
2.1d;Havai Güzargahta (Direkte/Blokta) Her Kapasitede ve Tipte Kablonun Demontajı;Mt.
2.1h;Havai Güzargahta (Direkte/Blokta) Her Kapasitede ve Tipte Kablonun Hurda Demontajı;Mt.
2.2;Bina Dış Yüzeyinden Çatıya Blokta (Duvarda) Her Kapasitede ve Tipte Kablo Çekimi;Mt.
2.2d;Bina Dış Yüzeyinden Çatıya Blokta (Duvarda) Her Kapasitede ve Tipte Kablonun Demontajı;Mt.
2.2h;Bina Dış Yüzeyinden Çatıya Blokta (Duvarda) Her Kapasitede ve Tipte Kablonun Hurda Demontajı;Mt.
2.3;Yeraltında Her Kapasitede ve Tipte Kablo Çekimi;Mt.
2.3d;Yeraltında Her Kapasitede ve Tipte Kablonun Demontajı;Mt.
2.3h;Yeraltında Her Kapasitede ve Tipte Kablonun Hurda Demontajı;Mt.
2.4;Yeraltına Döşenmiş Mevcut HDPE Boru ve ÇTB içerisinden Kablo Tesis Makinası (Cable Jet) ile F/O Kablo Çekilmesi;Mt.
2.5;Kanalı Açılmış Güzergahta Kablo Döşenmesi;Mt.
2.5d;Kanalı Açılmış Güzergahta Kablo Demontajı;Mt.
2.6;Gözlerin Tespiti ( Yapım );Km.
2.6;Güzergah Tespiti ( Bakım );Km.
2.7;Kablo Kanalından veya Kablo Tavasından Her Türlü Kablo Çekimi;Mt.
2.7d;Kablo Kanalından veya Kablo Tavasından Her Türlü Kablo Demontajı;Mt.
2.7m;Manlift Vb. Sepetli Araç Kullanılarak Kablo Kanalından veya Kablo Tavasından Her Türlü Kablo Çekimi;Mt.
2.7md;Manlift Vb. Sepetli Araç Kullanılarak Kablo Kanalından veya Kablo Tavasından Her Türlü Kablo Demontajı;Mt.
2.8;ÇTB veya Spiral Boru Çekimi;Mt.
2.8d;ÇTB veya Spiral Boru Demontajı;Mt.
2.9;Kablo Kanalı Çekimi;Mt.
2.9d;Kablo Kanalı Demontajı;Mt.
2.10;Kablo Tavası veya Merdiveni Montajı;Mt.
2.10d;Kablo Tavası veya Merdiveni Demontajı;Mt.
2.11;Sepetli Araç, Vinç vb. Araçlar Kullanılarak Bina Dış Yüzeyinden Çatıya Spiral Boru veya Kablo Kanalı Montajı;Mt.
2.11d;Sepetli Araç, Vinç vb. Araçlar Kullanılarak Bina Dış Yüzeyinden Çatıya Spiral Boru veya Kablo Kanalı Demontajı;Mt.
3.1;İletkenlerin Eklenmesi;Çift
3.2;Dış Kılıf Ek Kapama;Ad.
3.2d;Dış Kılıf Eki Demontajı;Ad.
3.3;10 Luk Terminasyon Yapılması;Ad.
3.3d;10 Luk Terminasyon Demontajı;Ad.
3.4;1800 Lük Repartitör Dizisinin Demontajı;Ad.
3.5;1800 Lük Repartitör Dizisindeki Tüm Camper Tellerinin Toplanması;Ad.
3.6;Ag Reçineli Ve Isı Buzüşmeli Ek Mufu İle Ek Kapama;Ad.
3.6d;Ag Reçineli Ve Isı Buzüşmeli Ek Mufu Demontajı;Ad.
3.7;Enerji Kablosu Terminasyonu;Ad.
3.7d;Enerji Kablosu Terminasyon Demontajı;Ad.
4.1;Fiber Ek Yapımı veya Terminasyonu;Ad.
5.1;Harici Tip Kabin Montajı;Ad.
5.1d;Harici Tip Kabin Demontajı;Ad.
5.2;Kutu veya Dahili Tip Kabin Montajı;Ad.
5.2d;Kutu veya Dahili Tip Kabin Demontajı;Ad.
5.3;Kabin / Pano İçerisine Ekipman Montajı;Ad.
5.3d;Kabin / Pano İçerisinden Ekipman Demontajı;Ad.
5.4;Kabin Enerji Proje Çizimi, Bağlantı İşleri Ve Abonelik İşlemleri Takibi;Ad.
5.5;Kurulu Güç Üzerinden Kabin Enerji Bağlantı İşleri Ve Abonelik İşlemleri Takibi;Ad.
5.6;Ankesör / Turna Kabin Montajı;Ad.
5.6d;Ankesör / Turna Kabin Demontajı;Ad.
5.7;Ankesör / Turna Makinesi Montajı;Ad.
5.7d;Ankesör / Turna Makinesi Demontajı;Ad.
6.1;Bina İçi Mevcut Hat İçerisinden Obk Çekimi;Ad.
6.2;Bina İçi Koruyucu Hat Yapılarak Obk Çekilmesi;Ad.
6.3;Obk nın Daire İçine Alınması;Ad.
6.4;Obk nın İçeri Alınarak Yeni Koruyucu Hat Yapılması ile Odalara Çekilmesi;Ad.
7.1;Camper Teli Montajı;Ad.
7.1d;Camper Teli Demontajı;Ad.
7.2;Aktarma Sonrası Yeni Dolap / Kutu Numarasının Şablonla Yazılması;Ad.
7.3;Fwa Kurulumu;Ad.
8.1;Topraklama Yapımı;Ad.
8.2;Topraklama Direncini Sağlamak İçin Aynı Yerde İlave Topraklama Yapılması;Ad.
8.3;Gözün Kapatılması;Ad.
8.3d;Göz Tıkama Demontajı;Ad.
8.4;Ruhsat İşlemleri Takibi;Ad.
8.5;Tesis Paylaşımı Talepleri Kapsamında Diğer Operatör Çalışmalarına Refakat (İlk Bir Saate Kadar);saat
8.6;Tesis Paylaşımı Talepleri Kapsamında Diğer Operatör Çalışmalarına Refakat (ilk bir saatten sonrası için);saat
8.7;İmalatların ve Malzeme Verilerinin Sisteme Girilmesii;saat
8.8y;Göçük Tespiti ( Yapım );Mt.
8.8b;Göçük Tespiti ( Bakım );Ad.
8.9y;Göçük Aktivasyon Bedeli ( Yapım );Ad.
8.9b;Göçük Aktivasyon Bedeli ( Bakım );Ad.
8.10y;Hp Aktivasyon Bedeli ( Yapım );Ad.
8.10b;Bakım Aktivasyon Bedeli ( Bakım );Ad.
8.11;Diğer Proje Aktivasyon Bedeli;Ad.
8.11k;Kazısı Diğer Kurumlarca Yapılan İşler İçin Diğer Proje Aktivasyon Bedeli;Ad.
8.12;Ekipman Aktivasyon Bedeli;Ad.
8.13;Yeni Fider Aktivasyon Bedeli;Ad.
9.1;Beton veya Plastik Menhol /Ek Odası / Kaidenin Yerine Montajı;Ad.
9.1d;Beton veya Plastik Menhol /Ek Odası / Kaidenin Demontajı;Ad.
9.2;Briketle Menhol Yapımı;Ad.
9.3;Briketle Ek Odası Yapımı;Ad.
9.4;Menhol veya Ek Odasının Yükseltilmesi / Alçaltılması;Ad.
9.5;Mevcut Menhol / Ek Odası Kapağı Yerine Menteşeli Tip/Kompozit Menhol Kapağı Montajı;Ad.
9.6;Menhol Kubbe Yıkımı;Ad.
9.7;Briket Örülmesi;Ad.
9.8;Menhol Kubbe Yapımı;Ad.
9.9;Kayıp Menhol Tespiti;Ad.
9.10;Koordinat Tespiti;Ad.
9.11;Güzergah Koordinat Tespiti;Ad.
10.1;HDPE Düz veya Kıvrımlı Boru, PE Göz Çoklayıcıların Döşenmesi  ;Mt.
10.1g;Göz Tamiri Kapsamında Hdpe Düz veya Kıvrımlı Boru, Pe Göz Çoklayıcıların Döşenmesi;Mt.
10.2;Dikişli Galvanizli Boru Montajı;Mt.
10.3;Her Türlü Zeminde Makine veya El ile 40x80 cm, Trencher ile 11x50 cm Ölçülerinde Tranşe Kazısı Yapılması;Mt.
10.4;Her Türlü Zeminde Makine veya El ile 40x40 cm, Trencher ile 11x40 cm Ölçülerinde Fider Kazısı Yapılması;Mt.
10.5;HDPE Boruların Tabanı, Çevresi ve 10 cm Üzerine Sargı Yapılması;M3
10.6;Özel Dolgu Yapılması;M3
10.7;Beton Bordür Döşenmesi;M2
10.7d;Beton Bordürün Sökülmesi;M2
10.8;Döşeme Kaplaması Yapılması;M2
10.8d;Döşeme Kaplama Sökülmesi;M2
10.9;Beton Atılması;M3
10.9d;Beton Demontajı;M3
10.10;Kazı Sonrası Kanal Kapaması Yapılmış Tranşe Üzerinde Asfalt Kazınması;Mt.
10.11;Pmt İle Dolgu Yapılması;Mt.
11.1;Direkli Güzergahta Her Cins Kablo İyileştirilmesi;Mt.
11.2;Blok İşlemeli Güzergahta Her Cins Kablo İyileştirilmesi;Mt.
11.3;Her Cins Ve Kapasitede (Tampon Kutu Dahil) Kutu İyileştirilmesi;Ad.
11.4;Her Cins Ve Kapasitede Saha Dolabı veya Fttx Kabin İyileştirilmesi;Ad.
11.5;10 Luk Terminal İyileştirilmesi;Ad.
11.6;20'Lik ( Kutudaki Toplam Terminal Sayısı ) Ankastre Kutusu İyileştirilmesi;Ad.
11.7;20'Den Büyük Kapasitedeki Ankastre Kutusu İçin İlave 10'Luk Terminal İyileştirilmesi ;Ad.
11.8;Direk İyileştirilmesi;Ad.
11.9;Direk Çevresinin Temizlenmesi;Ad.
11.10;Takviye Emprenye Uygulaması;Ad.
11.11;Menhol/Ek Odası Temizlenmesi;Ad.
11.12;Kablo / Pasif Arıza veya Hasar Tespiti;Ad.
11.13;Müşteri Modeminin Değiştirilmesi;Ad.`;

const malzemeDataRaw = `POZ NO;POZ ADI
1;Çift cidarlı HDPE boru (110)
10;2x1 HDPE boru
100;Çelik spiral boru 42 mm
101;Çelik spiral boru 50 mm
102;Çelik spiral boru 63 mm
103;Plastik spiral boru 14 mm
104;Plastik spiral boru 16 mm
105;Plastik spiral boru 18 mm
106;Plastik spiral boru 20 mm
107;Plastik spiral boru 26 mm
108;Plastik spiral boru 32 mm
109;Plastik spiral boru 40 mm
11;3x1 HDPE boru
110;Plastik spiral boru 50 mm
111;Halojen free alev yaymaz Plastik spiral boru 16 mm
112;Halojen free alev yaymaz Plastik spiral boru 20 mm
113;Halojen free alev yaymaz Plastik spiral boru 25 mm
114;Halojen free alev yaymaz Plastik spiral boru 32 mm
115;Halojen free alev yaymaz Plastik spiral boru 40 mm
116;Halojen free alev yaymaz Plastik spiral boru 50 mm
117;5cmlik Kablo tavası (Montaj için gerekli malzemeler dahil)
118;10cmlik Kablo tavası (Montaj için gerekli malzemeler dahil)
119;20cmlik Kablo tavası (Montaj için gerekli malzemeler dahil)
12;HDPE ikili göz çoklayıcı boru (Tıkama parçası dahil)
120;30cmlik Kablo tavası (Montaj için gerekli malzemeler dahil)
121;40cmlik Kablo tavası (Montaj için gerekli malzemeler dahil)
122;50cmlik Kablo tavası (Montaj için gerekli malzemeler dahil)
123;60cmlik Kablo tavası (Montaj için gerekli malzemeler dahil)
124;10cmlik Kablo merdiveni (Montaj için gerekli malzemeler dahil)
125;20cmlik Kablo merdiveni (Montaj için gerekli malzemeler dahil)
126;30cmlik Kablo merdiveni (Montaj için gerekli malzemeler dahil)
127;40cmlik Kablo merdiveni (Montaj için gerekli malzemeler dahil)
128;50cmlik Kablo merdiveni (Montaj için gerekli malzemeler dahil)
129;60cmlik Kablo merdiveni (Montaj için gerekli malzemeler dahil)
13;HDPE üçlü göz çokl. boru (Tıkama parç. ve kanal ağzı tut. dahil)
130;Topraklama levhası (0,7x0,7/0,5x1 3mm)
131;Topraklama çubuğu (150cm)
132;3 mm lik Bakır Tel
133;6 mm2 topraklama iletkeni (NYY)
134;10 mm2 topraklama iletkeni (NYY)
135;16 mm2 topraklama iletkeni (NYY)
136;25 mm2 topraklama iletkeni (NYY)
137;50 mm2 topraklama iletkeni (NYY)
138;6 mm2 topraklama iletkeni (Çıplak bakır)
139;10 mm2 topraklama iletkeni (Çıplak bakır)
14;Çift cidarlı HDPE boru için HDPE tamir manşonu
140;16 mm2 topraklama iletkeni (Çıplak bakır)
141;25 mm2 topraklama iletkeni (Çıplak bakır)
142;50 mm2 topraklama iletkeni (Çıplak bakır)
143;12x12 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
144;16x16 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
145;25x16 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
146;25x25 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
147;40x25 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
148;40x40 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
149;60x40 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
150;60x60 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
151;80x40 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
152;80x60 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
153;100x40 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
154;100x60 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
155;120x60 Kablo kanalı (Montaj için gerekli iç köşe, dirsek vb. malzemeler dahil)
156;22,5x45 telefon prizi
157;22,5x45 data prizi
158;45x45 UPS topraklı priz
159;45x45 Topraklı priz
160;UTP CAT6 Sıva Üstü Tekli Priz
161;UTP CAT6 Sıva Üstü İkili Priz
162;UTP CAT6 Sıva Altı Tekli Priz
163;UTP CAT6 Sıva Altı İkili Priz
164;3lü Topraklı klemensli grup priz
165;RJ45 konnektör
166;RJ11 konnektör
167;Sac pano (0,1 m2'ye kadar, 0,1 dahil)
168;Sac pano (0,1-0,2 m2, 0,2 dahil)
169;Sac pano (0,2-0,3 m2, 0,3 dahil)
170;1 Fazlı Nötr Kesmeli Anahtarlı Otomatik Sigorta (40 A.e kadar)
171;Yangın koruma rölesi 2x40A 300mA
172;Yangın koruma rölesi 2x25A 300mA
173;Kaçak akım koruma rölesi 30mA (40 A.e kadar)
174;6U dikey kablo düzenleyici (tek taraf)
175;9U dikey kablo düzenleyici (tek taraf)
176;12U dikey kablo düzenleyici (tek taraf)
177;6U 19" kabinet
178;9U 19" kabinet
179;12U 19" kabinet
180;Sabit raf
181;Hareketli raf
182;Termostatlı fan modülü 2 fanlı
183;Termostatlı fan modülü 4 fanlı
184;19" rack tipi 4lü grup priz sigortalı
185;19" rack tipi 6lı grup priz sigortalı
186;19" rack tipi 8li grup priz sigortalı
187;Saha dolabı 2400 lük (8 adet modül bağlantı sacı dahil)
188;Direk tipi saha dolabı 600 lük ( 2 adet modül bağlantı sacı dahil)
189;BDDK-1 (AKEK) Abone Kablo Ek Kutusu
190;BDDK-3 Bina Dışı Dağıtım kutusu (modülsüz)
191;BİDK-2 Bina İçi Dağıtım kutusu 30-50 lik (modülsüz)
192;BİDK-2 Bina İçi Dağıtım kutusu 100 lük (modülsüz)
193;300 çiftlik modül bağlantı çatısı
2;Çift cidarlı HDPE boru için birleştirme manşonu (110)
20;Mikroboru 2 Gözlü
203;3x120+70 AG ısı büzüşmeli ek mufu paket (Montaj için gerekli malzemeler dahil) 
204;3x70+35 AG ısı büzüşmeli ek mufu paket (Montaj için gerekli malzemeler dahil)
205;4x16 AG ısı büzüşmeli ek mufu paket (Montaj için gerekli malzemeler dahil)
206;4x16 AG reçineli ek mufu (Montaj için gerekli malzemeler dahil) 
207;İstavroz demiri
209;2400'lük Saha dolabı çatısı
21;Mikroboru 4 Gözlü
212;4x6 NYY 1KV
213;4x10 NYY 1KV
214;2x6 NYY 1KV
215;2x10 NYY 1KV
216;3x2,5 NVV
217;3x4 NVV 
218;2x6 NVV 
219;4x6 NVV 
220;4x10 YVOV (NYRY): NYF GBY 1KV
221;4x16 YVOV (NYRY): NYF GBY 1KV
222;UTP CAT6 LS0H Patch Cord 0,5m
223;UTP CAT6 LS0H Patch Cord 1m
224;UTP CAT6 LS0H Patch Cord 2m
225;UTP CAT6 LS0H Patch Cord 3m
226;UTP CAT6 LS0H Patch Cord 5m
227;CAT6 20 cm F/UTP
228;CAT6 100 cm F/UTP
229;F/O Ek Kutusu (3 Kasetli)
23;Tip-1 Prefabrik beton menhol
230;F/O Ek Kutusu (6 Kasetli)
231;F/O Ek Kutusu (12 Kasetli)
232;F/O Ek Kutusu (16 Kasetli)
233;F/O Ek Kutusu (3 Kasetli) Tip 2
234;OB 1x2
235;OB 1X4
236;OB 1X8
237;OB 1X2 SC
238;OB 1X4 SC
239;OB 1X8 SC
24;Tip-2 Prefabrik beton ek odası
240;OB 1X16 SC
241;OB 1X32 SC
242;OFDK-M 1X8
243;OFDK-M 1X16
244;OFDK-M 1X32
245;OFDP 1X2
246;OFDP 1X4
247;OFDP 1X8
248;OFDP 1X16
249;OFDP 1X32
25;Kompozit Ek Odası Kapağı
250;OFDÇ 12U 
251;OFDÇ 24U 
252;OFDÇ 42U 
253;OFSB-12
254;OFSB-24
255;OFSB-72
256;OFSD 24U
257;OFSD 24U Çelik
258;OFSD 12U
259;OFSK-P 1x1
26;Kompozit Ek Odası Çerçevesi
260;1x2 OBK (Outdoor + Zırhlı)
261;1x2 OBK (Çelik + askı tel)
262;1x2 OBK (FRP + askı tel)
263;1x1 OBK (400N)
264;1x1 OBK (outdoor)
265;Riser Kablo (2*6)
266;Riser Kablo (2*12)
267;Riser Kablo (2*24)
268;Riser Kablo (2*48)
269;Riser Kablo Yönlendirme kutusu
27;Kompozit Menhol Kapağı
270;OFSK-P 1x2
271;OFSK-P 1x4
272;OFDK-P 1X4
273;OFDK-P 1X8
274;OFDK-P 1X16
275;OFDK-P 1X32
276;OFDK-P 1X8 K
277;OFDK-P Askı Aparatı
278;Harici OFDK-P
279;Harici OFDK Bağlantı Aparatı
28;Kompozit Menhol Çerçevesi
280;T25
281;FAOC Kutusu
282;TK-OBF SC 2 m
283;1x24 TK-OBK SC 5 m
284;1x24 TK-OBK SC 10 m
285;1x24 TK-OBK SC 20 m
286;1x1 K-OBK SC-SC 1 m
287;1x1 K-OBK SC-SC 2 m
288;1x1 K-OBK SC-SC 3 m
289;1x1 K-OBK SC-SC 5 m
290;1x1 K-OBK SC-SC 10 m
291;1x1 K-OBK SC-SC 20 m
292;1x1 K-OBK SC-SC 30 m
293;1x1 K-OBK SC-SC 40 m
294;1x1 K-OBK SC-SC 50 m
295;1x1 K-OBK LC-LC 1 m
296;1x1 K-OBK LC-LC 2 m
297;1x1 K-OBK LC-LC 3 m
298;1x1 K-OBK LC-LC 5 m
299;1x1 K-OBK LC-LC 10 m
3;Çift cidarlı HDPE boru (90)
300;1x1 K-OBK LC-LC 20 m
301;1x1 K-OBK LC-LC 30 m
302;1x1 K-OBK LC-LC 40 m
303;1x1 K-OBK LC-LC 50 m
304;1x1 K-OBK SC-LC 1 m
305;1x1 K-OBK SC-LC 2 m
306;1x1 K-OBK SC-LC 3 m
307;1x1 K-OBK SC-LC 5 m
308;1x1 K-OBK SC-LC 10 m
309;1x1 K-OBK SC-LC 20 m
31;Ek Odası H41 (Kompozit)
310;1x1 K-OBK SC-LC 30 m
311;1x1 K-OBK SC-LC 40 m
312;1x1 K-OBK SC-LC 50 m
313;1x1 K-OBK SC-A/SC 1 m
314;1x1 K-OBK SC-A/SC 2 m
315;1x1 K-OBK SC-A/SC 3 m
317;1x1 K-OBK SC-A/SC 10 m
318;1x1 K-OBK SC-A/SC 20 m
32;Ek Odası H65 (Kompozit)
322;1x2 K-OBK SC-SC 1 m
323;1x2 K-OBK SC-SC 2 m
324;1x2 K-OBK SC-SC 3 m
325;1x2 K-OBK SC-SC 5 m
326;1x2 K-OBK SC-SC 10 m
327;1x2 K-OBK SC-SC 20 m
328;1x2 K-OBK SC-SC 30 m
329;1x2 K-OBK SC-SC 40 m
33;Ek Odası H75 (Kompozit)
331;1x2 K-OBK LC-LC 1 m
332;1x2 K-OBK LC-LC 2 m
333;1x2 K-OBK LC-LC 3 m
334;1x2 K-OBK LC-LC 5 m
335;1x2 K-OBK LC-LC 10 m
336;1x2 K-OBK LC-LC 20 m
337;1x2 K-OBK LC-LC 30 m
338;1x2 K-OBK LC-LC 40 m
339;1x2 K-OBK LC-LC 50 m
340;1x2 K-OBK SC-LC 1 m
341;1x2 K-OBK SC-LC 2 m
342;1x2 K-OBK SC-LC 3 m
343;1x2 K-OBK SC-LC 5 m
344;1x2 K-OBK SC-LC 10 m
345;1x2 K-OBK SC-LC 20 m
346;1x2 K-OBK SC-LC 30 m
347;1x2 K-OBK SC-LC 40 m
348;1x2 K-OBK SC-LC 50 m
349;1x12 K-OBK SC-SC 5 m
350;1x12 K-OBK SC-SC 10 m
351;1x12 K-OBK SC-SC 15 m
352;1x12 K-OBK SC-SC 20 m
353;1x12 K-OBK SC-SC 25 m
354;1x12 K-OBK SC-SC 30 m
355;1x12 K-OBK SC-SC 35 m
356;1x12 K-OBK SC-SC 40 m
357;1x12 K-OBK SC-SC 45 m
358;1x12 K-OBK SC-SC 50 m
359;1x12 K-OBK LC-LC 5 m
360;1x12 K-OBK LC-LC 10 m
361;1x12 K-OBK LC-LC 15 m
362;1x12 K-OBK LC-LC 20 m
363;1x12 K-OBK LC-LC 25 m
364;1x12 K-OBK LC-LC 30 m
365;1x12 K-OBK LC-LC 35 m
366;1x12 K-OBK LC-LC 40 m
367;1x12 K-OBK LC-LC 45 m
368;1x12 K-OBK LC-LC 50 m
369;1x12 K-OBK SC-LC 5 m
370;1x12 K-OBK SC-LC 10 m
371;1x12 K-OBK SC-LC 15 m
372;1x12 K-OBK SC-LC 20 m
373;1x12 K-OBK SC-LC 25 m
374;1x12 K-OBK SC-LC 30 m
375;1x12 K-OBK SC-LC 35 m
376;1x12 K-OBK SC-LC 40 m
377;1x12 K-OBK SC-LC 45 m
378;1x12 K-OBK SC-LC 50 m
384;1x24 K-OBK SC-SC 30 m
385;1x24 K-OBK SC-SC 35 m
387;1x24 K-OBK SC-SC 45 m
388;1x24 K-OBK SC-SC 50 m
389;1x24 K-OBK SC-SC 60 m
390;1x24 K-OBK SC-SC 70 m
391;1x24 K-OBK SC-SC 80 m
392;1x24 K-OBK SC-SC 90 m
393;1x24 K-OBK SC-SC 100 m
394;1x24 K-OBK SC-SC 150 m
395;1x24 K-OBK LC-LC 5 m
396;1x24 K-OBK LC-LC 10 m
397;1x24 K-OBK LC-LC 15 m
398;1x24 K-OBK LC-LC 20 m
399;1x24 K-OBK LC-LC 25 m
4;Çift cidarlı HDPE boru için birleştirme manşonu (90)
40;Prefabrik menhol yükseltme parçası
400;1x24 K-OBK LC-LC 30 m
401;1x24 K-OBK LC-LC 35 m
402;1x24 K-OBK LC-LC 40 m
403;1x24 K-OBK LC-LC 45 m
404;1x24 K-OBK LC-LC 50 m
405;1x24 K-OBK SC-LC 5 m
406;1x24 K-OBK SC-LC 10 m
407;1x24 K-OBK SC-LC 15 m
408;1x24 K-OBK SC-LC 20 m
409;1x24 K-OBK SC-LC 25 m
41;FTTx küçük tip kabin (Tip 7, 11, 13, 15 ve 23) beton kaidesi
410;1x24 K-OBK SC-LC 30 m
411;1x24 K-OBK SC-LC 35 m
412;1x24 K-OBK SC-LC 40 m
413;1x24 K-OBK SC-LC 45 m
414;1x24 K-OBK SC-LC 50 m
415;PATCHCORD FC/UPC-FC/UPC SIMPLEX 0,6 M
416;PATCHCORD FC/UPC-FC/UPC SIMPLEX 1 M
417;PATCHCORD FC/UPC-FC/UPC SIMPLEX 3 M
418;PATCHCORD FC/UPC-FC/UPC SIMPLEX 5 M
419;PATCHCORD FC/UPC-FC/UPC SIMPLEX 7 M
42;Andezit Parke
420;PATCHCORD FC/UPC-FC/UPC SIMPLEX 10 M
421;PATCHCORD FC/UPC-FC/UPC SIMPLEX 15 M
422;PATCHCORD FC/UPC-FC/UPC SIMPLEX 20 M
423;PATCHCORD FC/UPC-FC/UPC SIMPLEX 30 M
424;PATCHCORD FC/UPC-FC/UPC SIMPLEX 40 M
425;PATCHCORD FC/UPC-SC/UPC SIMPLEX 0,6 M
426;PATCHCORD FC/UPC-SC/UPC SIMPLEX 1 M
427;PATCHCORD FC/UPC-SC/UPC SIMPLEX 3 M
428;PATCHCORD FC/UPC-SC/UPC SIMPLEX 5 M
429;PATCHCORD FC/UPC-SC/UPC SIMPLEX 7 M
43;Granit Parke
430;PATCHCORD FC/UPC-SC/UPC SIMPLEX 10 M
431;PATCHCORD FC/UPC-SC/UPC SIMPLEX 15 M
432;PATCHCORD FC/UPC-SC/UPC SIMPLEX 20 M
433;PATCHCORD FC/UPC-SC/UPC SIMPLEX 25 M
434;PATCHCORD FC/UPC-SC/UPC SIMPLEX 30 M
436;PATCHCORD FC/UPC-SC/UPC DUBLEX 12 M
437;PATCHCORD FC/UPC-LC/UPC DUBLEX 5 M
438;PATCHCORD FC/UPC-LC/UPC DUBLEX 10 M
439;PATCHCORD FC/UPC-LC/UPC DUBLEX 15 M
44;Bazalt Parke
440;PATCHCORD FC/UPC-LC/UPC DUBLEX 20 M
441;PATCHCORD FC/UPC-LC/UPC DUBLEX 25 M
442;PATCHCORD FC/UPC-MU/UPC SIMPLEX 0,6 M
443;PATCHCORD FC/UPC-MU/UPC SIMPLEX 3 M
444;PATCHCORD SC/UPC-SC/UPC SIMPLEX 0,3 M
445;PATCHCORD SC/UPC-SC/UPC SIMPLEX 0,6 M
446;PATCHCORD SC/UPC-SC/UPC SIMPLEX 7 M
447;PATCHCORD SC/UPC-SC/UPC SIMPLEX 8 M
448;PATCHCORD SC/UPC-SC/UPC SIMPLEX 13 M
449;PATCHCORD SC/UPC-SC/UPC SIMPLEX 15 M
45;Beton Parke
450;PATCHCORD SC/UPC-SC/UPC SIMPLEX 17 M
451;PATCHCORD SC/UPC-SC/UPC SIMPLEX 25 M
452;PATCHCORD SC/UPC-SC/UPC DUBLEX 6 M
453;PATCHCORD SC/UPC-SC/UPC DUBLEX 7 M
454;PATCHCORD SC/UPC-SC/UPC DUBLEX 9 M
455;PATCHCORD SC/UPC-SC/UPC DUBLEX 12 M
456;PATCHCORD SC/UPC-SC/UPC DUBLEX 15 M
457;PATCHCORD SC/UPC-SC/UPC DUBLEX 18 M
458;PATCHCORD SC/UPC-SC/UPC DUBLEX 22 M
459;PATCHCORD SC/UPC-SC/UPC DUBLEX 25 M
46;Mermer
460;PATCHCORD SC/UPC-SC/UPC DUBLEX 28 M
461;PATCHCORD SC/UPC-MU/UPC SIMPLEX 0,6 M
462;PATCHCORD SC/UPC-MU/UPC SIMPLEX 3 M
463;PATCHCORD SC/UPC-MU/UPC SIMPLEX 5 M
464;PATCHCORD SC/UPC-MU/UPC SIMPLEX 7 M
465;PATCHCORD SC/UPC-MU/UPC SIMPLEX 10 M
466;PATCHCORD SC/UPC-MU/UPC SIMPLEX 15 M
467;PATCHCORD SC/UPC-MU/UPC SIMPLEX 20 M
468;PATCHCORD SC/UPC-MU/UPC SIMPLEX 25 M
469;PATCHCORD SC/UPC-MU/UPC SIMPLEX 30 M
47;Granit
470;PATCHCORD SC/UPC-MU/UPC DUBLEX 10 M
471;PATCHCORD SC/UPC-MU/UPC DUBLEX 15 M
472;PATCHCORD SC/UPC-MU/UPC DUBLEX 20 M
473;PATCHCORD SC/UPC-E2000/APC SIMPLEX 5 M
474;PATCHCORD SC/UPC-E2000/APC SIMPLEX 10 M
475;PATCHCORD SC/UPC-E2000/APC SIMPLEX 15 M
476;PATCHCORD SC/UPC-E2000/APC SIMPLEX 20 M
477;PATCHCORD SC/UPC-E2000/UPC SIMPLEX 5 M
478;PATCHCORD LC/UPC-FC/UPC SIMPLEX 1 M
479;PATCHCORD LC/UPC-FC/UPC SIMPLEX 3 M
48;Beton Bordür
480;PATCHCORD LC/UPC-FC/UPC SIMPLEX 5 M
481;PATCHCORD LC/UPC-FC/UPC SIMPLEX 7 M
482;PATCHCORD LC/UPC-FC/UPC SIMPLEX 10 M
483;PATCHCORD LC/UPC-FC/UPC SIMPLEX 15 M
484;PATCHCORD LC/UPC-FC/UPC SIMPLEX 20 M
485;PATCHCORD LC/UPC-FC/UPC SIMPLEX 25 M
486;PATCHCORD LC/UPC-FC/UPC SIMPLEX 30 M
487;PATCHCORD LC/UPC-SC/UPC SIMPLEX 0,6 M
488;PATCHCORD LC/UPC-SC/UPC SIMPLEX 7 M
489;PATCHCORD LC/UPC-SC/UPC SIMPLEX 8 M
49;Karosiman
490;PATCHCORD LC/UPC-SC/UPC SIMPLEX 12 M
491;PATCHCORD LC/UPC-SC/UPC SIMPLEX 15 M
492;PATCHCORD LC/UPC-SC/UPC SIMPLEX 25 M
493;PATCHCORD LC/UPC-SC/UPC DUBLEX 4 M
494;PATCHCORD LC/UPC-SC/UPC DUBLEX 6 M
495;PATCHCORD LC/UPC-SC/UPC DUBLEX 7 M
496;PATCHCORD LC/UPC-SC/UPC DUBLEX 8 M
497;PATCHCORD LC/UPC-SC/UPC DUBLEX 9 M
498;PATCHCORD LC/UPC-SC/UPC DUBLEX 10,5 M
499;PATCHCORD LC/UPC-SC/UPC DUBLEX 11M
5;Çift cidarlı HDPE Boru (75)
50;C20/25 beton
500;PATCHCORD LC/UPC-SC/UPC DUBLEX 11,5 M
501;PATCHCORD LC/UPC-SC/UPC DUBLEX 12 M
502;PATCHCORD LC/UPC-SC/UPC DUBLEX 12,5 M
503;PATCHCORD LC/UPC-SC/UPC DUBLEX 13 M
504;PATCHCORD LC/UPC-SC/UPC DUBLEX 13,5 M
505;PATCHCORD LC/UPC-SC/UPC DUBLEX 14 M
506;PATCHCORD LC/UPC-SC/UPC DUBLEX 14,5 M
507;PATCHCORD LC/UPC-SC/UPC DUBLEX 15 M
508;PATCHCORD LC/UPC-SC/UPC DUBLEX 15,5 M
509;PATCHCORD LC/UPC-SC/UPC DUBLEX 16 M
51;Soğuk Asfalt
510;PATCHCORD LC/UPC-SC/UPC DUBLEX 16,5 M
511;PATCHCORD LC/UPC-SC/UPC DUBLEX 17 M
512;PATCHCORD LC/UPC-SC/UPC DUBLEX 17,5 M
513;PATCHCORD LC/UPC-SC/UPC DUBLEX 18 M
514;PATCHCORD LC/UPC-SC/UPC DUBLEX 18,5 M
515;PATCHCORD LC/UPC-SC/UPC DUBLEX 19 M
516;PATCHCORD LC/UPC-SC/UPC DUBLEX 19,5 M
517;PATCHCORD LC/UPC-SC/UPC DUBLEX 21 M
518;PATCHCORD LC/UPC-SC/UPC DUBLEX 22 M
519;PATCHCORD LC/UPC-SC/UPC DUBLEX 25 M
52;Rak pabucu (25'lik ve 50'lik)
520;PATCHCORD LC/UPC-SC/UPC DUBLEX 28 M
521;PATCHCORD LC/UPC-SC/UPC DUBLEX 33 M
522;PATCHCORD LC/UPC-SC/UPC DUBLEX 35 M
523;PATCHCORD LC/UPC-SC/UPC DUBLEX 38 M
524;PATCHCORD LC/UPC-SC/UPC DUBLEX 45 M
525;PATCHCORD LC/UPC-SC/UPC DUBLEX 55 M
526;PATCHCORD LC/UPC-LC/UPC SIMPLEX 0,3 M
527;PATCHCORD LC/UPC-LC/UPC SIMPLEX 0,5 M
528;PATCHCORD LC/UPC-LC/UPC SIMPLEX 0,6 M
529;PATCHCORD LC/UPC-LC/UPC SIMPLEX 1,2 M
53;Tıkama malzemesi (protolin)
530;PATCHCORD LC/UPC-LC/UPC SIMPLEX 7 M
531;PATCHCORD LC/UPC-LC/UPC SIMPLEX 8 M
532;PATCHCORD LC/UPC-LC/UPC SIMPLEX 12 M
533;PATCHCORD LC/UPC-LC/UPC SIMPLEX 15 M
534;PATCHCORD LC/UPC-LC/UPC SIMPLEX 25 M
535;PATCHCORD LC/UPC-LC/UPC DUBLEX 0,15 M
536;PATCHCORD LC/UPC-LC/UPC DUBLEX 0,20 M
537;PATCHCORD LC/UPC-LC/UPC DUBLEX 0,30 M
538;PATCHCORD LC/UPC-LC/UPC DUBLEX 7 M
539;PATCHCORD LC/UPC-LC/UPC DUBLEX 8 M
54;Menhol kanalı tıkama malzemesi (Dolu göz için)
540;PATCHCORD LC/UPC-LC/UPC DUBLEX 12 M
541;PATCHCORD LC/UPC-LC/UPC DUBLEX 13 M
542;PATCHCORD LC/UPC-LC/UPC DUBLEX 14 M
543;PATCHCORD LC/UPC-LC/UPC DUBLEX 15 M
544;PATCHCORD LC/UPC-LC/UPC DUBLEX 16 M
545;PATCHCORD LC/UPC-LC/UPC DUBLEX 17 M
546;PATCHCORD LC/UPC-LC/UPC DUBLEX 18 M
547;PATCHCORD LC/UPC-LC/UPC DUBLEX 23 M
548;PATCHCORD LC/UPC-LC/UPC DUBLEX 25 M
549;PATCHCORD LC/UPC-LC/UPC DUBLEX 28 M
55;Menhol kanalı tıkama malzemesi (Boş göz için, mekanik tip)
550;PATCHCORD LC/UPC-LC/UPC DUBLEX 35 M
551;PATCHCORD LC/UPC-MU/UPC SIMPLEX 1 M
552;PATCHCORD LC/UPC-MU/UPC SIMPLEX 3 M
553;PATCHCORD LC/UPC-MU/UPC SIMPLEX 7 M
554;PATCHCORD LC/UPC-MU/UPC SIMPLEX 10 M
555;PATCHCORD LC/UPC-MU/UPC SIMPLEX 15 M
556;PATCHCORD LC/UPC-MU/UPC SIMPLEX 20 M
557;PATCHCORD MU/UPC-MU/UPC SIMPLEX 0,3 M
558;PATCHCORD MU/UPC-MU/UPC SIMPLEX 0,6 M
559;PATCHCORD MU/UPC-MU/UPC SIMPLEX 1 M
56;Ağaç telefon direği (7 Mt)
560;PATCHCORD MU/UPC-MU/UPC SIMPLEX 3 M
561;PATCHCORD MU/UPC-MU/UPC SIMPLEX 5 M
562;PATCHCORD MU/UPC-MU/UPC SIMPLEX 7 M
563;PATCHCORD MU/UPC-MU/UPC SIMPLEX 10 M
564;PATCHCORD MU/UPC-MU/UPC SIMPLEX 15 M
565;PATCHCORD MU/UPC-MU/UPC SIMPLEX 20 M
566;PATCHCORD MU/UPC-MU/UPC DUBLEX 0,6 M
567;PATCHCORD ST/UPC-LC/UPC DUBLEX 5 M
568;PATCHCORD ST/UPC-LC/UPC DUBLEX 10 M
569;PATCHCORD ST/UPC-LC/UPC DUBLEX 20 M
57;Ağaç telefon direği (8 Mt)
570;PATCHCORD SC/UPC-SC/UPC 4X1 BREAKOUT 10M
571;PATCHCORD SC/UPC-SC/UPC 4X1 BREAKOUT 15M
572;PATCHCORD SC/UPC-SC/UPC 4X1 BREAKOUT 20M
573;PATCHCORD SC/UPC-SC/UPC 4X1 BREAKOUT 25M
574;PATCHCORD SC/UPC-SC/UPC 4X1 BREAKOUT 30M
575;PATCHCORD SC/UPC-SC/UPC 4X1 BREAKOUT 40M
576;PATCHCORD SC/UPC-SC/UPC 12X1BREAKOUT 10M
577;PATCHCORD SC/UPC-SC/UPC 12X1BREAKOUT 15M
578;PATCHCORD SC/UPC-SC/UPC 12X1BREAKOUT 20M
579;PATCHCORD SC/UPC-SC/UPC 12X1BREAKOUT 25M
58;Ağaç telefon direği (9 Mt)
580;PATCHCORD SC/UPC-SC/UPC 12X1BREAKOUT 30M
581;PATCHCORD SC/UPC-SC/UPC 12X1BREAKOUT 40M
582;PATCHCORD LC/UPC-SC/UPC 4X1 BREAKOUT 10M
583;PATCHCORD LC/UPC-SC/UPC 4X1 BREAKOUT 15M
584;PATCHCORD LC/UPC-SC/UPC 4X1 BREAKOUT 20M
585;PATCHCORD LC/UPC-SC/UPC 4X1 BREAKOUT 25M
586;PATCHCORD LC/UPC-SC/UPC 4X1 BREAKOUT 30M
587;PATCHCORD LC/UPC-SC/UPC 4X1 BREAKOUT 40M
588;PATCHCORD LC/UPC-SC/UPC 12X1BREAKOUT 10M
589;PATCHCORD LC/UPC-SC/UPC 12X1BREAKOUT 15M
59;10 luk kesmeli modül 
590;PATCHCORD LC/UPC-SC/UPC 12X1BREAKOUT 20M
591;PATCHCORD LC/UPC-SC/UPC 12X1BREAKOUT 25M
592;PATCHCORD LC/UPC-SC/UPC 12X1BREAKOUT 30M
593;PATCHCORD LC/UPC-SC/UPC 12X1BREAKOUT 40M
594;Z-OABK SC-SC 0,6m 3dB
595;Z-OABK SC-SC 0,6m 5dB
596;Z-OABK SC-SC 0,6m 10dB
597;Z-OABK LC-LC 0,6m 3dB
598;Z-OABK LC-LC 0,6m 5dB
599;Z-OABK LC-LC 0,6m 10dB
6;Çift cidarlı HDPE boru için birleştirme manşonu (75)
60;10 luk kesmesiz modül 
600;Z-OABK MU-MU 0,6m 3dB
601;Z-OABK MU-MU 0,6m 5dB
602;Z-OABK MU-MU 0,6m 10dB
603;U-LINK SIMPLEX FC UPC/SC UPC
604;U-LINK SIMPLEX FC UPC/LC UPC
605;U-LINK SIMPLEX MU UPC/MU UPC
606;U-LINK SIMPLEX LC UPC/SC UPC
607;U-LINK SIMPLEX LC UPC/LC UPC
608;U-LINK DUBLEX LC UPC/LC UPC
609;U-LINK SIMPLEX FC UPC/FC UPC
61;Küçük konnektör (0.4, 0.5)
610;U-LINK SIMPLEX SC UPC/SC UPC
611;U-LINK SIMPLEX E-2000 APC / E-2000 APC
612;U-LINK SIMPLEX E-2000 UPC / E-2000 UPC
613;ZAYIFLATICI SC PLUG-IN TİPİ 5 dB
614;ZAYIFLATICI SC PLUG-IN TİPİ 3 dB
615;ZAYIFLATICI SC PLUG-IN TİPİ 7 dB
616;ZAYIFLATICI SC PLUG-IN TİPİ 10 dB
617;ZAYIFLATICI SC PLUG-IN TİPİ 15dB
618;ZAYIFLATICI LC PLUG-IN TİPİ 3 dB
619;ZAYIFLATICI LC PLUG-IN TİPİ 5 dB
62;Büyük konnektör (0.4, 0.9)
620;ZAYIFLATICI LC PLUG-IN TİPİ 7 dB
621;ZAYIFLATICI LC PLUG-IN TİPİ 10 dB
622;ZAYIFLATICI LC PLUG-IN TİPİ 15 dB
623;ZAYIFLATICI FC PLUG-IN TİPİ 3 dB
624;ZAYIFLATICI FC PLUG-IN TİPİ 5 dB
625;ZAYIFLATICI FC PLUG-IN TİPİ 7dB
626;ZAYIFLATICI FC PLUG-IN TİPİ 10 dB
627;ZAYIFLATICI MU PLUG-IN TİPİ 3 dB
628;ZAYIFLATICI MU PLUG-IN TİPİ 5 dB
629;ZAYIFLATICI MU PLUG-IN TİPİ 7 dB
630;ZAYIFLATICI MU PLUG-IN TİPİ 10 dB
631;ZAYIFLATICI MU PLUG-IN TİPİ 15 dB
632;1x24 TK-OBK SC 2 m
633;1x24 TK-OBK SC 3 m
634;1x32 TK-OBK SC 10 m
635;1x1 K-OBK SC-A/LC 3 M
636;1x16 K-OBK SC-SC 5 m
637;1x16 K-OBK SC-SC 10 m
638;1x16 K-OBK SC-SC 20 m
639;1x32 K-OBK SC-SC 5 m
64;BEKT A
640;1x32 K-OBK SC-SC 10 m
641;1x32 K-OBK SC-SC 20 m
642;FO-H 4
643;FO-H 6
644;FO-H 12
645;FO-H 24
646;FO-H 36
647;FO-H 48
648;FO-Y 4
649;FO-Y 6
65;BEKT B
650;FO-Y 12
651;FO-Y 24
652;FO-Y 36
653;FO-Y 48
654;FO-Y 60
655;FO-Y 72
656;FO-Y 96
657;FO-Y 144
658;FO-Y 192
66;BEKT C
662;FO-NM 12
67;Çatal ek kiti
671;FO-M 24
673;FO-M 48
676;FO-M 96
677;FO-M 144
68;Topraklama kiti
680;KPDF-APA 20-0.4
681;KPDF-APA 30-0.4
682;KPDF-APA 50-0.4
683;KPDF-APA 100-0.4
684;KPDF-APA 150-0.4
685;KPDF-APA 200-0.4
686;KPDF-APA 6-0.5
687;KPDF-APA 10-0.5
688;KPDF-APA 20-0.5
689;KPDF-APA 30-0.5
69;İzoleli Çelik spiral boru 9 mm
690;KPDF-APA 50-0.5
691;KPDF-APA 100-0.5
692;KPDF-APA 150-0.5
693;KPDF-APA 200-0.5
694;KPDF-APA 20-0.6
695;KPDF-APA 30-0.6
696;KPDF-APA 50-0.6
697;KPDF-APA 100-0.6
698;KPDF-APA 150-0.6
699;KPDF-APA 200-0.6
7;Çift cidarlı HDPE Boru (50)
70;İzoleli Çelik spiral boru 11 mm
702;KPDF-APA 20-0.9
703;KPDF-APA 30-0.9
704;KPDF-APA 50-0.9
705;KPDF-APA 100-0.9
706;KPDF-AP 20-0.4
707;KPDF-AP 30-0.4
708;KPDF-AP 50-0.4
709;KPDF-AP 100-0.4
71;İzoleli Çelik spiral boru 14 mm
710;KPDF-AP 150-0.4
711;KPDF-AP 200-0.4
712;KPDF-AP 300-0.4
714;KPDF-AP 20-0.5
715;KPDF-AP 30-0.5
716;KPDF-AP 50-0.5
717;KPDF-AP 100-0.5
718;KPDF-AP 150-0.5
719;KPDF-AP 200-0.5
72;İzoleli Çelik spiral boru 16 mm
720;KPDF-AP 300-0.5
721;KPDF-AP 400-0.5
722;KPDF-AP 20-0.6
723;KPDF-AP 30-0.6
724;KPDF-AP 50-0.6
725;KPDF-AP 100-0.6
726;KPDF-AP 150-0.6
727;KPDF-AP 200-0.6
728;KPDF-AP 300-0.6
729;KPDF-AP 20-0.9
73;İzoleli Çelik spiral boru 18 mm
730;KPDF-AP 30-0.9
731;KPDF-AP 50-0.9
732;KPDF-AP 100-0.9
733;KPDF-AP 150-0.9
734;KPDF-AP 200-0.9
735;KPDF-AP 300-0.9
736;KPD-PAP 600-0.4
737;KPD-PAP 900-0.4
738;KPD-PAP 1200-0.4
739;KPD-PAP 1500-0.4
74;İzoleli Çelik spiral boru 26 mm
740;KPD-PAP 1800-0.4
741;KPD-PAP 600-0.5
742;KPD-PAP 900-0.5
743;KPD-PAP 1200-0.5
744;KPDF-PAP 600-0.4
745;KPDF-PAP 900-0.4
746;KPDF-PAP 1200-0.4
747;KPDF-PAP 1500-0.4
748;KPDF-PAP 1800-0.4
749;KPDF-PAP 600-0.5
75;İzoleli Çelik spiral boru 29 mm
750;KPDF-PAP 900-0.5
751;KPDF-PAP 1200-0.5
752;KPD-P-A 2-0.5
753;KPD-P-A 4-0.5
754;KPD-P-A 6-0.5
755;KPD-P-A 10-0.5
756;(K)PDF-AP 200-05 KABLO (250m)
757;(K)PDF-AP 150-05 KABLO (250m)
758;(K)PDF-AP 100-05 KABLO (250m)
759;(K)PDF-AP 50-05 KABLO (500m)
76;İzoleli Çelik spiral boru 32 mm
760;(K)PDF-AP 30-05 KABLO (500m)
761;(K)PDF-AP 20-05 KABLO (500m)
762;(K)PDF-APA 200-05 KABLO (250m)
763;(K)PDF-APA 150-05 KABLO (250m)
764;(K)PDF-APA 100-05 KABLO (250m)
765;(K)PDF-APA 50-05 KABLO (500m)
766;(K)PDF-APA 30-05 KABLO (500m)
767;(K)PDF-APA 20-05 KABLO (500m)
768;PD-P-A (KPD-PA) 10-05 KABLO (500m)
769;PD-P-A (KPD-PA) 6-05 KABLO (500m)
77;İzoleli Çelik spiral boru 37 mm
770;PD-P-A (KPD-PA) 4-05 KABLO (500m)
771;PD-P-A (KPD-PA) 2-05 KABLO (250m)
78;İzoleli Çelik spiral boru 42 mm
785;İş Elbisesi Seti
786;Ekip Çantası
788;12.1 nolu Poz kapsamındaki xDSL Ölçü Aleti
789;12.2 nolu Poz kapsamındaki El Aletleri Seti
79;İzoleli Çelik spiral boru 50 mm
790;Normal Çalışma Kişisel Koruyucu Donanım Seti
791;Yüksekte Çalışma Kişisel Koruyucu Donanım Seti
792;SRC Belgeleri (SRC2, SRC4, Psikoteknik belgelerinin tümü için)
797;Camper Teli (Mavi-Beyaz)
798;Camper Teli (Turuncu-Beyaz)
799;nDSL Camper Teli (Yeşil-Beyaz)
8;Çift cidarlı HDPE boru için birleştirme manşonu (50)
80;İzoleli Çelik spiral boru 63 mm
800;Camper Teli (Mavi-Beyaz) (250m)
801;Camper Teli (Turuncu-Beyaz) (250m)
802;nDSL Camper Teli (Yeşil-Beyaz) (250m)
805;OFSD 20U
806;Dolgu ve sargı malzemesi (İlgili kurumun istediği evsafta)
807;OFDK-M MODÜLER
808;OFDK-M 1X16 MODÜLÜ
809;OFDK-M 1X32 MODÜLÜ
81;Galvanizli boru 1/2"
810;OFDM 1X2
811;OFDM 1X8 
812;OFDM 1X16
813;OFDM 1X4
814;OFDM 1X32
815;ONTT
816;OFSD 3U SHELF
82;Galvanizli boru 3/4"
83;Galvanizli boru 1"
84;Galvanizli boru 1 1/4"
85;Galvanizli boru 1 1/2"
86;Galvanizli boru 2"
87;Galvanizli boru 2 1/2"
88;Galvanizli boru 3"
89;Galvanizli boru 4"
9;1x1 HDPE boru
90;Çelik spiral boru 9 mm
91;Çelik spiral boru 11 mm
92;Çelik spiral boru 14 mm
93;Çelik spiral boru 16 mm
94;Çelik spiral boru 18 mm
95;Çelik spiral boru 21 mm
96;Çelik spiral boru 26 mm
97;Çelik spiral boru 29 mm
98;Çelik spiral boru 32 mm
99;Çelik spiral boru 37 mm`;

interface JobItem {
  poz: string;
  desc: string;
  unit: string;
}

interface MalzemeItem {
  kod: string;
  ad: string;
}

export const FastBookForm: React.FC<FastBookFormProps> = ({ ekipKodu, sheetUrl, onComplete }) => {
  // Proje bilgileri
  const [projeID, setProjeID] = useState('');
  const [santral, setSantral] = useState('');
  const [saha, setSaha] = useState('');
  const [kutu, setKutu] = useState('');
  const [tarih, setTarih] = useState(() => new Date().toISOString().split('T')[0]);

  // İşçilik giriş
  const [iscilikSearch, setIscilikSearch] = useState('');
  const [selectedIscilik, setSelectedIscilik] = useState<JobItem | null>(null);
  const [iscilikQty, setIscilikQty] = useState('');
  const [iscilikError, setIscilikError] = useState('');

  // Malzeme giriş
  const [malzemeSearch, setMalzemeSearch] = useState('');
  const [selectedMalzemeler, setSelectedMalzemeler] = useState<string[]>([]);
  const [malzemeQty, setMalzemeQty] = useState('');
  const [malzemeUnit, setMalzemeUnit] = useState('');

  // Tablo kayıtları
  const [logEntries, setLogEntries] = useState<FastBookRow[]>(() => {
    const saved = localStorage.getItem(`fastbook_entries_${ekipKodu}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Gönderim ve indirme durumları
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Veri parsing
  const jobList: JobItem[] = useMemo(() => {
    const lines = jobDataRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const list: JobItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';');
      if (cols.length >= 3) {
        list.push({ poz: cols[0].trim(), desc: cols[1].trim(), unit: cols[2].trim() });
      }
    }
    return list;
  }, []);

  const malzemeList: MalzemeItem[] = useMemo(() => {
    const lines = malzemeDataRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const list: MalzemeItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';');
      if (cols.length >= 2) {
        list.push({ kod: cols[0].trim(), ad: cols[1].trim() });
      }
    }
    return list;
  }, []);

  // Local storage auto-save
  useEffect(() => {
    localStorage.setItem(`fastbook_entries_${ekipKodu}`, JSON.stringify(logEntries));
  }, [logEntries, ekipKodu]);

  // Filtrelenmiş İşçilik
  const filteredJobs = useMemo(() => {
    const q = iscilikSearch.toLowerCase().trim();
    if (!q) return jobList.slice(0, 15);
    return jobList.filter(j => j.poz.toLowerCase().includes(q) || j.desc.toLowerCase().includes(q)).slice(0, 20);
  }, [iscilikSearch, jobList]);

  // Filtrelenmiş Malzemeler
  const filteredMalzemeler = useMemo(() => {
    const q = malzemeSearch.toLowerCase().trim();
    if (!q) return malzemeList.slice(0, 30);
    return malzemeList.filter(m => m.kod.toLowerCase().includes(q) || m.ad.toLowerCase().includes(q)).slice(0, 40);
  }, [malzemeSearch, malzemeList]);

  const handleSelectJob = (job: JobItem) => {
    setSelectedIscilik(job);
    setIscilikSearch(job.poz);
    setIscilikError('');
  };

  const toggleMalzeme = (kod: string) => {
    setSelectedMalzemeler(prev => 
      prev.includes(kod) ? prev.filter(k => k !== kod) : [...prev, kod]
    );
  };

  const clearSelectedMalzemeler = () => {
    setSelectedMalzemeler([]);
    setMalzemeQty('');
    setMalzemeUnit('');
  };

  const copyIscilikQtyToMalzeme = () => {
    if (iscilikQty) {
      setMalzemeQty(iscilikQty);
    } else {
      setIscilikError('⚠️ Önce işçilik miktarı giriniz!');
      setTimeout(() => setIscilikError(''), 3000);
    }
  };

  const addRow = () => {
    if (!selectedIscilik && !iscilikSearch) {
      setIscilikError('⚠️ İşçilik pozu seçiniz!');
      return;
    }

    const currentPoz = selectedIscilik ? selectedIscilik.poz : iscilikSearch;
    const currentDesc = selectedIscilik ? selectedIscilik.desc : (jobList.find(j => j.poz === currentPoz)?.desc || '');
    const currentUnit = selectedIscilik ? selectedIscilik.unit : (jobList.find(j => j.poz === currentPoz)?.unit || '');

    if (!iscilikQty || Number(iscilikQty) <= 0) {
      setIscilikError('⚠️ Geçerli işçilik miktarı giriniz!');
      return;
    }

    setIscilikError('');

    const newRows: FastBookRow[] = [];

    if (selectedMalzemeler.length > 0) {
      selectedMalzemeler.forEach(kod => {
        const malz = malzemeList.find(m => m.kod === kod);
        newRows.push({
          Tarih: tarih,
          ProjeID: projeID,
          Santral: santral,
          Saha: saha,
          Kutu: kutu,
          IscilikPoz: currentPoz,
          IscilikAciklama: currentDesc,
          IscilikMiktar: iscilikQty,
          IscilikBirim: currentUnit,
          MalzemePoz: kod,
          MalzemeAdi: malz ? malz.ad : '',
          MalzemeMiktar: malzemeQty || '',
          MalzemeBirim: malzemeUnit || ''
        });
      });
    } else {
      newRows.push({
        Tarih: tarih,
        ProjeID: projeID,
        Santral: santral,
        Saha: saha,
        Kutu: kutu,
        IscilikPoz: currentPoz,
        IscilikAciklama: currentDesc,
        IscilikMiktar: iscilikQty,
        IscilikBirim: currentUnit,
        MalzemePoz: '',
        MalzemeAdi: '',
        MalzemeMiktar: '',
        MalzemeBirim: ''
      });
    }

    setLogEntries(prev => [...prev, ...newRows]);

    // Formu sıfırla (Proje ve lokasyon bilgileri kalır)
    setIscilikSearch('');
    setSelectedIscilik(null);
    setIscilikQty('');
    setMalzemeQty('');
    setMalzemeUnit('');
    setSelectedMalzemeler([]);
  };

  const resetInputForm = () => {
    setIscilikSearch('');
    setSelectedIscilik(null);
    setIscilikQty('');
    setMalzemeQty('');
    setMalzemeUnit('');
    setSelectedMalzemeler([]);
    setMalzemeSearch('');
    setIscilikError('');
  };

  const deleteRow = (index: number) => {
    setLogEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearButtonClick = () => {
    if (logEntries.length === 0) return;
    setShowClearConfirmModal(true);
  };

  const executeClearAllRows = () => {
    setLogEntries([]);
    localStorage.removeItem(`fastbook_entries_${ekipKodu}`);
    setShowClearConfirmModal(false);
    setSaveStatus('idle');
    setStatusMessage('🗑️ Şantiye defterindeki tüm satırlar başarıyla temizlendi.');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Excel (.xlsx) dosyasını indirme ve Google Sheets'e kaydetme
  const handleSaveAndExport = async (onlyDownloadExcel = false) => {
    if (logEntries.length === 0) {
      setSaveStatus('error');
      setStatusMessage('⚠️ Kaydedilecek veya indirilecek satır bulunamadı!');
      setTimeout(() => setStatusMessage(''), 4000);
      return;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const timeFormatted = `${day}.${month}.${year}_${hours}.${mins}`;
    
    const fileName = `Santiye_Defteri_${ekipKodu}_${timeFormatted}.xlsx`;
    const driveFileTitle = `Santiye_Defteri_${ekipKodu}_${timeFormatted}`;

    // 1. Excel dosyasını oluştur ve indir
    try {
      const ws = XLSX.utils.json_to_sheet(logEntries);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SantiyeDefteri");
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Excel generation error:", err);
    }

    if (onlyDownloadExcel) {
      setSaveStatus('success');
      setStatusMessage(`✅ ${logEntries.length} satırlık Excel dosyası indirildi.`);
      setTimeout(() => setStatusMessage(''), 4000);
      return;
    }

    // 2. Google Sheets'e yeni dosya olarak kaydetme işlemi
    if (!sheetUrl) {
      setSaveStatus('error');
      setStatusMessage("⚠️ Google Sheets URL tanımlı değil! Excel dosyanız indirildi.");
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setStatusMessage('Google Drive’a yeni dosya olarak kaydediliyor...');

    try {
      const payload = {
        reportType: 'fastbook',
        ekipKodu: ekipKodu,
        timestamp: `${day}.${month}.${year} ${hours}:${mins}:00`,
        fileTitle: driveFileTitle,
        items: logEntries
      };

      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSaveStatus('success');
      setStatusMessage(`✅ ${logEntries.length} satır imalat Google Drive'a "${driveFileTitle}" adıyla YENİ DOSYA olarak kaydedildi ve Excel indirildi!`);
      
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }

    } catch (error) {
      console.error("Google Sheets save error:", error);
      setSaveStatus('error');
      setStatusMessage('Google Sheets kaydı sırasında bir hata oluştu, ancak Excel dosyanız indirildi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* BAŞLIK & BUTONLAR */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-400/30">
            <FileSpreadsheet className="text-emerald-400" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded uppercase tracking-widest">
                FASTBOOK
              </span>
              <span className="text-xs text-emerald-200 font-mono font-bold">
                {ekipKodu}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight uppercase">
              Şantİye Defterİ - İşçİlİk & Malzeme
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            type="button" 
            id="fastbook-btn-clear-all"
            onClick={handleClearButtonClick}
            disabled={logEntries.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-black transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            title="Tablodaki tüm satırları temizler"
          >
            <Trash2 size={15} />
            <span>TEMİZLE</span>
          </button>
          
          <button 
            type="button" 
            onClick={() => handleSaveAndExport(true)}
            disabled={logEntries.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-black transition-all disabled:opacity-50"
            title="Yalnızca Excel dosyasını bilgisayara/telefona indirir"
          >
            <Download size={15} />
            <span>EXCEL İNDİR</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleSaveAndExport(false)}
            disabled={isSaving || logEntries.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>YENİ DOSYA OLUŞTURULUYOR...</span>
              </>
            ) : (
              <>
                <CloudUpload size={16} />
                <span>EXCEL İNDİR & YENİ DOSYA KAYDET</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DURUM MESAJI */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
          saveStatus === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : saveStatus === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {saveStatus === 'success' ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* PROJE VE LOKASYON BİLGİLERİ */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
          <Building2 size={16} className="text-indigo-600" />
          <span>📋 Proje ve Lokasyon Bilgileri</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Proje ID</label>
            <input 
              type="text" 
              value={projeID}
              onChange={e => setProjeID(e.target.value)}
              placeholder="Örn: PRJ-2026"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Santral</label>
            <input 
              type="text" 
              value={santral}
              onChange={e => setSantral(e.target.value)}
              placeholder="Santral Adı"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Saha / Bölge</label>
            <input 
              type="text" 
              value={saha}
              onChange={e => setSaha(e.target.value)}
              placeholder="Saha Kodu"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Kutu / Dolap No</label>
            <input 
              type="text" 
              value={kutu}
              onChange={e => setKutu(e.target.value)}
              placeholder="Kutu No"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Tarih</label>
            <input 
              type="date" 
              value={tarih}
              onChange={e => setTarih(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* GİRİŞ FORMU */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-wider">
            <Wrench size={16} className="text-emerald-600" />
            <span>🛠️ İmalat Kayıt Girişi (İşçilik + Malzeme)</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {jobList.length} İşçilik | {malzemeList.length} Malzeme Tanımlı
          </span>
        </div>

        {/* İŞÇİLİK BÖLÜMÜ */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 uppercase flex items-center gap-1.5">
              👷 İşçilik Bilgileri <span className="text-rose-500 text-[11px]">* (Zorunlu)</span>
            </span>
            {iscilikError && (
              <span className="text-xs font-black text-rose-600 animate-pulse">{iscilikError}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-tight block">İşçilik Poz Ara / Seç</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={iscilikSearch}
                  onChange={e => {
                    setIscilikSearch(e.target.value);
                    const exact = jobList.find(j => j.poz.toLowerCase() === e.target.value.toLowerCase().trim());
                    if (exact) setSelectedIscilik(exact);
                  }}
                  placeholder="Poz No veya Açıklama ara (Örn: 2.1)..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
              {/* Açılır Liste */}
              {filteredJobs.length > 0 && (
                <div className="max-h-36 overflow-y-auto border border-slate-200 bg-white rounded-xl divide-y divide-slate-100 shadow-sm mt-1">
                  {filteredJobs.map(job => (
                    <button
                      key={job.poz + job.desc}
                      type="button"
                      onClick={() => handleSelectJob(job)}
                      className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center transition-colors ${
                        selectedIscilik?.poz === job.poz ? 'bg-emerald-100 font-black text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-mono font-black text-emerald-700 w-14 shrink-0">{job.poz}</span>
                      <span className="truncate flex-1 font-medium">{job.desc}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-bold ml-2">{job.unit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-tight block">Seçilen İşçilik Açıklaması</label>
              <input 
                type="text"
                readOnly
                value={selectedIscilik?.desc || (jobList.find(j => j.poz === iscilikSearch)?.desc || '')}
                placeholder="İşçilik seçildiğinde otomatik gelir"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-bold text-xs text-slate-700 cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-tight block">Miktar</label>
              <input 
                type="number"
                step="any"
                value={iscilikQty}
                onChange={e => {
                  setIscilikQty(e.target.value);
                  if (selectedMalzemeler.length > 0 && !malzemeQty) {
                    setMalzemeQty(e.target.value);
                  }
                }}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-tight block">Birim</label>
              <input 
                type="text"
                readOnly
                value={selectedIscilik?.unit || (jobList.find(j => j.poz === iscilikSearch)?.unit || '')}
                placeholder="Mt / Ad"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-bold text-xs text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* MALZEME BÖLÜMÜ (İSTEĞE BAĞLI) */}
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 uppercase flex items-center gap-1.5">
              📦 Malzeme Bilgileri <span className="text-slate-400 text-[10px] font-normal">(İsteğe Bağlı - Boş Bırakılabilir)</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                Seçili: {selectedMalzemeler.length} Adet
              </span>
              {selectedMalzemeler.length > 0 && (
                <button 
                  type="button" 
                  onClick={clearSelectedMalzemeler}
                  className="text-[10px] font-bold text-rose-600 hover:underline"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-tight block">Malzeme Ara</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={malzemeSearch}
                  onChange={e => setMalzemeSearch(e.target.value)}
                  placeholder="Kod veya Malzeme adı yazın..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-900 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-tight block">
                  Malzeme Miktarı
                </label>
                <button 
                  type="button" 
                  onClick={copyIscilikQtyToMalzeme}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  title="İşçilik miktarını kopyala"
                >
                  <Copy size={11} /> İŞÇİLİK MİKTARINI AL
                </button>
              </div>
              <input 
                type="number"
                step="any"
                value={malzemeQty}
                onChange={e => setMalzemeQty(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-900 outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-tight block">Malzeme Birim</label>
              <input 
                type="text"
                value={malzemeUnit}
                onChange={e => setMalzemeUnit(e.target.value)}
                placeholder="Ad. / Mt. / Paket"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-900 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Malzeme Seçim Listesi (Çoklu Seçim) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-tight block">
              Malzeme Seçim Kutusu (Tıklayarak birden fazla malzeme seçebilirsiniz)
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 bg-white rounded-xl divide-y divide-slate-100 shadow-inner">
              {filteredMalzemeler.map(m => {
                const isSelected = selectedMalzemeler.includes(m.kod);
                return (
                  <div
                    key={m.kod + m.ad}
                    onClick={() => toggleMalzeme(m.kod)}
                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-100/80 font-black text-amber-950 border-l-4 border-amber-600' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-amber-600 pointer-events-none"
                      />
                      <span className="font-mono font-bold text-amber-800 shrink-0">POZ {m.kod}</span>
                      <span className="truncate">{m.ad}</span>
                    </div>
                    {isSelected && <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-black">SEÇİLDİ</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BUTONLAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={resetInputForm}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            title="Seçilen işçilik ve malzeme seçimlerini temizler"
          >
            <RotateCcw size={14} />
            <span>SEÇİMLERİ SIFIRLA</span>
          </button>

          <button
            type="button"
            onClick={addRow}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>LİSTEYE EKLE</span>
          </button>
        </div>
      </div>

      {/* İMALAT TABLOSU */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
              📋 Eklenen İmalat Kalemleri
            </h3>
          </div>
          <div className="text-xs font-bold text-slate-500 flex items-center gap-3">
            <span>Toplam: <strong className="text-slate-900">{logEntries.length}</strong> Satır</span>
            <span>|</span>
            <span>İşçilik: <strong className="text-emerald-700">{logEntries.filter(e => e.IscilikPoz).length}</strong></span>
            <span>|</span>
            <span>Malzeme: <strong className="text-amber-700">{logEntries.filter(e => e.MalzemePoz).length}</strong></span>
          </div>
        </div>

        {logEntries.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <FileSpreadsheet className="mx-auto text-slate-300" size={36} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Henüz imalat satırı eklenmedi
            </p>
            <p className="text-[10px] text-slate-400">
              Yukarıdaki formdan işçilik ve malzeme seçip "Listeye Ekle" butonuna basın.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[480px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white text-[10px] font-black uppercase sticky top-0 z-10">
                <tr>
                  <th className="p-2.5 whitespace-nowrap">Tarih</th>
                  <th className="p-2.5 whitespace-nowrap">Proje ID</th>
                  <th className="p-2.5 whitespace-nowrap">Santral</th>
                  <th className="p-2.5 whitespace-nowrap">Saha</th>
                  <th className="p-2.5 whitespace-nowrap">Kutu</th>
                  <th className="p-2.5 whitespace-nowrap text-emerald-400">İş Poz</th>
                  <th className="p-2.5 min-w-[180px]">İş Açıklama</th>
                  <th className="p-2.5 text-right whitespace-nowrap">İş Miktar</th>
                  <th className="p-2.5 whitespace-nowrap">Birim</th>
                  <th className="p-2.5 whitespace-nowrap text-amber-400">M. Poz</th>
                  <th className="p-2.5 min-w-[180px]">Malzeme Adı</th>
                  <th className="p-2.5 text-right whitespace-nowrap">M. Miktar</th>
                  <th className="p-2.5 whitespace-nowrap">M. Birim</th>
                  <th className="p-2.5 text-center whitespace-nowrap">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logEntries.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 whitespace-nowrap text-slate-600">{row.Tarih}</td>
                    <td className="p-2.5 whitespace-nowrap font-bold text-slate-800">{row.ProjeID || '-'}</td>
                    <td className="p-2.5 whitespace-nowrap text-slate-600">{row.Santral || '-'}</td>
                    <td className="p-2.5 whitespace-nowrap text-slate-600">{row.Saha || '-'}</td>
                    <td className="p-2.5 whitespace-nowrap text-slate-600">{row.Kutu || '-'}</td>
                    <td className="p-2.5 whitespace-nowrap font-mono font-black text-emerald-700 bg-emerald-50/50">{row.IscilikPoz}</td>
                    <td className="p-2.5 text-slate-800">{row.IscilikAciklama}</td>
                    <td className="p-2.5 text-right font-black text-emerald-800">{row.IscilikMiktar}</td>
                    <td className="p-2.5 text-slate-500 text-[10px]">{row.IscilikBirim}</td>
                    <td className="p-2.5 whitespace-nowrap font-mono font-bold text-amber-800">
                      {row.MalzemePoz ? <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-black">{row.MalzemePoz}</span> : '-'}
                    </td>
                    <td className="p-2.5 text-slate-700">{row.MalzemeAdi || '-'}</td>
                    <td className="p-2.5 text-right font-bold text-amber-800">{row.MalzemeMiktar || '-'}</td>
                    <td className="p-2.5 text-slate-500 text-[10px]">{row.MalzemeBirim || '-'}</td>
                    <td className="p-2.5 text-center">
                      <button 
                        type="button" 
                        onClick={() => deleteRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Satırı Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TÜM TABLOYU TEMİZLEME ONAY MODALI */}
      {showClearConfirmModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowClearConfirmModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Şantiye Defteri Temizlensin mi?</h4>
                <p className="text-xs text-slate-500 font-medium">Bu işlem geri alınamaz</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium bg-rose-50/70 p-3 rounded-xl border border-rose-100 leading-relaxed">
              Tabloya eklediğiniz <strong className="text-rose-900 font-black">{logEntries.length} adet</strong> imalat kaydı silinecek ve hafızadan temizlenecektir.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                id="btn-confirm-clear-fastbook"
                onClick={executeClearAllRows}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>EVET, TÜMÜNÜ TEMİZLE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
