'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
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
  Calendar
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payrollRes, usersRes] = await Promise.all([
        api.get('/payroll'),
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

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setFormData({
      user_id: '',
      base_salary: '',
      allowances: '',
      deductions: '',
      net_salary: 0,
      payment_date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: PayrollRecord) => {
    setEditingRecord(record);
    setFormData({
      user_id: record.user_id.toString(),
      base_salary: record.base_salary.toString(),
      allowances: record.allowances.toString(),
      deductions: record.deductions.toString(),
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
      const payload = {
        ...formData,
        base_salary: parseFloat(formData.base_salary) || 0,
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
      };

      if (editingRecord) {
        await api.put(`/payroll/${editingRecord.id}`, payload);
      } else {
        await api.post('/payroll', payload);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search payroll..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Process Payroll</span>
          </button>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Payroll Management</h2>
            <p className="text-gray-500 text-sm">Manage staff salaries, allowances, and payments.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Payment Date</th>
                  <th className="px-6 py-4">Net Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payroll.length > 0 ? (
                  payroll.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                            {(item.user?.name || 'E').charAt(0)}
                          </div>
                          <p className="font-bold text-gray-900 text-sm">{item.user?.name || 'Unknown Employee'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.payment_date}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">NPR {item.net_salary.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRecord ? 'Edit Payroll Record' : 'Process New Payroll'}
        loading={submitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.user_id}
                onChange={(e) => setFormData({...formData, user_id: e.target.value})}
              >
                <option value="">Select an employee...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={formData.base_salary}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Remove leading zeros if there are other digits
                    const sanitized = val.length > 1 && val.startsWith('0') ? val.replace(/^0+/, '') : val;
                    setFormData({...formData, base_salary: sanitized});
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <div className="relative">
                <NepaliDatePicker
                  value={formData.payment_date}
                  onChange={(date) => setFormData({...formData, payment_date: date})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.allowances}
                onChange={(e) => {
                  const val = e.target.value;
                  const sanitized = val.length > 1 && val.startsWith('0') ? val.replace(/^0+/, '') : val;
                  setFormData({...formData, allowances: sanitized});
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.deductions}
                onChange={(e) => {
                  const val = e.target.value;
                  const sanitized = val.length > 1 && val.startsWith('0') ? val.replace(/^0+/, '') : val;
                  setFormData({...formData, deductions: sanitized});
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Net Salary</p>
              <p className="text-2xl font-bold text-indigo-700">NPR {formData.net_salary.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Status</label>
              <select
                className={`px-3 py-1 border rounded-md text-sm font-bold uppercase ${
                  formData.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'Paid' | 'Pending'})}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm disabled:bg-indigo-400"
            >
              {editingRecord ? 'Update Record' : 'Save Record'}
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
            Are you sure you want to delete the payroll record for <span className="font-bold text-gray-900">{recordToDelete?.user?.name}</span>?
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
