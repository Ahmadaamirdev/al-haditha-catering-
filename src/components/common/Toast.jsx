import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg bg-white border border-surface-border text-sm font-medium transition-all duration-300 animate-slide-up max-w-md"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: isSuccess ? '#009B4D' : isError ? '#EF4444' : '#1684AA',
            }}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />}
            {isError && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            {isInfo && <Info className="w-5 h-5 text-brand-blue flex-shrink-0" />}
            <span className="text-slate-primary flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-muted hover:text-slate-primary p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

