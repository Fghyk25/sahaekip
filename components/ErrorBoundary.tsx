
import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-6">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={40} className="text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">BİR HATA OLUŞTU</h2>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Uygulama beklenmedik bir sorunla karşılaştı. Lütfen sayfayı yenileyin veya yöneticiye başvurun.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                <p className="text-[10px] font-mono text-red-500 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl"
            >
              <RefreshCw size={18} /> SAYFAYI YENİLE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
