'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getNepaliDateNow } from '@/lib/api';
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
  AlertTriangle,
  Gavel,
  Briefcase
} from 'lucide-react';

interface CaseRecord {
  id: number;
  title: string;
  case_number: string;
}

interface Hearing {
  id: number;
  case_id: number;
  hearing_date: string;
  judge_name: string;
  notes: string | null;
  status: 'Scheduled' | 'Adjourned' | 'Completed';
  case_record?: CaseRecord;
}

export default function SchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingHearing, setEditingHearing] = useState<Hearing | null>(null);
  const [hearingToDelete, setHearingToDelete] = useState<Hearing | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    case_id: '',
    hearing_date: '',
    judge_name: '',
    notes: '',
    status: 'Scheduled' as 'Scheduled' | 'Adjourned' | 'Completed',
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
      const [hearingsRes, casesRes] = await Promise.all([
        api.get('/hearings'),
        api.get('/cases')
      ]);
      setHearings(Array.isArray(hearingsRes.data) ? hearingsRes.data : []);
      setCases(Array.isArray(casesRes.data) ? casesRes.data : []);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setEditingHearing(null);
    const currentDate = await getNepaliDateNow();
    setFormData({
      case_id: '',
      hearing_date: currentDate,
      judge_name: '',
      notes: '',
      status: 'Scheduled',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hearing: Hearing) => {
    setEditingHearing(hearing);
    setFormData({
      case_id: hearing.case_id.toString(),
      hearing_date: hearing.hearing_date,
      judge_name: hearing.judge_name,
      notes: hearing.notes || '',
      status: hearing.status,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (hearing: Hearing) => {
    setHearingToDelete(hearing);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingHearing) {
        await api.put(`/hearings/${editingHearing.id}`, formData);
      } else {
        await api.post('/hearings', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving hearing:', error);
      alert('Failed to save hearing. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!hearingToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/hearings/${hearingToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting hearing:', error);
      alert('Failed to delete hearing.');
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
            <input type="text" placeholder="Search schedule..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Hearing</span>
          </button>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Hearing Schedule</h2>
            <p className="text-gray-500 text-sm">Track upcoming court dates and hearing status.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Case Details</th>
                  <th className="px-6 py-4">Hearing Date</th>
                  <th className="px-6 py-4">Judge</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hearings.length > 0 ? (
                  hearings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-gray-900 text-sm">{item.case_record?.title || 'Unknown Case'}</p>
                          <p className="text-xs text-indigo-600 font-medium">#{item.case_record?.case_number || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 font-medium">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {item.hearing_date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Gavel className="h-4 w-4 mr-2 text-gray-400" />
                          {item.judge_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                          item.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
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
                      No hearings scheduled. Click "Schedule Hearing" to add one.
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
        title={editingHearing ? 'Edit Hearing' : 'Schedule New Hearing'}
        loading={submitting}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Case</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.case_id}
                onChange={(e) => setFormData({...formData, case_id: e.target.value})}
              >
                <option value="">Select a case...</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.case_number})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hearing Date</label>
            <div className="relative">
              <NepaliDatePicker
                value={formData.hearing_date}
                onChange={(date) => setFormData({...formData, hearing_date: date})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judge Name</label>
            <div className="relative">
              <Gavel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g. Honorable John Doe"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.judge_name}
                onChange={(e) => setFormData({...formData, judge_name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Adjourned">Adjourned</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="Any specific instructions or notes for this hearing..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
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
              {editingHearing ? 'Update Schedule' : 'Schedule Hearing'}
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
            Are you sure you want to delete the hearing schedule for <span className="font-bold text-gray-900">{hearingToDelete?.case_record?.title}</span>?
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
