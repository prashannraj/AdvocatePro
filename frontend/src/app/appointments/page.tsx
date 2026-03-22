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
  Clock,
  Calendar,
  User as UserIcon,
  AlertTriangle,
  ChevronRight,
  Info,
  MapPin
} from 'lucide-react';

interface Appointment {
  id: number;
  client_name: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    client_name: '',
    phone: '',
    appointment_date: '',
    appointment_time: '',
    purpose: '',
    status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled',
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
      const response = await api.get(`/appointments?search=${search}`);
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setEditingAppointment(null);
    const currentDate = await getNepaliDateNow();
    setFormData({
      client_name: '',
      phone: '',
      appointment_date: currentDate,
      appointment_time: '10:00',
      purpose: '',
      status: 'Scheduled',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      client_name: appointment.client_name,
      phone: appointment.phone,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      purpose: appointment.purpose,
      status: appointment.status,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, formData);
      } else {
        await api.post('/appointments', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to save appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/appointments/${appointmentToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment.');
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
      title="Client Appointments"
      onSearch={(q) => fetchData(q)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Client Appointments</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage your schedule and client meetings.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Plus}
          className="sm:w-auto w-full"
        >
          New Appointment
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Purpose</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {appointments.length > 0 ? (
              appointments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm uppercase group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {item.client_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.client_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{item.appointment_date}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mt-0.5">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.appointment_time}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 max-w-xs truncate">{item.purpose}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status === 'Scheduled' ? 'info' : item.status === 'Completed' ? 'success' : 'destructive'}>
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
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-black uppercase tracking-[0.2em] text-xs">No appointments scheduled</p>
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
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Client Information" icon={UserIcon}>
            <FormField label="Client Name" required>
              <input
                type="text"
                required
                className={inputClasses}
                placeholder="Full name of client"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
              />
            </FormField>

            <FormField label="Phone Number" required>
              <input
                type="text"
                required
                className={inputClasses}
                placeholder="Contact number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </FormField>
          </FormSection>

          <FormSection title="Schedule Details" icon={Clock}>
            <FormField label="Appointment Date" required>
              <NepaliDatePicker
                value={formData.appointment_date}
                onChange={(date) => setFormData({...formData, appointment_date: date})}
              />
            </FormField>

            <FormField label="Appointment Time" required>
              <input
                type="time"
                required
                className={inputClasses}
                value={formData.appointment_time}
                onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
              />
            </FormField>
          </FormSection>

          <FormSection title="Additional Info" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Purpose of Meeting" required>
                <textarea
                  required
                  rows={3}
                  className={inputClasses}
                  placeholder="What is this meeting about?"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                />
              </FormField>
            </div>

            <FormField label="Status" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
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
              {editingAppointment ? 'Update Schedule' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Cancellation"
        loading={submitting}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 mb-6 shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Delete Appointment?</h4>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            Are you sure you want to remove the appointment for <span className="font-black text-slate-900">{appointmentToDelete?.client_name}</span>?
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
