import React, { useCallback, useState, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type
      }]
      );
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );
  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast
      }}>

      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) =>
        <div
          key={toast.id}
          className={`
              flex items-center p-4 rounded-lg shadow-lg min-w-[300px] max-w-md
              transform transition-all duration-300 ease-in-out
              ${toast.type === 'success' ? 'bg-white border-l-4 border-green-500' : ''}
              ${toast.type === 'error' ? 'bg-white border-l-4 border-red-500' : ''}
              ${toast.type === 'info' ? 'bg-white border-l-4 border-blue-500' : ''}
            `}>

            <div className="flex-shrink-0 mr-3">
              {toast.type === 'success' &&
            <CheckCircle className="w-5 h-5 text-green-500" />
            }
              {toast.type === 'error' &&
            <AlertCircle className="w-5 h-5 text-red-500" />
            }
              {toast.type === 'info' &&
            <Info className="w-5 h-5 text-blue-500" />
            }
            </div>
            <div className="flex-1 text-sm font-medium text-gray-900">
              {toast.message}
            </div>
            <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-gray-400 hover:text-gray-600">

              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>);

}
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}