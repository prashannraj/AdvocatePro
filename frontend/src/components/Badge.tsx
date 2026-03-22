import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive' | 'info' | 'litigation' | 'corporate' | 'ipr';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    outline: 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    destructive: 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    litigation: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    corporate: 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    ipr: 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  };

  return (
    <span className={cn(
      'px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
