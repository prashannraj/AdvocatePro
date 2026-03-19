'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { 
  Plus,
  Loader2,
  Search,
  Trash2,
  Edit,
  Briefcase,
  Award,
  AlertTriangle,
  User as UserIcon
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Lawyer {
  id: number;
  user_id: number;
  specialization: string;
  experience_years: number;
  availability_status: 'available' | 'busy' | 'on_leave';
  user?: User;
}

export default function LawyersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
  const [lawyerToDelete, setLawyerToDelete] = useState<Lawyer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    user_id: '',
    specialization: '',
    experience_years: 0,
    availability_status: 'available' as 'available' | 'busy' | 'on_leave',
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
    fetchLawyers();
    fetchUsers();
  }, [router]);

  const fetchLawyers = async () => {
    try {
      const response = await api.get('/lawyers');
      setLawyers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingLawyer(null);
    setFormData({
      user_id: '',
      specialization: '',
      experience_years: 0,
      availability_status: 'available',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lawyer: Lawyer) => {
    setEditingLawyer(lawyer);
    setFormData({
      user_id: lawyer.user_id.toString(),
      specialization: lawyer.specialization,
      experience_years: lawyer.experience_years,
      availability_status: lawyer.availability_status,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (lawyer: Lawyer) => {
    setLawyerToDelete(lawyer);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingLawyer) {
        await api.put(`/lawyers/${editingLawyer.id}`, formData);
      } else {
        await api.post('/lawyers', formData);
      }
      setIsModalOpen(false);
      fetchLawyers();
    } catch (error) {
      console.error('Error saving lawyer:', error);
      alert('Failed to save lawyer data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!lawyerToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/lawyers/${lawyerToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchLawyers();
    } catch (error) {
      console.error('Error deleting lawyer:', error);
      alert('Failed to delete lawyer.');
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
            <input type="text" placeholder="Search lawyers..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lawyer</span>
          </button>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Lawyers</h2>
            <p className="text-gray-500 text-sm">Manage law firm attorneys and specializations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-100 p-3 rounded-lg text-indigo-700">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(item)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{item.user?.name || 'Lawyer Name'}</h3>
                <p className="text-indigo-600 text-xs font-bold uppercase mb-3">{item.specialization}</p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Award className="h-4 w-4 mr-1" />
                  {item.experience_years} Years Experience
                </div>
                <div className="mt-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    item.availability_status === 'available' ? 'bg-green-100 text-green-700' : 
                    item.availability_status === 'busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.availability_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingLawyer ? 'Edit Lawyer' : 'Add New Lawyer'}
        loading={submitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
            >
              <option value="">Select a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              type="text"
              required
              placeholder="e.g. Criminal Law, Civil Litigation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.experience_years}
              onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.availability_status}
              onChange={(e) => setFormData({...formData, availability_status: e.target.value as any})}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="on_leave">On Leave</option>
            </select>
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
              {editingLawyer ? 'Update Lawyer' : 'Add Lawyer'}
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
            Are you sure you want to delete <span className="font-bold text-gray-900">{lawyerToDelete?.user?.name}</span>'s lawyer profile?
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
