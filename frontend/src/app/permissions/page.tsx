'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FormField, { inputClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import { 
  Plus,
  Loader2,
  Search,
  Trash2,
  Edit,
  Lock,
  AlertTriangle,
  Fingerprint,
  Shield,
  Info
} from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  slug: string;
}

export default function PermissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
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
    fetchPermissions();
  }, [router]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/permissions');
      setPermissions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPermission(null);
    setFormData({ name: '', slug: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({ name: permission.name, slug: permission.slug });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (permission: Permission) => {
    setPermissionToDelete(permission);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPermission) {
        await api.put(`/permissions/${editingPermission.id}`, formData);
      } else {
        await api.post('/permissions', formData);
      }
      setIsModalOpen(false);
      fetchPermissions();
    } catch (error) {
      console.error('Error saving permission:', error);
      alert('Failed to save permission. Ensure slug is unique.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!permissionToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/permissions/${permissionToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      alert('Failed to delete permission.');
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Permissions</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Granular access controls for specific system functions.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Plus}
          className="sm:w-auto w-full"
        >
          Create Permission
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {permissions.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Fingerprint className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">{item.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {item.slug}
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
          </Card>
        ))}
      </div>

      {/* New/Edit Permission Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPermission ? 'Edit System Permission' : 'Define New Permission'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Permission Detail" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Action Name" required>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delete Cases"
                  className={inputClasses}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="System Slug (Unique)" required>
                <input
                  type="text"
                  required
                  placeholder="e.g. cases.delete"
                  className={inputClasses}
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '.')})}
                />
              </FormField>
            </div>
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
              {editingPermission ? 'Update Permission' : 'Create Permission'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Revoke System Permission"
        loading={submitting}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 mb-6 shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Are you absolutely sure?</h4>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            Deleting the permission <span className="font-black text-slate-900">{permissionToDelete?.name}</span> may disable certain app features for all users.
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
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </ResponsiveLayout>
  );
}
