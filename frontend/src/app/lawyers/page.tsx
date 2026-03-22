'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FormField, { inputClasses, selectClasses, textareaClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import { 
  Plus,
  Loader2,
  Search,
  Trash2,
  Edit,
  Briefcase,
  Award,
  AlertTriangle,
  User as UserIcon,
  ChevronRight,
  Info,
  Clock,
  ShieldCheck
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
    <ResponsiveLayout user={user} title="Firm Management">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Legal Professionals</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage firm partners, associates, and staff lawyers.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Plus}
          className="sm:w-auto w-full"
        >
          Add Lawyer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lawyers.map((lawyer) => (
          <Card key={lawyer.id} className="group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">{lawyer.user?.name}</h3>
                  <Badge variant={
                    lawyer.availability_status === 'available' ? 'success' :
                    lawyer.availability_status === 'busy' ? 'warning' : 'destructive'
                  } className="mt-1">
                    {lawyer.availability_status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenEditModal(lawyer)}
                  className="text-slate-400 hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenDeleteModal(lawyer)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <Briefcase className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span>{lawyer.specialization}</span>
              </div>
              <div className="flex items-center text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <Award className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span>{lawyer.experience_years} Years Experience</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <button 
                onClick={() => router.push(`/lawyers/${lawyer.id}/cases`)}
                className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.15em] flex items-center"
              >
                View Assignments <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* New/Edit Lawyer Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingLawyer ? 'Edit Professional Record' : 'Register New Lawyer'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="User Assignment" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Linked System User" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  >
                    <option value="">Select User...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Professional Background" icon={ShieldCheck}>
            <div className="sm:col-span-2">
              <FormField label="Area of Specialization" required>
                <input
                  type="text"
                  required
                  placeholder="e.g. Criminal Law, Corporate Law"
                  className={inputClasses}
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />
              </FormField>
            </div>

            <FormField label="Years of Experience" required>
              <input
                type="number"
                required
                className={inputClasses}
                value={formData.experience_years}
                onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
              />
            </FormField>

            <FormField label="Availability Status" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.availability_status}
                  onChange={(e) => setFormData({...formData, availability_status: e.target.value as any})}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy / In-Court</option>
                  <option value="on_leave">On Leave</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>
          </FormSection>

          {/* Action Buttons - Fixed at bottom on mobile */}
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
              {editingLawyer ? 'Update Record' : 'Register Lawyer'}
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
          <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Are you absolutely sure?</h4>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            You are about to remove <span className="font-black text-slate-900">{lawyerToDelete?.user?.name}</span> from the firm's lawyer list.
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
