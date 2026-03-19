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
  Clock,
  Calendar,
  User as UserIcon,
  AlertTriangle
} from 'lucide-react';

interface Client {
  id: number;
  contact_person: string;
}

interface Lawyer {
  id: number;
  user?: {
    name: string;
  };
}

interface Appointment {
  id: number;
  client_id: number;
  lawyer_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  client?: Client;
  lawyer?: Lawyer;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    client_id: '',
    lawyer_id: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
    status: 'Pending' as 'Pending' | 'Confirmed' | 'Cancelled',
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
      const [appointmentsRes, clientsRes, lawyersRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/clients'),
        api.get('/lawyers')
      ]);
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
      setLawyers(Array.isArray(lawyersRes.data) ? lawyersRes.data : []);
    } catch (error) {
      console.error('Error fetching appointments data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAppointment(null);
    setFormData({
      client_id: '',
      lawyer_id: '',
      appointment_date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00',
      status: 'Pending',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      client_id: appointment.client_id.toString(),
      lawyer_id: appointment.lawyer_id.toString(),
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
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
      alert('Failed to save appointment. Please check if all fields are correct.');
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
            <input type="text" placeholder="Search appointments..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Appointment</span>
          </button>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
            <p className="text-gray-500 text-sm">Manage client consultations and meetings.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Client & Lawyer</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.length > 0 ? (
                  appointments.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-gray-900 text-sm">{item.client?.contact_person || 'Client'}</p>
                          <p className="text-xs text-indigo-600 font-medium flex items-center">
                            <UserIcon className="h-3 w-3 mr-1" />
                            {item.lawyer?.user?.name || 'Assigned Lawyer'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{item.appointment_date}</span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.start_time} - {item.end_time}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
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
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                      No appointments found. Start by creating one.
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
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
        loading={submitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              >
                <option value="">Select Client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.contact_person}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lawyer</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.lawyer_id}
                onChange={(e) => setFormData({...formData, lawyer_id: e.target.value})}
              >
                <option value="">Select Lawyer...</option>
                {lawyers.map(l => <option key={l.id} value={l.id}>{l.user?.name || 'Unknown'}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
            <div className="relative">
              <NepaliDatePicker
                value={formData.appointment_date}
                onChange={(date) => setFormData({...formData, appointment_date: date})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
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
              {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
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
            Are you sure you want to delete the appointment for <span className="font-bold text-gray-900">{appointmentToDelete?.client?.contact_person}</span>?
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
