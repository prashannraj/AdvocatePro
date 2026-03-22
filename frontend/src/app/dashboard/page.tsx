'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import PrintLayout from '@/components/PrintLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card';
import Badge from '@/components/Badge';
import StatsCard from '@/components/StatsCard';
import AlertBanner from '@/components/AlertBanner';
import MultiFloatingAction from '@/components/MultiFloatingAction';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Scale, 
  Gavel, 
  Banknote,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Bell,
  Activity,
  ArrowRight
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

  const fetchDashboardData = async (search = '') => {
    try {
      const response = await api.get(`/dashboard?search=${search}`);
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
    }
  };

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

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-16 w-16 bg-primary rounded-2xl p-3 mx-auto mb-4 shadow-xl shadow-primary/20 flex items-center justify-center animate-pulse">
            <img src="/logo without background.png" alt="Logo" className="h-full w-full object-contain brightness-0 invert" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Advocate Pro</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout 
      user={user} 
      title={`Namaste, ${user.name.split(' ')[0]}`}
      onSearch={(q) => fetchDashboardData(q)}
      onPrint={() => window.print()}
    >
      <PrintLayout title="Office Performance Overview">
        {/* Welcome Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Here's what's happening in your practice today.</p>
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current Session</p>
            <p className="text-sm font-black text-primary">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="mb-8">
          <AlertBanner 
            message="3 Renewals due this week. Review now to avoid penalties." 
            icon={Bell} 
            variant="warning" 
            onClick={() => router.push('/ipr')}
          />
        </div>

        {/* Stats Grid - 1-2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {stats.map((stat, idx) => {
            const Icon = getIcon(stat.icon);
            const variantList: any[] = ['primary', 'success', 'warning', 'purple', 'destructive', 'cyan', 'info', 'amber'];
            return (
              <StatsCard 
                key={stat.name} 
                name={stat.name} 
                value={stat.value} 
                icon={Icon} 
                variant={variantList[idx % variantList.length]}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Upcoming Hearings */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle icon={Gavel}>Upcoming Hearings</CardTitle>
              <Link href="/schedule" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">View All</Link>
            </CardHeader>
            <CardContent className="flex-1">
              {upcomingHearings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingHearings.map((hearing) => (
                    <div key={hearing.id} className="group p-3 bg-slate-50 hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10 transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 text-xs truncate flex-1 pr-2">{hearing.case_title}</h4>
                        <Badge variant="litigation" className="flex-shrink-0">Court</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-[10px] text-slate-400 font-medium">
                          <MapPin size={10} className="mr-1" />
                          <span className="truncate max-w-[120px]">{hearing.court}</span>
                        </div>
                        <span className="text-[10px] font-black text-primary bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm">
                          {new Date(hearing.hearing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Gavel className="h-8 w-8 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Hearings</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle icon={Calendar}>Today's Schedule</CardTitle>
              <Link href="/appointments" className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">Schedule</Link>
            </CardHeader>
            <CardContent className="flex-1">
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-all group">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                          <Clock size={14} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{app.client_name}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{app.time}</p>
                        </div>
                      </div>
                      <Badge variant={app.status === 'Confirmed' ? 'success' : 'warning'}>{app.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <Calendar className="h-8 w-8 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Free Day</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Filings */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle icon={FileText}>Recent Filings</CardTitle>
              <Link href="/documents" className="text-[10px] font-black text-rose-600 hover:underline uppercase tracking-widest">Vault</Link>
            </CardHeader>
            <CardContent className="flex-1">
              {recentDocuments.length > 0 ? (
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleDownload(doc)}
                      className="group flex items-center space-x-3 p-3 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="bg-white p-2 rounded-lg text-rose-500 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{doc.file_name}</h4>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">{doc.updated_at}</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-rose-400 transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <FileText className="h-8 w-8 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Documents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Corporate & IPR Highlights */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle icon={Briefcase}>Active Advisory Matters</CardTitle>
              <div className="flex space-x-4">
                <Link href="/corporate" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Corporate</Link>
                <Link href="/ipr" className="text-[10px] font-black text-purple-600 hover:underline uppercase tracking-widest">IPR</Link>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Grid / Mobile Horizontal Scroll */}
              <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 md:pb-0 no-scrollbar -mx-1 px-1">
                {corporateMatters.length > 0 ? corporateMatters.map((matter) => (
                  <div 
                    key={matter.id} 
                    className="flex-shrink-0 w-[280px] md:w-full p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-primary/10 transition-all cursor-pointer group shadow-sm"
                    onClick={() => router.push(matter.type === 'IPR' ? `/ipr` : `/corporate`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={matter.type.toLowerCase() === 'ipr' ? 'ipr' : 'corporate'}>
                        {matter.type}
                      </Badge>
                      {matter.is_overdue && <AlertCircle className="h-4 w-4 text-rose-500 animate-pulse" />}
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{matter.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">{matter.company_name}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-3 border-t border-slate-200/50">
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1.5" /> Deadline</span>
                      <span className={matter.is_overdue ? 'text-rose-600' : 'text-slate-600'}>{matter.deadline}</span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-10 flex flex-col items-center justify-center opacity-40 w-full">
                    <Activity className="h-8 w-8 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No Active Advisory Matters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </PrintLayout>
    </ResponsiveLayout>
  );
}
