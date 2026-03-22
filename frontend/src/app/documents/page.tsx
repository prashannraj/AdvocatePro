'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Modal from '@/components/Modal';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { cn } from '@/lib/utils';
import FormField, { inputClasses, selectClasses, textareaClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import { 
  Plus,
  Loader2,
  Search,
  Trash2,
  Edit,
  File,
  Download,
  AlertTriangle,
  FileText,
  Briefcase,
  Upload,
  X,
  ChevronRight,
  Filter,
  Info
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  'Petition/Application/Plaint (निवेदनपत्र / फिरादपत्र)',
  'Power of Attorney / Vakalatnama (वारेसनामा)',
  'Identification Documents (नागरिकता प्रमाणपत्र, etc.)',
  'Supporting Evidence / Annexures',
  'Court Fee Payment Receipt / Challan',
  'Other Case-Specific Documents'
];

interface Document {
  id: number;
  documentable_id: number;
  documentable_type: string;
  file_path: string;
  file_name: string;
  file_type: string;
  category?: string;
  description?: string;
  documentable?: {
    id: number;
    title?: string;
    case_number?: string;
  };
}

interface Case {
  id: number;
  title: string;
  case_number: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    documentable_id: '',
    documentable_type: 'App\\Models\\CaseRecord',
    category: DOCUMENT_CATEGORIES[0],
    description: '',
    file: null as File | null
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
      const [docsRes, casesRes] = await Promise.all([
        api.get('/documents'),
        api.get('/cases')
      ]);
      setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
      setCases(Array.isArray(casesRes.data) ? casesRes.data : []);
    } catch (error) {
      console.error('Error fetching documents data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingDocument(null);
    setFormData({
      documentable_id: '',
      documentable_type: 'App\\Models\\CaseRecord',
      category: DOCUMENT_CATEGORIES[0],
      description: '',
      file: null
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc: Document) => {
    setEditingDocument(doc);
    setFormData({
      documentable_id: doc.documentable_id.toString(),
      documentable_type: doc.documentable_type,
      category: doc.category || DOCUMENT_CATEGORIES[0],
      description: doc.description || '',
      file: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (doc: Document) => {
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('documentable_id', formData.documentable_id);
      submitData.append('documentable_type', formData.documentable_type);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      if (editingDocument) {
        await api.post(`/documents/${editingDocument.id}?_method=PUT`, submitData);
      } else {
        await api.post('/documents', submitData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving document:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    setSubmitting(true);
    try {
      await api.delete(`/documents/${documentToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentable?.title?.toLowerCase().includes(searchQuery.toLowerCase())
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
      title="Legal Vault"
      onSearch={(q) => setSearchQuery(q)}
      onPrint={() => window.print()}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Documents</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Access and manage all legal filings and evidence.</p>
        </div>
        
        <Button 
          onClick={handleOpenCreateModal}
          icon={Upload}
          className="sm:w-auto w-full"
        >
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="group relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-all">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenEditModal(doc)}
                  className="h-8 w-8 text-slate-400 hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenDeleteModal(doc)}
                  className="h-8 w-8 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl text-primary mb-4 self-center group-hover:scale-110 transition-transform duration-300 border border-slate-100 shadow-sm">
                <FileText className="h-8 w-8" />
              </div>
              
              <h3 className="font-black text-slate-900 text-sm mb-1 truncate text-center px-2">{doc.file_name}</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4 text-center">{doc.file_type}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider overflow-hidden">
                  <Briefcase className="h-3 w-3 mr-1.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{doc.documentable?.title || 'General'}</span>
                </div>
                <button 
                  onClick={() => handleDownload(doc)}
                  className="h-8 w-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-black uppercase tracking-[0.2em] text-xs">No documents found</p>
          </div>
        )}
      </div>

      {/* FAB for Mobile */}
      <button 
        onClick={handleOpenCreateModal}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Upload className="h-7 w-7" />
      </button>

      {/* Upload/Edit Modal - Full screen on mobile */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingDocument ? 'Edit Document Entry' : 'Upload Legal Document'}
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Document Details" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Link to Legal Matter" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={formData.documentable_id}
                    onChange={(e) => setFormData({...formData, documentable_id: e.target.value})}
                  >
                    <option value="">Select a case file...</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Document Category" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Brief Description (Optional)">
                <textarea
                  className={cn(textareaClasses, "min-h-[100px]")}
                  rows={3}
                  placeholder="Summarize the content of this document..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="File Upload" icon={Upload}>
            <div className="sm:col-span-2">
              <FormField label={editingDocument ? 'Replace Current File' : 'Select Legal File'}>
                <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
                  formData.file ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 hover:border-primary/30 bg-white'
                }`}>
                  <input
                    type="file"
                    required={!editingDocument}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                    accept=".pdf,.doc,.docx,image/*"
                  />
                  <div className="text-center">
                    {formData.file ? (
                      <>
                        <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <FileText className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-black text-emerald-900 truncate px-4">{formData.file.name}</p>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({...formData, file: null});
                          }}
                          className="mt-2 text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center justify-center mx-auto"
                        >
                          <X className="h-3 w-3 mr-1" /> Remove File
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Click or drag to upload</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">PDF, DOCX, or Images (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
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
              icon={editingDocument ? Edit : Upload}
            >
              {editingDocument ? 'Update Entry' : 'Upload File'}
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
            You are about to delete <span className="font-black text-slate-900">{documentToDelete?.file_name}</span>. This action cannot be reversed.
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
