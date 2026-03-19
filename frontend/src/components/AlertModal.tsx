'use client';

import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-12 w-12 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-rose-500" />;
      default:
        return <Info className="h-12 w-12 text-indigo-500" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100';
      case 'error':
        return 'bg-rose-600 hover:bg-rose-700 shadow-rose-100';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-3xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-8">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-3 bg-gray-50 rounded-2xl">
              {getIcon()}
            </div>
            
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              {title}
            </h3>
            
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
              {message}
            </p>

            <button
              onClick={onClose}
              className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${getButtonClass()}`}
            >
              Okay, Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
