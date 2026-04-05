import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES = {
  success: { bar: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-600', border: 'border-l-emerald-500' },
  error:   { bar: 'bg-red-500',     icon: 'bg-red-100 text-red-600',         border: 'border-l-red-500' },
  warning: { bar: 'bg-amber-500',   icon: 'bg-amber-100 text-amber-600',     border: 'border-l-amber-500' },
  info:    { bar: 'bg-blue-500',     icon: 'bg-blue-100 text-blue-600',       border: 'border-l-blue-500' },
};

const ToastItem = ({ toast, onRemove }) => {
  const s = STYLES[toast.type] || STYLES.info;

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div className={`relative flex items-start gap-3 bg-white border border-ink-200 border-l-4 ${s.border}
      rounded-2xl px-4 py-3.5 card-shadow-lg w-80 animate-fadeInUp overflow-hidden`}>

      {/* Icon */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.icon}`}>
        {ICONS[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {toast.title && <p className="text-sm font-bold text-ink-900 leading-tight">{toast.title}</p>}
        <p className={`text-sm text-ink-600 leading-snug ${toast.title ? 'mt-0.5' : ''}`}>{toast.message}</p>
      </div>

      {/* Close */}
      <button onClick={() => onRemove(toast.id)}
        className="text-ink-300 hover:text-ink-600 transition-colors shrink-0 text-lg leading-none mt-0.5">
        ×
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink-100">
        <div className={`h-full ${s.bar} rounded-full`}
          style={{ animation: `progressClose ${toast.duration || 4000}ms linear forwards` }} />
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }]);
  }, []);

  // Shortcuts
  toast.success = (message, title) => toast({ type: 'success', title, message });
  toast.error   = (message, title) => toast({ type: 'error',   title, message });
  toast.warning = (message, title) => toast({ type: 'warning', title, message });
  toast.info    = (message, title) => toast({ type: 'info',    title, message });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
