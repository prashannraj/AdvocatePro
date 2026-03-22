'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FormField, { inputClasses, selectClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import { 
  Users, 
  Search,
  Plus,
  Loader2,
  Trash2,
  Edit,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Lock,
  ChevronRight,
  Info,
  Shield
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  status: 'active' | 'inactive';
  role?: Role;
}

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    status: 'active' as 'active' | 'inactive',
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

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: User) => {
    setEditingUser(item);
    setFormData({
      name: item.name,
      email: item.email,
      password: '', // Keep empty for update unless changing
      role_id: item.role_id.toString(),
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: User) => {
    setUserToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Remove password if empty during update
      const dataToSend = { ...formData };
      if (editingUser && !dataToSend.password) {
        delete (dataToSend as any).password;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, dataToSend);
      } else {
        await api.post('/users', dataToSend);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Check if email is unique.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user.');
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
    <ResponsiveLayout user={user} title="Access Control">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Users</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage user accounts, roles, and system access levels.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Plus}
          className="sm:w-auto w-full"
        >
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <div className="font-black text-lg">{item.name.charAt(0)}</div>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">{item.name}</h3>
                  <Badge variant={item.status === 'active' ? 'success' : 'destructive'} className="mt-1">
                    {item.status}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span className="truncate">{item.email}</span>
              </div>
              <div className="flex items-center text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span>{item.role?.name}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New/Edit User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? 'Edit User Account' : 'Provision New Account'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Account Identity" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Full Name" required>
                <input
                  type="text"
                  required
                  className={inputClasses}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Email Address" required>
                <input
                  type="email"
                  required
                  className={inputClasses}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label={editingUser ? "New Password (Optional)" : "Account Password"} required={!editingUser}>
                <input
                  type="password"
                  className={inputClasses}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Authorization" icon={Shield}>
            <FormField label="System Role" required>
              <div className="relative">
                <select
                  required
                  className={selectClasses}
                  value={formData.role_id}
                  onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                >
                  <option value="">Select Role...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>

            <FormField label="Account Status" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
              {editingUser ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Terminate Account"
        loading={submitting}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 mb-6 shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Are you absolutely sure?</h4>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            You are about to terminate access for <span className="font-black text-slate-900">{userToDelete?.name}</span>. This will revoke all system permissions.
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
              Yes, Terminate
            </Button>
          </div>
        </div>
      </Modal>
    </ResponsiveLayout>
  );
}
