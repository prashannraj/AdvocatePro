'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card';
import Badge from '@/components/Badge';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import FormField, { inputClasses, selectClasses, textareaClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import { 
  Briefcase, 
  Plus, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Trash2,
  Edit2,
  DollarSign,
  ChevronRight,
  LayoutGrid,
  List,
  Info,
  Banknote,
  Users
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
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<CorporateTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'transactions'>('companies');
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  
  // Modal states
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    registration_number: '',
    PAN: '',
    address: '',
    client_id: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    case_id: '',
    type: 'Registration',
    amount: '',
    parties: '',
    status: 'Processing',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    fetchData();
    fetchSupportData();
  }, []);

  const fetchData = async (search = '') => {
    try {
      setLoading(true);
      const [compRes, transRes] = await Promise.all([
        api.get(`/companies?search=${search}`),
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

  const fetchSupportData = async () => {
    try {
      const [clientsRes, casesRes] = await Promise.all([
        api.get('/clients'),
        api.get('/cases')
      ]);
      setClients(clientsRes.data);
      setCases(casesRes.data);
    } catch (error) {
      console.error('Failed to fetch support data:', error);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/companies', companyForm);
      setIsCompanyModalOpen(false);
      fetchData();
      setCompanyForm({ company_name: '', registration_number: '', PAN: '', address: '', client_id: '' });
    } catch (error) {
      console.error('Failed to save company:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/corporate-transactions', transactionForm);
      setIsTransactionModalOpen(false);
      fetchData();
      setTransactionForm({ case_id: '', type: 'Registration', amount: '', parties: '', status: 'Processing' });
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveLayout 
      user={user} 
      title="Corporate Department"
      onSearch={(q) => fetchData(q)}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Corporate Matters</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage company registrations and active transactions.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={activeTab === 'companies' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('companies')}
            icon={LayoutGrid}
          >
            Companies
          </Button>
          <Button 
            variant={activeTab === 'transactions' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('transactions')}
            icon={List}
          >
            Transactions
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : activeTab === 'companies' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="group overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors">
                {company.company_name}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
                Reg: {company.registration_number || 'Pending'}
              </p>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">PAN Number</span>
                  <span className="text-slate-900">{company.PAN || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">Compliance</span>
                  <Badge variant="success">Up to date</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-indigo-600 uppercase">JD</div>
                  <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-600 uppercase">AS</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary h-8"
                  onClick={() => router.push(`/corporate/${company.id}`)}
                >
                  View Details <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
          
          <button 
            onClick={() => setIsCompanyModalOpen(true)}
            className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary/30 hover:text-primary transition-all min-h-[240px] group"
          >
            <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add New Company</span>
          </button>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden border-slate-100">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <CardTitle icon={Banknote}>Active Transactions</CardTitle>
            <Button 
              size="sm" 
              icon={Plus} 
              className="h-8 text-[9px]"
              onClick={() => setIsTransactionModalOpen(true)}
            >
              New Transaction
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Linked Case</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((trans) => (
                  <tr key={trans.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mr-3">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{trans.type}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Updated recently</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-primary uppercase tracking-tighter">{trans.case_record?.case_number}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px] font-medium">{trans.case_record?.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">
                        {trans.amount ? `Rs. ${new Intl.NumberFormat().format(trans.amount)}` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        trans.status === 'Completed' ? 'success' :
                        trans.status === 'Processing' ? 'info' : 'warning'
                      }>
                        {trans.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* New Company Modal */}
      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        title="Register New Company"
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleCompanySubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Company Identity" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Company Name" required>
                <input
                  type="text"
                  required
                  className={inputClasses}
                  value={companyForm.company_name}
                  onChange={(e) => setCompanyForm({...companyForm, company_name: e.target.value})}
                />
              </FormField>
            </div>
            
            <FormField label="Registration Number">
              <input
                type="text"
                className={inputClasses}
                value={companyForm.registration_number}
                onChange={(e) => setCompanyForm({...companyForm, registration_number: e.target.value})}
              />
            </FormField>

            <FormField label="PAN Number">
              <input
                type="text"
                className={inputClasses}
                value={companyForm.PAN}
                onChange={(e) => setCompanyForm({...companyForm, PAN: e.target.value})}
              />
            </FormField>
          </FormSection>

          <FormSection title="Ownership & Location" icon={Users}>
            <div className="sm:col-span-2">
              <FormField label="Primary Shareholder / Client" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={companyForm.client_id}
                    onChange={(e) => setCompanyForm({...companyForm, client_id: e.target.value})}
                  >
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.contact_person}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Registered Address" required>
                <textarea
                  required
                  rows={3}
                  className={textareaClasses}
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          <div className="fixed sm:static bottom-0 left-0 right-0 p-4 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex space-x-3 z-50">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setIsCompanyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="flex-[2] h-12">
              Register Company
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Transaction Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="Log Corporate Transaction"
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleTransactionSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Transaction Details" icon={Banknote}>
            <div className="sm:col-span-2">
              <FormField label="Linked Case File" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={transactionForm.case_id}
                    onChange={(e) => setTransactionForm({...transactionForm, case_id: e.target.value})}
                  >
                    <option value="">Select Case...</option>
                    {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>

            <FormField label="Transaction Type" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                >
                  <option value="Registration">Registration</option>
                  <option value="FDI">FDI (Foreign Investment)</option>
                  <option value="M&A">M&A (Merger/Acquisition)</option>
                  <option value="Compliance">Annual Compliance</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>

            <FormField label="Amount (NPR)">
              <input
                type="number"
                className={inputClasses}
                placeholder="0.00"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Involved Parties" required>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Buyer Name, Seller Name"
                  className={textareaClasses}
                  value={transactionForm.parties}
                  onChange={(e) => setTransactionForm({...transactionForm, parties: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          <div className="fixed sm:static bottom-0 left-0 right-0 p-4 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex space-x-3 z-50">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setIsTransactionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="flex-[2] h-12">
              Log Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mobile FAB */}
      <button 
        onClick={() => activeTab === 'companies' ? setIsCompanyModalOpen(true) : setIsTransactionModalOpen(true)}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus className="h-7 w-7" />
      </button>
    </ResponsiveLayout>
  );
}
