'use client';

import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  fullScreenMobile?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  loading = false,
  fullScreenMobile = false
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      <div className={cn(
        "bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 relative",
        fullScreenMobile 
          ? "w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl" 
          : "w-full max-w-md max-h-[90vh] rounded-2xl mx-4"
      )}>
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 active:scale-90"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Background click to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={() => !loading && onClose()} 
      />
    </div>
  );
}
