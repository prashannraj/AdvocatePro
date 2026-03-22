import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'fab';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: any;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon: Icon,
  className,
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/10',
    outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
    ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/10',
    fab: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/30 rounded-full',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs h-8',
    md: 'px-5 py-2.5 text-xs h-10',
    lg: 'px-8 py-3 text-sm h-12',
    icon: 'p-2 h-10 w-10 flex items-center justify-center',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-95 select-none outline-none focus-visible:ring-2 focus-visible:ring-ring',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {Icon && <Icon className={cn('h-4 w-4', children && 'mr-2')} />}
          {children}
        </>
      )}
    </button>
  );
}
