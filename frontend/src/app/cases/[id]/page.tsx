'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import PrintLayout from '@/components/PrintLayout';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  Scale, 
  ArrowLeft, 
  Printer, 
  FileText, 
  Plus, 
  Upload,
  Download,
  Trash2,
  Edit,
  File,
  X,
  Loader2,
  Gavel,
  Clock,
  Building2,
  Shield,
  Info
} from 'lucide-react';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card';
import Button from '@/components/Button';

interface Hearing {
  id: number;
  hearing_date: string;
  judge_name: string;
  status: string;
  description: string;
}

interface Case {
  id: number;
  case_number: string;
  bs_year: string;
  case_type_code: string;
  title: string;
  department: string;
  description: string;
  status: string;
  filed_date: string;
  client?: { contact_person: string; phone: string; address: string };
  lawyer?: { user?: { name: string; email: string } };
  court?: { name: string; location: string };
  hearings?: Hearing[];
  documents?: any[];
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userStr));
    fetchCaseDetails();
  }, [id, router]);

  const fetchCaseDetails = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      setCaseData(response.data);
    } catch (error) {
      console.error('Error fetching case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeptIcon = (dept: string) => {
    switch (dept) {
      case 'Litigation': return Gavel;
      case 'Corporate': return Building2;
      case 'IPR': return Shield;
      default: return Briefcase;
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <ResponsiveLayout user={user} title="Case Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <Info className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Case file not found</h2>
          <p className="text-slate-500 mb-8">The case you are looking for might have been deleted or moved.</p>
          <Button onClick={() => router.push('/cases')}>Back to Inventory</Button>
        </div>
      </ResponsiveLayout>
    );
  }

  const DeptIcon = getDeptIcon(caseData.department);

  return (
    <ResponsiveLayout user={user} title={`Case Details: ${caseData.case_number}`}>
      <PrintLayout title={`Legal Case File: ${caseData.case_number}`}>
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0 print:hidden">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-slate-500 hover:text-primary transition-colors text-sm font-bold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="text-[10px] font-black uppercase tracking-widest">
              <Printer className="h-4 w-4 mr-2" />
              Print File
            </Button>
            <Button variant="primary" size="sm" className="text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              <Edit className="h-4 w-4 mr-2" />
              Edit Case
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Case Overview */}
            <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50">
              <div className="h-2 bg-primary w-full" />
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                      <DeptIcon size={28} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{caseData.department}</span>
                        <Badge variant={caseData.status === 'Open' ? 'success' : caseData.status === 'Pending' ? 'warning' : 'default'}>
                          {caseData.status}
                        </Badge>
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{caseData.title}</h1>
                      <p className="text-sm font-mono font-bold text-slate-400 mt-1">Ref: {caseData.case_number}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Filed Date</p>
                    <p className="text-sm font-bold text-slate-900">{caseData.filed_date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Case Type</p>
                    <p className="text-sm font-bold text-slate-900">{caseData.case_type_code}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Year (BS)</p>
                    <p className="text-sm font-bold text-slate-900">{caseData.bs_year}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Court</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{caseData.court?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-2 text-primary" />
                    Matter Description
                  </h3>
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {caseData.description || 'No detailed description provided for this matter.'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hearings History */}
            <Card>
              <CardHeader>
                <CardTitle icon={Gavel}>Hearing Schedule & History</CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.hearings && caseData.hearings.length > 0 ? (
                  <div className="space-y-4">
                    {caseData.hearings.map((hearing, idx) => (
                      <div key={hearing.id} className="flex items-start space-x-4 p-4 rounded-xl border border-slate-50 hover:border-primary/20 transition-all bg-white group">
                        <div className="h-10 w-10 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          <span className="text-[10px] font-black leading-none">{idx + 1}</span>
                          <Clock size={12} className="mt-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-slate-900 text-sm">{hearing.hearing_date}</p>
                            <Badge variant={hearing.status === 'Scheduled' ? 'info' : 'success'}>{hearing.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">Judge: {hearing.judge_name || 'TBD'}</p>
                          {hearing.description && (
                            <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">"{hearing.description}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center opacity-40">
                    <Calendar className="h-10 w-10 mx-auto mb-3" />
                    <p className="font-black uppercase tracking-widest text-[10px]">No hearings recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Client Info */}
            <Card className="bg-indigo-900 text-white border-none shadow-xl shadow-indigo-200/50">
              <CardHeader className="border-white/10">
                <CardTitle icon={UserIcon} className="text-white">Client Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-xl uppercase">
                    {caseData.client?.contact_person.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight">{caseData.client?.contact_person}</h3>
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Primary Contact</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-indigo-100/70">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="text-xs font-medium truncate">{caseData.client?.address}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-indigo-100/70">
                    <Clock size={14} className="flex-shrink-0" />
                    <span className="text-xs font-medium">{caseData.client?.phone}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-8 bg-white/5 border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest h-10"
                  onClick={() => router.push(`/clients`)}
                >
                  Client File
                </Button>
              </CardContent>
            </Card>

            {/* Lawyer Info */}
            <Card>
              <CardHeader>
                <CardTitle icon={Scale}>Legal Counsel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm uppercase">
                    {caseData.lawyer?.user?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">Adv. {caseData.lawyer?.user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{caseData.lawyer?.user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Scale size={100} />
              </div>
              <CardContent className="p-8 relative z-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Case Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-black text-white">{caseData.hearings?.length || 0}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Hearings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{caseData.documents?.length || 0}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Vault Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PrintLayout>
    </ResponsiveLayout>
  );
}
