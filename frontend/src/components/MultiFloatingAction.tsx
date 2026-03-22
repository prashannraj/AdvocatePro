'use client';

import { useState } from 'react';
import { Plus, X, Gavel, Users, Calendar, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ActionItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  color: string;
}

export default function MultiFloatingAction() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actions: ActionItem[] = [
    { 
      label: 'New Case', 
      icon: Gavel, 
      href: '/cases', 
      color: 'bg-blue-600 shadow-blue-200' 
    },
    { 
      label: 'Add Client', 
      icon: Users, 
      href: '/clients', 
      color: 'bg-emerald-600 shadow-emerald-200' 
    },
    { 
      label: 'Schedule Hearing', 
      icon: Calendar, 
      href: '/schedule', 
      color: 'bg-purple-600 shadow-purple-200' 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-24 right-6 z-50 flex flex-col items-end space-y-4">
      {/* Action Items */}
      {isOpen && (
        <div className="flex flex-col items-end space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
          {actions.map((action, idx) => (
            <div 
              key={action.label} 
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => {
                if (action.href) router.push(action.href);
                if (action.onClick) action.onClick();
                setIsOpen(false);
              }}
            >
              <span className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {action.label}
              </span>
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform",
                action.color
              )}>
                <action.icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-90",
          isOpen ? "bg-slate-900 rotate-45" : "bg-primary shadow-primary/40"
        )}
      >
        {isOpen ? <Plus className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
      </button>

      {/* Overlay to close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] -z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
