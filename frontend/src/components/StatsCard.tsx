import { LucideIcon } from 'lucide-react';
import Card from './Card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'purple' | 'cyan' | 'amber';
  className?: string;
}

export default function StatsCard({ name, value, icon: Icon, variant = 'primary', className }: StatsCardProps) {
  const variants = {
    primary: 'bg-blue-500 shadow-blue-100',
    success: 'bg-emerald-500 shadow-emerald-100',
    warning: 'bg-orange-500 shadow-orange-100',
    destructive: 'bg-rose-500 shadow-rose-100',
    info: 'bg-indigo-500 shadow-indigo-100',
    purple: 'bg-purple-500 shadow-purple-100',
    cyan: 'bg-cyan-500 shadow-cyan-100',
    amber: 'bg-amber-500 shadow-amber-100'
  };

  return (
    <Card className={cn("p-4 sm:p-6 group relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={cn(variants[variant], "p-2.5 rounded-xl text-white shadow-lg print:hidden")}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{name}</h3>
      </div>
    </Card>
  );
}
