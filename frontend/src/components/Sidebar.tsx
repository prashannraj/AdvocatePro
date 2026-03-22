'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Gavel, 
  FileText, 
  LogOut,
  Calendar,
  CreditCard,
  History,
  Shield,
  Lock,
  BarChart3,
  Building2,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDeptExpanded, setIsDeptExpanded] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const role = user?.role?.slug || 'staff';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Clients', href: '/clients', icon: Users, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Cases', href: '/cases', icon: Briefcase, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Documents', href: '/documents', icon: FileText, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Hearings', href: '/schedule', icon: Calendar, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'lawyer'] },
  ];

  const deptItems = [
    { name: 'Litigation', href: '/cases', icon: Gavel, color: 'text-blue-400' },
    { name: 'Corporate', href: '/corporate', icon: Building2, color: 'text-emerald-400' },
    { name: 'IPR', href: '/ipr', icon: Shield, color: 'text-purple-400' },
  ];

  const hrItems = [
    { name: 'Lawyers', href: '/lawyers', icon: Briefcase, roles: ['admin'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Roles', href: '/roles', icon: Shield, roles: ['admin'] },
    { name: 'Permissions', href: '/permissions', icon: Lock, roles: ['admin'] },
    { name: 'Attendance', href: '/attendance', icon: History, roles: ['admin'] },
    { name: 'Payroll', href: '/payroll', icon: CreditCard, roles: ['admin'] },
  ];

  const isActive = (path: string) => pathname === path;

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));
  const filteredHrItems = hrItems.filter(item => item.roles.includes(role));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-indigo-950 text-white overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-white/10 rounded-xl p-1.5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <img 
              src="/logo without background.png" 
              alt="Logo" 
              className="h-full w-full object-contain filter brightness-0 invert" 
            />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">Advocate Pro</h1>
            <p className="text-[10px] font-bold text-indigo-300 mt-1 uppercase tracking-widest opacity-80">Management</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 mb-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] opacity-50">Main Menu</div>
        {filteredNavItems.map((item) => (
          <Link 
            key={item.name}
            href={item.href} 
            onClick={onClose}
            className={cn(
              "flex items-center space-x-3 p-2.5 rounded-xl transition-all",
              isActive(item.href) 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
                : "hover:bg-white/10 text-indigo-100"
            )}
          >
            <item.icon className={cn("h-4 w-4 transition-transform", isActive(item.href) && "scale-110")} />
            <span className="text-sm font-bold">{item.name}</span>
          </Link>
        ))}

        {/* Departments Group */}
        <div className="pt-4">
          <button 
            onClick={() => setIsDeptExpanded(!isDeptExpanded)}
            className="w-full flex items-center justify-between px-2 mb-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-opacity"
          >
            <span>Departments</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", !isDeptExpanded && "-rotate-90")} />
          </button>
          
          {isDeptExpanded && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
              {deptItems.map((dept) => (
                <Link 
                  key={dept.name}
                  href={dept.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 p-2.5 rounded-xl transition-all",
                    isActive(dept.href) 
                      ? "bg-white/10 text-white border border-white/5" 
                      : "hover:bg-white/5 text-indigo-200/70 hover:text-white"
                  )}
                >
                  <dept.icon className={cn("h-4 w-4", dept.color)} />
                  <span className="text-sm font-bold">{dept.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {filteredHrItems.length > 0 && (
          <div className="pt-4">
            <div className="px-2 mb-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] opacity-50">HR & Admin</div>
            {filteredHrItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center space-x-3 p-2.5 rounded-xl transition-all",
                  isActive(item.href) 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
                    : "hover:bg-white/10 text-indigo-100"
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-transform", isActive(item.href) && "scale-110")} />
                <span className="text-sm font-bold">{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/10 bg-indigo-950/50 backdrop-blur-md">
        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-md">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate">{user?.name}</p>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest opacity-70">{role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 w-full rounded-xl text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-all font-bold uppercase tracking-widest text-[10px]"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen sticky top-0 border-r border-white/10 shadow-2xl z-[70]">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      <div className={cn(
        "fixed inset-0 z-[80] bg-indigo-950/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={onClose}>
        <div className={cn(
          "absolute inset-y-0 left-0 w-72 bg-indigo-950 shadow-2xl transition-transform duration-300 transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )} onClick={e => e.stopPropagation()}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
