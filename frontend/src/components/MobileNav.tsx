'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  Menu 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Cases', href: '/cases', icon: Briefcase },
    { name: 'Docs', href: '/documents', icon: FileText },
    { name: 'Calendar', href: '/schedule', icon: Calendar },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-xl border-t border-slate-100 px-2 py-2 flex items-center justify-around pb-safe shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.name} 
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center space-y-1 p-2.5 transition-all duration-300',
              isActive 
                ? 'text-white bg-primary rounded-2xl shadow-lg shadow-primary/30 scale-105' 
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive ? 'animate-in zoom-in-75 duration-300' : '')} />
            <span className={cn(
              "text-[8px] font-black uppercase tracking-widest leading-none",
              isActive ? "block" : "hidden sm:block"
            )}>
              {item.name}
            </span>
          </Link>
        );
      })}
      
      <button 
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center space-y-1 p-2.5 text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
      >
        <Menu className="h-5 w-5" />
        <span className="text-[8px] font-black uppercase tracking-widest leading-none hidden sm:block">Menu</span>
      </button>
    </div>
  );
}
