import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className, onClick, hover = true }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        'bg-card text-card-foreground rounded-2xl border border-border p-5 shadow-sm transition-all duration-300',
        hover && 'hover:shadow-md hover:border-primary/20',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, icon: Icon }: { children: React.ReactNode; className?: string; icon?: any }) {
  return (
    <h3 className={cn('font-black text-foreground uppercase tracking-tight text-sm flex items-center', className)}>
      {Icon && <Icon className="h-4 w-4 mr-2 text-primary" />}
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}
