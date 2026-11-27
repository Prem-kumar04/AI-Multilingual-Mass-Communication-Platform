import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-white border-emerald-200 text-slate-900 shadow-lg shadow-emerald-900/10',
          badge: 'bg-emerald-100 text-emerald-700',
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case 'error':
        return {
          container: 'bg-white border-rose-200 text-slate-900 shadow-lg shadow-rose-900/10',
          badge: 'bg-rose-100 text-rose-700',
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case 'warning':
        return {
          container: 'bg-white border-amber-200 text-slate-900 shadow-lg shadow-amber-900/10',
          badge: 'bg-amber-100 text-amber-700',
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      case 'info':
      default:
        return {
          container: 'bg-white border-sky-200 text-slate-900 shadow-lg shadow-sky-900/10',
          badge: 'bg-sky-100 text-sky-700',
          icon: <Info className="w-4 h-4" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Top-Right Small Pop-Up Notification Stack */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const style = getStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all animate-fade-in ${style.container}`}
              role="status"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${style.badge}`}>
                  {style.icon}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug break-words">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
