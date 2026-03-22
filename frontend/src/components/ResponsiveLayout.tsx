'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import MultiFloatingAction from './MultiFloatingAction';
import { Search, Printer, Plus, Menu, ChevronDown, Building2, Gavel, Shield } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  user: any;
  onPrint?: () => void;
  onSearch?: (query: string) => void;
  title?: string;
  showActions?: boolean;
}

export default function ResponsiveLayout({ 
  children, 
  user, 
  onPrint, 
  onSearch, 
  title = "Advocate Pro",
  showActions = true
}: ResponsiveLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const departments = [
    { name: 'Litigation', icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50', href: '/cases' },
    { name: 'Corporate', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/corporate' },
    { name: 'IPR', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50', href: '/ipr' },
  ];

  const currentDept = departments.find(d => pathname.startsWith(d.href)) || departments[0];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-8 border-b border-border print:hidden">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Department Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all group"
              >
                <div className={cn("p-1.5 rounded-lg", currentDept.bg, currentDept.color)}>
                  <currentDept.icon className="h-4 w-4" />
                </div>
                <span className="hidden sm:block text-xs font-black text-slate-900 uppercase tracking-widest">{currentDept.name}</span>
                <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isDeptMenuOpen && "rotate-180")} />
              </button>

              {isDeptMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDeptMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 mb-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">Switch Department</div>
                    {departments.map((dept) => (
                      <button
                        key={dept.name}
                        onClick={() => {
                          router.push(dept.href);
                          setIsDeptMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-left",
                          pathname.startsWith(dept.href) ? "bg-slate-50" : "hover:bg-slate-50/50"
                        )}
                      >
                        <div className={cn("p-1.5 rounded-lg", dept.bg, dept.color)}>
                          <dept.icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{dept.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <h2 className="hidden lg:block text-lg font-black text-slate-900 tracking-tight truncate ml-4">
              {title}
            </h2>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
              />
            </form>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {showActions && (
              <>
                <button 
                  onClick={onPrint}
                  className="p-2 sm:px-4 sm:py-2 flex items-center space-x-2 bg-white text-slate-700 border border-border rounded-xl hover:bg-slate-50 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  <Printer className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button 
                  onClick={() => router.push('/cases')}
                  className="p-2 sm:px-5 sm:py-2.5 flex items-center space-x-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Case</span>
                </button>
              </>
            )}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-md flex-shrink-0">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileNav onOpenMenu={() => setIsSidebarOpen(true)} />
        
        {/* Multi-Action FAB for Mobile */}
        <MultiFloatingAction />
      </div>
    </div>
  );
}
