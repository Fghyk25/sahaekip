
import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Lock, Loader2 } from 'lucide-react';
import { pb } from '../lib/pocketbase';

interface PINEntryProps {
  onLogin: (pin: string, isAdmin: boolean) => void;
}

export const PINEntry: React.FC<PINEntryProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = pin.trim().toUpperCase();
    const passInput = password.trim();
    
    setIsLoading(true);
    setError(false);

    try {
      // PocketBase Auth
      const authData = await pb.collection('teams').authWithPassword(input, passInput);
      const isAdmin = authData.record.role === 'admin';
      onLogin(input, isAdmin);
    } catch (err: any) {
      console.error("PocketBase login error:", err);
      
      // Fallback to hardcoded PINs for development/transition
      const adminPins = ['ADMIN', '9999', 'FSEVKAMIRI1', 'FSEVKAMIRI2', 'FSAHAAMIRI', 'SHEFF'];
      const teamPins = [
        '242FSAHA17550', '242FSAHA17551', '242FSAHA17552', '242FSAHA17553', '242FSAHA17554',
        '242FSAHA17555', '242FSAHA17556', '242FSAHA17557', '242FSAHA17558', '242FSAHA17559',
        '242FSAHA17561', '242FSAHA17562', '242FSAHA17563', '242FSAHA17564', '242FSAHA17565', '242FSAHA17599',
        '242FKABLO17599', '242FKABLO17600', '242FKABLO17601', '242FFO17501'
      ];

      const isAdmin = adminPins.includes(input);
      const isTeam = teamPins.includes(input);

      if (isAdmin) {
        if (passInput.toUpperCase() === 'FSAHAARTES') {
          onLogin(input === '9999' ? 'ADMIN' : input, true);
        } else {
          setError(true);
          setErrorMsg('YÖNETİCİ ŞİFRESİ HATALI');
        }
      } else if (isTeam) {
        if (passInput.toUpperCase() === 'ARTESSAHA') {
          onLogin(input, false);
        } else {
          setError(true);
          setErrorMsg('EKİP ŞİFRESİ HATALI');
        }
      } else {
        setError(true);
        setErrorMsg('GİRİŞ HATALI (POCKETBASE VEYA YEREL)');
      }
      
      if (error) {
        setTimeout(() => { setError(false); setErrorMsg(''); }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-20 max-w-sm mx-auto px-4 sm:px-0">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="bg-blue-100 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
            <KeyRound size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sisteme Giriş</h2>
          <p className="text-slate-500 mt-2 font-medium">Ekip kodunuzu girerek devam edin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 text-center uppercase tracking-widest">
              Giriş Kodu
            </label>
            <input
              type="text"
              autoCapitalize="characters"
              autoComplete="username"
              maxLength={15}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={`w-full text-center text-xl py-3 border-2 rounded-xl focus:ring-8 transition-all outline-none bg-white text-slate-900 font-bold uppercase ${
                error && errorMsg.includes('KODU') ? 'border-red-500 bg-red-50 animate-shake' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-50'
              }`}
              placeholder="EKİP KODU"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 text-center uppercase tracking-widest">
              Şifre
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full text-center text-xl py-3 border-2 rounded-xl focus:ring-8 transition-all outline-none bg-white text-slate-900 font-bold uppercase ${
                  error && errorMsg.includes('ŞİFRE') ? 'border-red-500 bg-red-50 animate-shake' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-50'
                }`}
                placeholder="ŞİFRE"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
            SİSTEME BAĞLAN
          </button>
        </form>

        <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <ShieldAlert className="text-slate-400 shrink-0" size={20} />
          <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
            Yönetici girişi ile tüm saha verilerini analiz edebilir ve raporları Excel olarak indirebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};
