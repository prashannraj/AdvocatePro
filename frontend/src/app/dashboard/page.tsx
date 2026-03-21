'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import PrintLayout from '@/components/PrintLayout';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut, 
  Search,
  Plus,
  Loader2,
  Clock,
  MapPin,
  UserCheck,
  DollarSign,
  Shield,
  Scale,
  Gavel,
  History,
  CreditCard,
  Banknote,
  Printer
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [corporateMatters, setCorporateMatters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userStr));
    fetchDashboardData();
  }, [router]);

  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    try {
      const response = await api.get(`/dashboard?search=${searchQuery}`);
      setStats(response.data.stats);
      setUpcomingHearings(response.data.upcomingHearings);
      setRecentDocuments(response.data.recentDocuments);
      setTodayAppointments(response.data.todayAppointments);
      setCorporateMatters(response.data.corporateMatters || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleDownload = async (doc: any) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. It might not exist on the server.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-20 w-20 bg-indigo-600 rounded-3xl p-4 mx-auto mb-6 shadow-xl shadow-indigo-100 flex items-center justify-center animate-pulse">
            <img 
              src="/logo without background.png" 
              alt="Logo" 
              className="h-full w-full object-contain filter brightness-0 invert" 
            />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">
            Advocate Pro
          </p>
        </div>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return Briefcase;
      case 'Users': return Users;
      case 'Calendar': return Calendar;
      case 'FileText': return FileText;
      case 'Clock': return Clock;
      case 'MapPin': return MapPin;
      case 'UserCheck': return UserCheck;
      case 'Banknote': return Banknote;
      default: return Briefcase;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-gray-100 print:hidden">
          <div className="relative w-96 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search cases, clients, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDashboardData()}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold uppercase tracking-widest"
            >
              <Printer className="h-4 w-4 text-indigo-600" />
              <span>Print Report</span>
            </button>
            <button 
              onClick={() => router.push('/cases')}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:shadow-indigo-200"
            >
              <Plus className="h-4 w-4" />
              <span>New Case</span>
            </button>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm uppercase shadow-md">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-8">
          <PrintLayout title="Office Performance Overview">
            <div className="mb-10 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back, {user.name}</h1>
                <p className="text-gray-500 font-medium mt-1">Here's a snapshot of your office activity today.</p>
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Current Session</p>
                <p className="text-sm font-black text-indigo-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, idx) => {
                const Icon = getIcon(stat.icon);
                const colors = [
                  'bg-blue-500 shadow-blue-100',
                  'bg-emerald-500 shadow-emerald-100',
                  'bg-orange-500 shadow-orange-100',
                  'bg-purple-500 shadow-purple-100',
                  'bg-rose-500 shadow-rose-100',
                  'bg-cyan-500 shadow-cyan-100',
                  'bg-indigo-500 shadow-indigo-100',
                  'bg-amber-500 shadow-amber-100'
                ];
                return (
                  <div key={stat.name} className="group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 overflow-hidden print:border print:border-gray-200">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${colors[idx % colors.length]} p-3 rounded-xl text-white shadow-lg print:hidden`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</span>
                      </div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.name}</h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity / Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Hearings */}
              <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all print:border print:border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm flex items-center">
                    <Gavel className="h-5 w-5 mr-2 text-indigo-600 print:hidden" />
                    Upcoming Hearings
                  </h3>
                  <Link href="/schedule" className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">View All</Link>
                </div>
                <div className="space-y-4">
                  {upcomingHearings.length > 0 ? upcomingHearings.map((hearing) => (
                    <div key={hearing.id} className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50/30 rounded-xl border border-transparent hover:border-indigo-100 transition-all">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-indigo-900 transition-colors">{hearing.case_title}</h4>
                        <div className="flex items-center mt-1 text-[10px] text-gray-500 font-medium">
                          <MapPin size={10} className="mr-1" />
                          <span className="truncate">{hearing.court}</span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                          <p className="text-[10px] font-black text-indigo-600">{new Date(hearing.hearing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Gavel className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No Hearings</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointments */}
              <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all print:border print:border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-emerald-600 print:hidden" />
                    Today's Schedule
                  </h3>
                  <Link href="/appointments" className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-widest">Schedule</Link>
                </div>
                <div className="space-y-4">
                  {todayAppointments.length > 0 ? todayAppointments.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50/30 rounded-xl border border-transparent hover:border-emerald-100 transition-all group">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                          <Clock size={14} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-900">{app.client_name}</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{app.time}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                        app.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Free Day</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Documents */}
              <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all print:border print:border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-rose-600 print:hidden" />
                    Recent Filings
                  </h3>
                  <Link href="/documents" className="text-[10px] font-bold text-rose-600 hover:underline uppercase tracking-widest">Vault</Link>
                </div>
                <div className="space-y-3">
                  {recentDocuments.length > 0 ? recentDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleDownload(doc)}
                      className="group flex items-center space-x-3 p-3 bg-gray-50 hover:bg-rose-50/30 rounded-xl border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                    >
                      <div className="bg-white p-2.5 rounded-lg text-rose-500 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-rose-900">{doc.file_name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{doc.updated_at}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No Documents</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Corporate Matters Section */}
            <div className="mt-8">
              <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all print:border print:border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-indigo-600 print:hidden" />
                    Corporate Matters & Transactions
                  </h3>
                  <Link href="/corporate" className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">Department</Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {corporateMatters.length > 0 ? corporateMatters.map((matter) => (
                    <div key={matter.id} className="bg-gray-50 p-4 rounded-xl border border-transparent hover:border-indigo-100 transition-all group cursor-pointer" onClick={() => router.push(`/corporate/${matter.company_id || ''}`)}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-gray-100 shadow-sm">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          matter.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {matter.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-indigo-900">{matter.title}</h4>
                      <p className="text-[10px] text-gray-500 font-medium mb-3">{matter.type} • {matter.company_name}</p>
                      
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Deadline</span>
                        <span className={matter.is_overdue ? 'text-rose-500' : ''}>{matter.deadline}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No Active Corporate Matters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PrintLayout>
        </main>
      </div>
    </div>
  );
}

const Building2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
