'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getNepaliDateNow } from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Modal from '@/components/Modal';
import PrintLayout from '@/components/PrintLayout';
import NepaliDatePicker from '@/components/NepaliDatePicker';
import CaseCard from '@/components/CaseCard';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { cn } from '@/lib/utils';
import FormField, { inputClasses, selectClasses, textareaClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import { 
  Search,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Scale,
  Filter,
  ChevronRight,
  Gavel,
  Briefcase,
  User,
  Calendar,
  Building2,
  FileText
} from 'lucide-react';

interface Case {
  id: number;
  case_number: string;
  bs_year: string;
  case_type_code: string;
  sequential_number: number;
  title: string;
  department: 'Litigation' | 'Corporate' | 'IPR' | 'Other';
  description: string;
  client_id: number;
  lawyer_id: number;
  court_id: number | null;
  status: 'Open' | 'Pending' | 'Closed';
  filed_date: string;
  client?: { contact_person: string };
  lawyer?: { user?: { name: string } };
  court?: { name: string };
}

const CASE_TYPES = [
  // Litigation
  { code: 'WO', name: 'Writ Order (रिट निवेदन)', department: 'Litigation' },
  { code: 'WC', name: 'Writ Certiorari (प्रमाणीकरण रिट)', department: 'Litigation' },
  { code: 'WH', name: 'Writ Habeas Corpus (बन्दीप्रत्यक्षीकरण रिट)', department: 'Litigation' },
  { code: 'AP', name: 'Appeal (पुनरावेदन)', department: 'Litigation' },
  { code: 'RV', name: 'Review (पुनरावलोकन)', department: 'Litigation' },
  { code: 'CR', name: 'Criminal (फौजदारी)', department: 'Litigation' },
  { code: 'CI', name: 'Civil (देवानी)', department: 'Litigation' },
  { code: 'MS', name: 'Miscellaneous (विविध)', department: 'Litigation' },
  // Corporate
  { code: 'CM', name: 'Corporate Matter (कर्पोरेट मामला)', department: 'Corporate' },
  { code: 'FD', name: 'Foreign Direct Investment (FDI)', department: 'Corporate' },
  { code: 'MA', name: 'Merger & Acquisition (M&A)', department: 'Corporate' },
  { code: 'JV', name: 'Joint Venture (JV)', department: 'Corporate' },
  { code: 'CRG', name: 'Company Registration', department: 'Corporate' },
  { code: 'CD', name: 'Contract Drafting', department: 'Corporate' },
  // IPR
  { code: 'TM', name: 'Trademark Registration (ट्रेडमार्क दर्ता)', department: 'IPR' },
  { code: 'PT', name: 'Patent Application (पेटेन्ट)', department: 'IPR' },
  { code: 'CR', name: 'Copyright Registration (प्रतिलिपि अधिकार)', department: 'IPR' },
  { code: 'DS', name: 'Design Registration (डिजाइन)', department: 'IPR' },
  { code: 'IN', name: 'IP Infringement / Opposition (उजुरी / विरोध)', department: 'IPR' },
];

export default function CasesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [filterDepartment, setFilterDepartment] = useState<string>('All');

  // Form states
  const [formData, setFormData] = useState({
    case_number: '',
    bs_year: '081',
    case_type_code: 'WO',
    title: '',
    department: 'Litigation' as 'Litigation' | 'Corporate' | 'IPR' | 'Other',
    description: '',
    client_id: '',
    lawyer_id: '',
    court_id: '',
    status: 'Open' as 'Open' | 'Pending' | 'Closed',
    filed_date: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userStr));
    fetchData();
  }, [router]);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const [casesRes, clientsRes, lawyersRes, courtsRes] = await Promise.all([
        api.get(`/cases?search=${search}`),
        api.get('/clients'),
        api.get('/lawyers'),
        api.get('/courts')
      ]);
      setCases(casesRes.data);
      setClients(clientsRes.data);
      setLawyers(lawyersRes.data);
      setCourts(courtsRes.data);
    } catch (error) {
      console.error('Error fetching cases data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setEditingCase(null);
    const currentDate = await getNepaliDateNow();
    const currentYear = currentDate.split('-')[0].substring(1);
    
    setFormData({
      case_number: '',
      bs_year: currentYear,
      case_type_code: 'WO',
      title: '',
      department: 'Litigation',
      description: '',
      client_id: '',
      lawyer_id: '',
      court_id: '',
      status: 'Open',
      filed_date: currentDate,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Case) => {
    setEditingCase(item);
    setFormData({
      case_number: item.case_number || '',
      bs_year: item.bs_year || '081',
      case_type_code: item.case_type_code || 'WO',
      title: item.title,
      department: item.department || 'Litigation',
      description: item.description || '',
      client_id: item.client_id.toString(),
      lawyer_id: item.lawyer_id.toString(),
      court_id: item.court_id?.toString() || '',
      status: item.status,
      filed_date: item.filed_date,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: Case) => {
    setCaseToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCase) {
        await api.post(`/cases/${editingCase.id}`, {
          ...formData,
          _method: 'PUT'
        });
      } else {
        await api.post('/cases', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving case:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!caseToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/cases/${caseToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting case:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCases = filterDepartment === 'All' 
    ? cases 
    : cases.filter(c => c.department === filterDepartment);

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
      title="Case Inventory"
      onSearch={(q) => fetchData(q)}
      onPrint={() => window.print()}
    >
      <PrintLayout title="Legal Case Inventory">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Case Management</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage and track all legal matters across departments.</p>
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {['All', 'Litigation', 'Corporate', 'IPR'].map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDepartment(dept)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterDepartment === dept 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border print:border-slate-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Case Details</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Filed Date</th>
                <th className="px-6 py-4 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCases.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Gavel className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{item.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{item.case_number}</span>
                          <Badge variant={item.department.toLowerCase() as any}>{item.case_type_code}</Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {item.client?.contact_person || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status === 'Open' ? 'success' : item.status === 'Pending' ? 'warning' : 'default'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{item.filed_date}</td>
                  <td className="px-6 py-4 text-right print:hidden">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(item)} className="text-slate-400 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteModal(item)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCases.length === 0 && (
            <div className="py-20 text-center opacity-40">
              <Gavel className="h-12 w-12 mx-auto mb-4" />
              <p className="font-black uppercase tracking-[0.2em] text-xs">No cases found in this department</p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredCases.map((item) => (
            <CaseCard
              key={item.id}
              case_number={item.case_number}
              title={item.title}
              client_name={item.client?.contact_person || 'N/A'}
              status={item.status}
              filed_date={item.filed_date}
              department={item.department}
              court_name={item.court?.name}
              onClick={() => handleOpenEditModal(item)}
            />
          ))}
          {filteredCases.length === 0 && (
            <div className="py-20 text-center opacity-40 bg-white rounded-2xl border border-dashed border-slate-200">
              <Gavel className="h-10 w-10 mx-auto mb-3" />
              <p className="font-black uppercase tracking-widest text-[10px]">No cases found</p>
            </div>
          )}
        </div>

        {/* FAB for Mobile */}
        <button 
          onClick={handleOpenCreateModal}
          className="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-40 active:scale-90 transition-transform"
        >
          <Plus className="h-7 w-7" />
        </button>
      </PrintLayout>

      {/* Modal - Full screen on mobile */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCase ? 'Edit Legal Case' : 'New Legal Case'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Case Identification" icon={Scale}>
            <div className="sm:col-span-2">
              <FormField label="Department" required>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Litigation', 'Corporate', 'IPR', 'Other'].map(dept => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        const firstType = CASE_TYPES.find(t => t.department === dept)?.code || 'WO';
                        setFormData({...formData, department: dept as any, case_type_code: firstType});
                      }}
                      className={cn(
                        "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        formData.department === dept 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
                          : "bg-white text-slate-500 border-slate-200 hover:border-primary/30"
                      )}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <FormField label="BS Year" required>
              <input
                type="text"
                required
                className={inputClasses}
                value={formData.bs_year}
                onChange={(e) => setFormData({...formData, bs_year: e.target.value})}
              />
            </FormField>

            <FormField label="Case Type" required>
              <div className="relative">
                <select
                  required
                  className={selectClasses}
                  value={formData.case_type_code}
                  onChange={(e) => setFormData({...formData, case_type_code: e.target.value})}
                >
                  {CASE_TYPES.filter(t => t.department === formData.department).map(type => (
                    <option key={type.code} value={type.code}>{type.code} - {type.name}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Manual Case ID (Optional)">
                <input
                  type="text"
                  placeholder="०८१-WO-०००१"
                  className={cn(inputClasses, "font-mono")}
                  value={formData.case_number}
                  onChange={(e) => setFormData({...formData, case_number: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Matter Details" icon={Briefcase}>
            <div className="sm:col-span-2">
              <FormField label="Case Title / Parties" required>
                <input
                  type="text"
                  required
                  className={inputClasses}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </FormField>
            </div>

            <FormField label="Filed Date" required>
              <NepaliDatePicker
                value={formData.filed_date}
                onChange={(date) => setFormData({...formData, filed_date: date})}
              />
            </FormField>

            <FormField label="Status" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>
          </FormSection>

          <FormSection title="Assignment" icon={User}>
            <div className="sm:col-span-2">
              <FormField label="Client Name" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  >
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.contact_person}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>

            <FormField label="Assigned Lawyer" required>
              <div className="relative">
                <select
                  required
                  className={selectClasses}
                  value={formData.lawyer_id}
                  onChange={(e) => setFormData({...formData, lawyer_id: e.target.value})}
                >
                  <option value="">Select Lawyer...</option>
                  {lawyers.map(l => <option key={l.id} value={l.id}>{l.user?.name || 'Unknown'}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>

            <FormField label="Court (Optional)">
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.court_id}
                  onChange={(e) => setFormData({...formData, court_id: e.target.value})}
                >
                  <option value="">Select Court...</option>
                  {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>
          </FormSection>

          <FormSection title="Additional Information" icon={FileText}>
            <div className="sm:col-span-2">
              <FormField label="Description">
                <textarea
                  className={cn(textareaClasses, "min-h-[120px]")}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Action Buttons - Fixed at bottom on mobile */}
          <div className="fixed sm:static bottom-0 left-0 right-0 p-4 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex space-x-3 z-50">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-12" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={submitting} 
              className="flex-[2] h-12"
            >
              {editingCase ? 'Update Case' : 'Create Case'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Delete"
      >
        <div className="text-center p-2">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-rose-50 mb-4">
            <AlertTriangle className="h-7 w-7 text-rose-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Are you sure?</h3>
          <p className="text-sm text-slate-500 font-medium mb-8">
            This will permanently delete case <span className="text-slate-900 font-black">#{caseToDelete?.case_number}</span>. This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" loading={submitting} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </ResponsiveLayout>
  );
}
