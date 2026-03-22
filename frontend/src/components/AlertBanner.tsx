import { LucideIcon, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertBannerProps {
  message: string;
  icon?: LucideIcon;
  onClick?: () => void;
  onClose?: () => void;
  variant?: 'info' | 'warning' | 'destructive' | 'success';
  className?: string;
}

export default function AlertBanner({ 
  message, 
  icon: Icon, 
  onClick, 
  onClose, 
  variant = 'info',
  className 
}: AlertBannerProps) {
  const variants = {
    info: 'bg-blue-50 text-blue-800 border-blue-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-100',
    destructive: 'bg-rose-50 text-rose-800 border-rose-100',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  };

  const iconColors = {
    info: 'text-blue-500',
    warning: 'text-amber-500',
    destructive: 'text-rose-500',
    success: 'text-emerald-500',
  };

  return (
    <div className={cn(
      "relative flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-500",
      variants[variant],
      onClick && "cursor-pointer hover:shadow-md active:scale-[0.99]",
      className
    )} onClick={onClick}>
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className={cn("p-2 rounded-xl bg-white shadow-sm", iconColors[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <p className="text-sm font-bold tracking-tight">{message}</p>
      </div>
      
      <div className="flex items-center space-x-2">
        {onClick && <ChevronRight className="h-4 w-4 opacity-50" />}
        {onClose && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
