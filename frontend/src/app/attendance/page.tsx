'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getNepaliDateNow } from '@/lib/api';
import { cn } from '@/lib/utils';
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
  UserCheck,
  Clock,
  AlertTriangle,
  User as UserIcon,
  Calendar,
  ChevronRight,
  Info,
  X
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  check_in: string;
  check_out: string | null;
  user?: User;
}

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    user_id: '',
    date: '',
    check_in: '',
    check_out: '',
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

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const [attendanceRes, usersRes] = await Promise.all([
        api.get(`/attendance?search=${search}`),
        api.get('/users')
      ]);
      setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setEditingRecord(null);
    const currentDate = await getNepaliDateNow();
    setFormData({
      user_id: '',
      date: currentDate,
      check_in: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      check_out: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: AttendanceRecord) => {
    // Helper to extract and convert time to 24h format for HTML input
    const parseTimeTo24h = (timeStr: string | null) => {
      if (!timeStr) return '';
      
      let timePart = timeStr;
      if (timeStr.includes(' ')) {
        const parts = timeStr.split(' ');
        timePart = parts.slice(1).join(' ');
      }
      
      if (timePart.toUpperCase().includes('AM') || timePart.toUpperCase().includes('PM')) {
        const isPM = timePart.toUpperCase().includes('PM');
        const timeMatch = timePart.match(/(\d+):(\d+)/);
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = timeMatch[2];
          if (isPM && h < 12) h += 12;
          if (!isPM && h === 12) h = 0;
          return `${h.toString().padStart(2, '0')}:${m.padStart(2, '0')}`;
        }
      }
      
      return timePart.trim().substring(0, 5);
    };

    setEditingRecord(record);
    setFormData({
      user_id: record.user_id.toString(),
      date: record.date,
      check_in: parseTimeTo24h(record.check_in),
      check_out: parseTimeTo24h(record.check_out),
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (record: AttendanceRecord) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.check_out) delete (dataToSend as any).check_out;

      if (editingRecord) {
        await api.put(`/attendance/${editingRecord.id}`, dataToSend);
      } else {
        await api.post('/attendance', dataToSend);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/attendance/${recordToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Failed to delete attendance record.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeForDisplay = (timeStr: string | null) => {
    if (!timeStr) return '';
    if (timeStr.includes(' ')) {
      const parts = timeStr.split(' ');
      return parts.slice(1).join(' ');
    }
    return timeStr;
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
      title="Staff Attendance"
      onSearch={(q) => fetchData(q)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Attendance</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Track check-in and check-out times for employees.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Plus}
          className="sm:w-auto w-full"
        >
          Mark Attendance
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Check In</th>
              <th className="px-6 py-4">Check Out</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {attendance.length > 0 ? (
              attendance.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm uppercase group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {(item.user?.name || 'E').charAt(0)}
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{item.user?.name || 'Unknown Employee'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{item.date}</td>
                  <td className="px-6 py-4">
                    <Badge variant="success" className="flex items-center w-fit">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeForDisplay(item.check_in)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {item.check_out ? (
                      <Badge variant="destructive" className="flex items-center w-fit">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeForDisplay(item.check_out)}
                      </Badge>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Still working</span>
                    )}
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
                  <UserCheck className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-black uppercase tracking-[0.2em] text-xs">No attendance records found</p>
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
        title={editingRecord ? 'Edit Attendance' : 'Mark New Attendance'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="User Assignment" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Select Employee" required>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                  <select
                    required
                    className={cn(selectClasses, "pl-11")}
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

          <FormSection title="Time Tracking" icon={Clock}>
            <div className="sm:col-span-2">
              <FormField label="Date" required>
                <NepaliDatePicker
                  value={formData.date}
                  onChange={(date) => setFormData({...formData, date: date})}
                />
              </FormField>
            </div>

            <FormField label="Check In Time" required>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <input
                  type="time"
                  required
                  className={cn(inputClasses, "pl-11")}
                  value={formData.check_in}
                  onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                />
              </div>
            </FormField>

            <FormField label="Check Out Time">
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <input
                  type="time"
                  className={cn(inputClasses, "pl-11")}
                  value={formData.check_out}
                  onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                />
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
              icon={X}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              className="flex-[2] h-12 shadow-lg shadow-primary/20"
              icon={editingRecord ? Edit : Plus}
            >
              {editingRecord ? 'Update Record' : 'Confirm Attendance'}
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
          <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Remove Attendance Record?</h4>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            Are you sure you want to delete the record for <span className="font-black text-slate-900">{recordToDelete?.user?.name}</span> on <span className="font-black text-slate-900">{recordToDelete?.date}</span>?
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
