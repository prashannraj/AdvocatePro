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
import FormField, { inputClasses, selectClasses, textareaClasses } from '@/components/FormField';
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
  AlertTriangle,
  Gavel,
  Briefcase,
  ChevronRight,
  Info,
  Scale,
  FileText
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
    <ResponsiveLayout user={user} title="Court Schedule">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hearings & Deadlines</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Track all upcoming court appearances and filing deadlines.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Plus}
          className="sm:w-auto w-full"
        >
          Schedule Hearing
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hearings.map((hearing) => (
          <Card key={hearing.id} className="group relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Gavel className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">
                    {hearing.case_record?.case_number}
                  </h3>
                  <Badge variant={
                    hearing.status === 'Scheduled' ? 'info' :
                    hearing.status === 'Completed' ? 'success' : 'warning'
                  } className="mt-1">
                    {hearing.status}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenEditModal(hearing)}
                  className="text-slate-400 hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenDeleteModal(hearing)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span>{hearing.hearing_date}</span>
              </div>
              <div className="flex items-center text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <Scale className="h-3.5 w-3.5 mr-2 text-slate-400" />
                <span>{hearing.judge_name || 'Not Assigned'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                {hearing.case_record?.title}
              </p>
              <button 
                onClick={() => router.push(`/cases/${hearing.case_id}`)}
                className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.15em] flex items-center"
              >
                View Case <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {hearings.length === 0 && (
        <div className="py-20 text-center opacity-40 bg-white rounded-3xl border border-dashed border-slate-200">
          <Calendar className="h-12 w-12 mx-auto mb-4" />
          <p className="font-black uppercase tracking-[0.2em] text-xs">No hearings scheduled</p>
        </div>
      )}

      {/* New/Edit Hearing Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingHearing ? 'Update Hearing Record' : 'Schedule Court Appearance'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Case Selection" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Linked Case File" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={formData.case_id}
                    onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                  >
                    <option value="">Select a case...</option>
                    {cases.map(c => <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Hearing Details" icon={Gavel}>
            <FormField label="Hearing Date (BS)" required>
              <NepaliDatePicker
                value={formData.hearing_date}
                onChange={(date) => setFormData({...formData, hearing_date: date})}
              />
            </FormField>

            <FormField label="Current Status" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Adjourned">Adjourned</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Judge / Court Bench">
                <input
                  type="text"
                  placeholder="e.g. Justice Ram Bahadur"
                  className={inputClasses}
                  value={formData.judge_name}
                  onChange={(e) => setFormData({...formData, judge_name: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Additional Notes" icon={FileText}>
            <div className="sm:col-span-2">
              <FormField label="Procedural Notes">
                <textarea
                  className={cn(textareaClasses, "min-h-[120px]")}
                  placeholder="Notes from previous hearing or objectives for this session..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
              {editingHearing ? 'Update Schedule' : 'Confirm Schedule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Cancel Hearing"
        loading={submitting}
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 mb-6 shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Remove from Schedule?</h4>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            You are about to cancel the hearing for <span className="font-black text-slate-900">{hearingToDelete?.case_record?.case_number}</span>. This will remove it from all calendars.
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
              Yes, Cancel it
            </Button>
          </div>
        </div>
      </Modal>
    </ResponsiveLayout>
  );
}
