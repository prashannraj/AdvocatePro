import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'ghost';
}

export default function FormSection({ 
  title, 
  icon: Icon, 
  children, 
  className,
  variant = 'default' 
}: FormSectionProps) {
  const variants = {
    default: 'bg-slate-50/50 border border-slate-100 p-4 sm:p-6 rounded-2xl',
    elevated: 'bg-white border border-slate-100 p-4 sm:p-6 rounded-2xl shadow-sm',
    ghost: 'p-0 sm:p-0',
  };

  return (
    <div className={cn("space-y-4 animate-in fade-in slide-in-from-top-4 duration-500", variants[variant], className)}>
      <div className="flex items-center space-x-2.5 mb-2">
        <div className="h-6 w-1 bg-primary rounded-full" />
        {Icon && <Icon className="h-4 w-4 text-primary opacity-70" />}
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}
