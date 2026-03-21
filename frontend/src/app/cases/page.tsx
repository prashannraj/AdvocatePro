'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getNepaliDateNow } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import PrintLayout from '@/components/PrintLayout';
import NepaliDatePicker from '@/components/NepaliDatePicker';
import { 
  Briefcase, 
  Search,
  Plus,
  Loader2,
  Trash2,
  Edit,
  AlertTriangle,
  Scale,
  Printer
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, clientsRes, lawyersRes, courtsRes] = await Promise.all([
        api.get('/cases'),
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
    const currentYear = currentDate.split('-')[0].substring(1); // Extract year (e.g., 2081 -> 081)
    
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
      bs_year: item.bs_year || '080',
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
        // Use POST with _method=PUT for better compatibility with some servers
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
      alert('Failed to save case. Please check if case number is unique.');
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
      alert('Failed to delete case.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 print:hidden">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search cases..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Print List</span>
            </button>
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Case</span>
            </button>
          </div>
        </header>

        <main className="p-8">
          <PrintLayout title="Legal Case Inventory">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Case Management</h2>
                <p className="text-gray-500 text-sm">Manage and track all legal cases.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border print:border-gray-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Case Details</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Filed Date</th>
                    <th className="px-6 py-4 text-right print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cases.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                          {item.case_type_code && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100 uppercase tracking-tighter">
                              {item.case_type_code}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-600 font-bold mt-0.5 tracking-wider">#{item.case_number}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.client?.contact_person || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'Open' ? 'bg-green-100 text-green-700' : 
                          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.filed_date}</td>
                      <td className="px-6 py-4 text-right print:hidden">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenDeleteModal(item)}
                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PrintLayout>
        </main>
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCase ? 'Edit Legal Case' : 'Create New Legal Case'}
        loading={submitting}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-6 flex-1">
            {/* Identification Section */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Case Identification</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider">Manual Case ID</label>
                  <input
                    type="text"
                    placeholder="e.g. ०८१-WO-०००१"
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900 transition-all font-mono"
                    value={formData.case_number}
                    onChange={(e) => setFormData({...formData, case_number: e.target.value})}
                  />
                  <p className="mt-1 text-[9px] text-indigo-400 font-medium italic">Leave blank for automatic generation based on below fields.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider">Department</label>
                  <select
                    required
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900 transition-all"
                    value={formData.department}
                    onChange={(e) => {
                      const dept = e.target.value as any;
                      const firstType = CASE_TYPES.find(t => t.department === dept)?.code || 'WO';
                      setFormData({...formData, department: dept, case_type_code: firstType});
                    }}
                  >
                    <option value="Litigation">Litigation (मुद्दा मामला)</option>
                    <option value="Corporate">Corporate (कर्पोरेट)</option>
                    <option value="IPR">IPR (बौद्धिक सम्पत्ति)</option>
                    <option value="Other">Other (अन्य)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider">BS Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 081"
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900 transition-all font-mono"
                    value={formData.bs_year}
                    onChange={(e) => setFormData({...formData, bs_year: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider">Case Type</label>
                  <select
                    required
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-gray-900 transition-all"
                    value={formData.case_type_code}
                    onChange={(e) => setFormData({...formData, case_type_code: e.target.value})}
                  >
                    {CASE_TYPES.filter(t => t.department === formData.department).map(type => (
                      <option key={type.code} value={type.code}>{type.code} - {type.name}</option>
                    ))}
                  </select>
                </div>
                {!formData.case_number && (
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 text-[10px] text-indigo-500 bg-white/50 p-2 rounded-md border border-indigo-50/50">
                      <Scale className="h-3 w-3" />
                      <span className="italic font-medium">Automatic Case ID: <span className="font-bold">{formData.bs_year}-{formData.case_type_code}-XXXX</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* General Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Case Title / Parties</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe vs. State of Nepal"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Filed Date</label>
                <NepaliDatePicker
                  value={formData.filed_date}
                  onChange={(date) => {
                    const year = date.split('-')[0].substring(1); // Extract "81" from "2081" or just "81"
                    const yearShort = year.length > 2 ? year.substring(year.length - 2) : year;
                    setFormData({
                      ...formData, 
                      filed_date: date,
                      bs_year: formData.bs_year || yearShort
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Stakeholders Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Assignment Details</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Client Name</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  >
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.contact_person}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Assigned Lawyer</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
                      value={formData.lawyer_id}
                      onChange={(e) => setFormData({...formData, lawyer_id: e.target.value})}
                    >
                      <option value="">Select Lawyer...</option>
                      {lawyers.map(l => <option key={l.id} value={l.id}>{l.user?.name || 'Unknown'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Target Court (Optional)</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
                      value={formData.court_id}
                      onChange={(e) => setFormData({...formData, court_id: e.target.value})}
                    >
                      <option value="">Select Court...</option>
                      {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Case Description / Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all min-h-[100px]"
                placeholder="Enter detailed facts, legal grounds, and other relevant information..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-100 bg-white sticky bottom-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-bold uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-bold uppercase tracking-widest disabled:bg-indigo-400 shadow-md shadow-indigo-100"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <span>{editingCase ? 'Update Case Record' : 'Create Case Record'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Delete"
        loading={submitting}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete case <span className="font-bold text-gray-900">#{caseToDelete?.case_number}</span>?
          </p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-red-400"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
