'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Gavel, 
  Clock, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Contact,
  CreditCard,
  UserCheck,
  History,
  Scale,
  Shield,
  Lock
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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

  const role = user?.role?.slug || 'staff'; // Default to staff if no role

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Cases', href: '/cases', icon: Gavel, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Corporate', href: '/corporate', icon: Briefcase, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Clients', href: '/clients', icon: Users, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Hearings', href: '/schedule', icon: Calendar, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Appointments', href: '/appointments', icon: Clock, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Documents', href: '/documents', icon: FileText, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Contracts', href: '/contracts', icon: Shield, roles: ['admin', 'lawyer', 'staff'] },
    { name: 'Courts', href: '/courts', icon: Gavel, roles: ['admin', 'lawyer'] },
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

  return (
    <div className="w-64 bg-indigo-900 text-white flex-shrink-0 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-indigo-800 flex items-center space-x-3">
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
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => (
          <Link 
            key={item.name}
            href={item.href} 
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              isActive(item.href) ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800 text-indigo-100'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}
        
        {filteredHrItems.length > 0 && (
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-indigo-400 uppercase tracking-wider">HR & Finance</p>
          </div>
        )}
        {filteredHrItems.map((item) => (
          <Link 
            key={item.name}
            href={item.href} 
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              isActive(item.href) ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800 text-indigo-100'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}

        <div className="pt-4 border-t border-indigo-800 mt-4">
          {role === 'admin' && (
            <>
              <Link 
                href="/permissions" 
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  isActive('/permissions') ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800 text-indigo-100'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span className="text-sm">Permissions</span>
              </Link>
              <Link 
                href="/logs" 
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  isActive('/logs') ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800 text-indigo-100'
                }`}
              >
                <History className="h-4 w-4" />
                <span className="text-sm">Activity Logs</span>
              </Link>
              <Link 
                href="/settings" 
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  isActive('/settings') ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800 text-indigo-100'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Company Settings</span>
              </Link>
            </>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-indigo-800 text-indigo-100 transition-colors mt-1 text-left"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>

        <div className="mt-auto pt-6 pb-2 text-center">
          <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-widest">Developed By</p>
          <p className="text-xs text-white font-bold">Appan Technology Pvt. Ltd</p>
        </div>
      </nav>
    </div>
  );
}
