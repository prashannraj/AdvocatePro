'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface Company {
  id: number;
  company_name: string;
  registration_number: string;
  PAN: string;
  address: string;
  client?: { contact_person: string };
  compliance_tasks?: any[];
}

interface CorporateTransaction {
  id: number;
  case_id: number;
  type: string;
  amount: number;
  parties: string;
  status: string;
  case_record?: { title: string; case_number: string };
}

export default function CorporatePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<CorporateTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'transactions'>('companies');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, transRes] = await Promise.all([
        api.get('/companies'),
        api.get('/corporate-transactions')
      ]);
      setCompanies(compRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error('Failed to fetch corporate data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        <header className="bg-white border-b border-gray-100 p-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 mb-1">
                <Briefcase className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Corporate Department</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Corporate Matters</h1>
              <p className="text-gray-500 font-medium mt-1">Manage company registrations, transactions, and compliance.</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/cases')}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all uppercase tracking-widest flex items-center space-x-2"
              >
                <span>All Cases</span>
              </button>
              <button 
                onClick={() => router.push('/cases?department=Corporate')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Corporate Case</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-8 mt-8 border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('companies')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === 'companies' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Registered Companies
              {activeTab === 'companies' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === 'transactions' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Active Transactions
              {activeTab === 'transactions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
          </div>
        </header>

        <main className="p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeTab === 'companies' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <div key={company.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-black text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                    {company.company_name}
                  </h3>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">
                    Reg: {company.registration_number || 'Pending'}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-xs text-gray-500">
                      <FileText className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      <span className="font-bold">PAN:</span>
                      <span className="ml-1">{company.PAN || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                      <span className="font-bold">Compliance:</span>
                      <span className="ml-1 text-emerald-600">Up to date</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex -space-x-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-600 uppercase">JD</div>
                      <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-600 uppercase">AS</div>
                    </div>
                    <button 
                      onClick={() => router.push(`/corporate/${company.id}`)}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center"
                    >
                      View Details <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all min-h-[200px]">
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Add Company</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Transaction Type</th>
                    <th className="px-6 py-4">Linked Case</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((trans) => (
                    <tr key={trans.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mr-3">
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{trans.type}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Updated 2 days ago</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-indigo-600">{trans.case_record?.case_number}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{trans.case_record?.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-gray-900">
                          {trans.amount ? `Rs. ${new Intl.NumberFormat().format(trans.amount)}` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                          trans.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          trans.status === 'Processing' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {trans.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition-colors mr-2">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
