'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

let toastListeners: Array<(msg: ToastMessage) => void> = [];

export const toast = {
  success(title: string, description?: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    toastListeners.forEach((listener) =>
      listener({ id, type: 'success', title, description, duration })
    );
  },
  error(title: string, description?: string, duration = 4500) {
    const id = Math.random().toString(36).substring(2, 9);
    toastListeners.forEach((listener) =>
      listener({ id, type: 'error', title, description, duration })
    );
  },
  warning(title: string, description?: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    toastListeners.forEach((listener) =>
      listener({ id, type: 'warning', title, description, duration })
    );
  },
  info(title: string, description?: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    toastListeners.forEach((listener) =>
      listener({ id, type: 'info', title, description, duration })
    );
  },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const addToast = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      
      if (msg.duration !== 0) {
        setTimeout(() => {
          removeToast(msg.id);
        }, msg.duration || 4000);
      }
    };

    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((listener) => listener !== addToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => {
        let Icon = Info;
        let iconColor = 'text-blue-500';
        let borderClass = 'border-l-4 border-blue-500';
        
        if (t.type === 'success') {
          Icon = CheckCircle;
          iconColor = 'text-green-500';
          borderClass = 'border-l-4 border-green-500';
        } else if (t.type === 'error') {
          Icon = XCircle;
          iconColor = 'text-red-500';
          borderClass = 'border-l-4 border-red-500';
        } else if (t.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-yellow-500';
          borderClass = 'border-l-4 border-yellow-500';
        }

        return (
          <div
            key={t.id}
            className={`glass-panel flex items-start p-4 rounded-lg shadow-2xl transition-all duration-300 animate-slide-in ${borderClass}`}
            style={{
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className={`mr-3 mt-0.5 ${iconColor}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">{t.title}</h4>
              {t.description && (
                <p className="text-xs text-zinc-400 mt-1">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-500 hover:text-white transition-colors duration-200 ml-2"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
