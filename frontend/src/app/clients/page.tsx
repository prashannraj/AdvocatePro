'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Modal from '@/components/Modal';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import FormField, { inputClasses, selectClasses, textareaClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import { 
  Users, 
  Search,
  Plus,
  Loader2,
  Phone,
  MapPin,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronRight,
  User,
  Contact,
  Info
} from 'lucide-react';

interface Client {
  id: number;
  contact_person: string;
  client_type: 'Individual' | 'Corporate';
  phone: string;
  address: string;
  user_id?: number | null;
}

export default function ClientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    contact_person: '',
    client_type: 'Individual' as 'Individual' | 'Corporate',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userStr));
    fetchClients();
  }, [router]);

  const fetchClients = async (search = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/clients?search=${search}`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({
      contact_person: '',
      client_type: 'Individual',
      phone: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      contact_person: client.contact_person,
      client_type: client.client_type,
      phone: client.phone,
      address: client.address,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/clients/${clientToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

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
      title="Client Relations"
      onSearch={(q) => setSearchQuery(q)}
      onPrint={() => window.print()}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clients</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage and track your firm's relationships.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Plus}
          className="sm:w-auto w-full"
        >
          New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">{client.contact_person}</h3>
                  <Badge variant={client.client_type === 'Corporate' ? 'corporate' : 'default'} className="mt-1">
                    {client.client_type}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenEditModal(client)}
                  className="text-slate-400 hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenDeleteModal(client)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span className="truncate">{client.address}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <button 
                onClick={() => router.push(`/clients/${client.id}/cases`)}
                className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.15em] flex items-center"
              >
                View Case Files <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="py-20 text-center opacity-40 bg-white rounded-3xl border border-dashed border-slate-200">
          <Users className="h-12 w-12 mx-auto mb-4" />
          <p className="font-black uppercase tracking-[0.2em] text-xs">No clients found</p>
        </div>
      )}

      {/* FAB for Mobile */}
      <button 
        onClick={handleOpenCreateModal}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Create/Edit Modal - Full screen on mobile */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClient ? 'Edit Client Record' : 'New Client Registration'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Identity & Type" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Full Name / Contact Person" required>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Hamal"
                  className={inputClasses}
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                />
              </FormField>
            </div>

            <FormField label="Client Type" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.client_type}
                  onChange={(e) => setFormData({...formData, client_type: e.target.value as any})}
                >
                  <option value="Individual">Individual (व्यक्तिगत)</option>
                  <option value="Corporate">Corporate (संस्थागत)</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>
          </FormSection>

          <FormSection title="Contact Details" icon={Contact}>
            <FormField label="Phone Number" required>
              <input
                type="text"
                required
                placeholder="98XXXXXXXX"
                className={inputClasses}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Permanent / Current Address" required>
                <textarea
                  required
                  rows={3}
                  placeholder="Street, City, District"
                  className={textareaClasses}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
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
              {editingClient ? 'Update Record' : 'Register Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Deletion"
        loading={submitting}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 mb-6 shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Are you absolutely sure?</h4>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            You are about to delete <span className="font-black text-slate-900">{clientToDelete?.contact_person}</span>. This will permanently remove all associated records from the database.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 h-12"
            >
              No, Keep it
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
