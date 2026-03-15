
import React, { useState, useEffect } from 'react';
import { PINEntry } from './components/PINEntry';
import { Dashboard } from './components/Dashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppState, Report, ImprovementReport, ModemSetupReport, DamageReport, JobCompletionReport, VehicleLog, PortChangeReport, InventoryLog, KabloMaterialReport } from './types';
import { HardHat, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const defaultState: AppState = {
      isLoggedIn: false,
      isAdmin: false,
      ekipKodu: '',
      reports: [],
      improvementReports: [],
      modemReports: [],
      damageReports: [],
      jobCompletions: [],
      vehicleLogs: [],
      portChanges: [],
      inventoryLogs: [],
      kabloMaterialReports: [],
      announcements: [],
      sheetUrl: 'https://script.google.com/macros/s/AKfycbw9izJZXcHymohpVKzo2Y3RtOStVa7Fq1qqRrIwHo8HOBOYyauim8Qxxt5qtSXMsE3D/exec'
    };

    const saved = localStorage.getItem('atssaha_state_v15');
    if (!saved) return defaultState;

    try {
      const parsed = JSON.parse(saved);
      // Merge saved state with default state to ensure all new fields exist
      return { ...defaultState, ...parsed };
    } catch (e) {
      console.error("State parsing error:", e);
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem('atssaha_state_v15', JSON.stringify(state));
  }, [state]);

  const handleLogin = (pin: string, isAdmin: boolean) => {
    setState(prev => ({
      ...prev,
      isLoggedIn: true,
      isAdmin: isAdmin,
      ekipKodu: pin
    }));
  };

  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
      isAdmin: false,
      ekipKodu: ''
    }));
  };

  const addReport = (newReport: Report) => {
    setState(prev => ({ ...prev, reports: [newReport, ...prev.reports] }));
  };

  const addImprovementReport = (newReport: ImprovementReport) => {
    setState(prev => ({ ...prev, improvementReports: [newReport, ...prev.improvementReports] }));
  };

  const addModemReport = (newReport: ModemSetupReport) => {
    setState(prev => ({ ...prev, modemReports: [newReport, ...prev.modemReports] }));
  };

  const addDamageReport = (newReport: DamageReport) => {
    setState(prev => ({ ...prev, damageReports: [newReport, ...prev.damageReports] }));
  };

  const addJobCompletion = (newReport: JobCompletionReport) => {
    setState(prev => ({ ...prev, jobCompletions: [newReport, ...prev.jobCompletions] }));
  };

  const addVehicleLog = (newLog: VehicleLog) => {
    setState(prev => ({ ...prev, vehicleLogs: [newLog, ...prev.vehicleLogs] }));
  };

  const addPortChange = (newReport: PortChangeReport) => {
    setState(prev => ({ ...prev, portChanges: [newReport, ...prev.portChanges] }));
  };

  const addInventoryLog = (newLog: InventoryLog) => {
    setState(prev => ({ ...prev, inventoryLogs: [newLog, ...prev.inventoryLogs] }));
  };

  const addKabloMaterialReport = (newReport: KabloMaterialReport) => {
    setState(prev => ({ ...prev, kabloMaterialReports: [newReport, ...prev.kabloMaterialReports] }));
  };

  const updateSheetUrl = (url: string) => {
    setState(prev => ({ ...prev, sheetUrl: url }));
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50">
      <header className={`p-4 shadow-md sticky top-0 z-50 text-white ${state.isAdmin ? 'bg-indigo-900' : 'bg-slate-900'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`${state.isAdmin ? 'bg-indigo-500' : 'bg-orange-500'} p-2 rounded-lg`}>
              {state.isAdmin ? <ShieldCheck size={24} /> : <HardHat size={24} />}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">ATS SAHA</h1>
              {state.isAdmin && <span className="text-[10px] font-black tracking-widest text-indigo-300">ADMIN CONTROL PANEL - {state.ekipKodu}</span>}
            </div>
          </div>
          {state.isLoggedIn && (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogout}
                className="text-sm bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-md transition-colors font-bold border border-white/10"
              >
                Çıkış
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4">
        {!state.isLoggedIn ? (
          <PINEntry onLogin={handleLogin} />
        ) : state.isAdmin ? (
          <ManagerDashboard sheetUrl={state.sheetUrl} onUpdateUrl={updateSheetUrl} onLogout={handleLogout} />
        ) : (
          <Dashboard 
            {...state}
            onReportAdded={addReport} 
            onImprovementReportAdded={addImprovementReport}
            onModemReportAdded={addModemReport}
            onDamageReportAdded={addDamageReport}
            onJobCompletionAdded={addJobCompletion}
            onVehicleLogAdded={addVehicleLog}
            onPortChangeAdded={addPortChange}
            onInventoryLogAdded={addInventoryLog}
            onKabloMaterialReportAdded={addKabloMaterialReport}
            onUpdateSheetUrl={updateSheetUrl}
          />
        )}
      </main>

      <footer className="bg-white border-t p-4 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-loose">
        &copy; 2026 ATS SAHA - ATS SAHA HİZMETLERİ PORTALI
      </footer>
    </div>
    </ErrorBoundary>
  );
};

export default App;