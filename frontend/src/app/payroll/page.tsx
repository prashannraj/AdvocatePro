'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getNepaliDateNow } from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FormField, { inputClasses, selectClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import NepaliDatePicker from '@/components/NepaliDatePicker';
import { 
  Plus,
  Loader2,
  Search,
  Trash2,
  Edit,
  CreditCard,
  Banknote,
  AlertTriangle,
  User as UserIcon,
  Calendar,
  ChevronRight,
  Info,
  DollarSign
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PayrollRecord {
  id: number;
  user_id: number;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_date: string;
  status: 'Paid' | 'Pending';
  user?: User;
}

export default function PayrollPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<PayrollRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    user_id: '',
    base_salary: '' as any,
    allowances: '' as any,
    deductions: '' as any,
    net_salary: 0,
    payment_date: '',
    status: 'Pending' as 'Paid' | 'Pending',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const loggedInUser = JSON.parse(userStr);
    if (loggedInUser.role?.slug !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setUser(loggedInUser);
    fetchData();
  }, [router]);

  // Calculate net salary whenever base, allowances or deductions change
  useEffect(() => {
    const net = Number(formData.base_salary) + Number(formData.allowances) - Number(formData.deductions);
    setFormData(prev => ({ ...prev, net_salary: net }));
  }, [formData.base_salary, formData.allowances, formData.deductions]);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const [payrollRes, usersRes] = await Promise.all([
        api.get(`/payroll?search=${search}`),
        api.get('/users')
      ]);
      setPayroll(Array.isArray(payrollRes.data) ? payrollRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setEditingRecord(null);
    const currentDate = await getNepaliDateNow();
    setFormData({
      user_id: '',
      base_salary: '',
      allowances: '',
      deductions: '',
      net_salary: 0,
      payment_date: currentDate,
      status: 'Pending',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: PayrollRecord) => {
    setEditingRecord(record);
    setFormData({
      user_id: record.user_id.toString(),
      base_salary: record.base_salary,
      allowances: record.allowances,
      deductions: record.deductions,
      net_salary: record.net_salary,
      payment_date: record.payment_date,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (record: PayrollRecord) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRecord) {
        await api.put(`/payroll/${editingRecord.id}`, formData);
      } else {
        await api.post('/payroll', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving payroll:', error);
      alert('Failed to save payroll record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/payroll/${recordToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting payroll:', error);
      alert('Failed to delete payroll record.');
    } finally {
      setSubmitting(false);
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
      title="Firm Payroll"
      onSearch={(q) => fetchData(q)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Payroll</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage salaries, allowances, and payment status.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Plus}
          className="sm:w-auto w-full"
        >
          Generate Payroll
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Net Salary</th>
              <th className="px-6 py-4">Payment Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payroll.length > 0 ? (
              payroll.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm uppercase group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {(item.user?.name || 'E').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.user?.name || 'Unknown Employee'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base: Rs. {item.base_salary}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900 text-sm">Rs. {item.net_salary}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{item.payment_date}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status === 'Paid' ? 'success' : 'warning'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEditModal(item)}
                        className="text-slate-400 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenDeleteModal(item)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center opacity-40">
                  <Banknote className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-black uppercase tracking-[0.2em] text-xs">No payroll records found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRecord ? 'Edit Payroll Record' : 'Generate New Payroll'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Employee Selection" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Select Employee" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  >
                    <option value="">Select an employee...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Salary Breakdown" icon={DollarSign}>
            <FormField label="Base Salary (Rs.)" required>
              <input
                type="number"
                required
                className={inputClasses}
                value={formData.base_salary}
                onChange={(e) => setFormData({...formData, base_salary: e.target.value})}
              />
            </FormField>

            <FormField label="Allowances (Rs.)">
              <input
                type="number"
                className={inputClasses}
                value={formData.allowances}
                onChange={(e) => setFormData({...formData, allowances: e.target.value})}
              />
            </FormField>

            <FormField label="Deductions (Rs.)">
              <input
                type="number"
                className={inputClasses}
                value={formData.deductions}
                onChange={(e) => setFormData({...formData, deductions: e.target.value})}
              />
            </FormField>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Calculated Net Salary</p>
              <p className="text-xl font-black text-primary">Rs. {formData.net_salary}</p>
            </div>
          </FormSection>

          <FormSection title="Payment Details" icon={Calendar}>
            <FormField label="Payment Date" required>
              <NepaliDatePicker
                value={formData.payment_date}
                onChange={(date) => setFormData({...formData, payment_date: date})}
              />
            </FormField>

            <FormField label="Payment Status" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>
          </FormSection>

          {/* Action Buttons */}
          <div className="fixed sm:static bottom-0 left-0 right-0 p-4 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex space-x-3 z-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              className="flex-[2] h-12"
            >
              {editingRecord ? 'Update Record' : 'Generate Payroll'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Removal"
        loading={submitting}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 mb-6 shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Remove Payroll Record?</h4>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            Are you sure you want to delete the payroll record for <span className="font-black text-slate-900">{recordToDelete?.user?.name}</span>?
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={submitting}
              className="flex-1 h-12"
            >
              Yes, Remove
            </Button>
          </div>
        </div>
      </Modal>
    </ResponsiveLayout>
  );
}
