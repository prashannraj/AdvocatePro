'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
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
  X
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
      file: null, // Files cannot be "edited" easily, they are replaced
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
        // Since we are using multipart/form-data for uploads, 
        // we might need to use POST with _method=PUT for Laravel if it's a PUT request
        await api.post(`/documents/${editingDocument.id}?_method=PUT`, submitData);
      } else {
        await api.post('/documents', submitData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving document:', error);
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        alert(`Validation Error: ${firstError[0]}`);
      } else {
        alert('Failed to save document. Please check the data.');
      }
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
      alert('Failed to delete document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Use window.open for direct download link if backend supports it
      // or fetch via api and create a blob
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
      alert('Failed to download document. It might not exist on the server.');
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
            <input type="text" placeholder="Search documents..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Legal Documents</h2>
            <p className="text-gray-500 text-sm">View and manage documents associated with legal cases.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col group relative">
                  <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEditModal(doc)}
                      className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(doc)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-xl text-red-600 mb-4 self-center">
                    <File className="h-8 w-8" />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-sm mb-1 truncate text-center">{doc.file_name}</h3>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase mb-2 text-center">{doc.file_type}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center text-[10px] text-gray-500">
                      <Briefcase className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-[100px]">{doc.documentable?.title || 'No Case'}</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(doc)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>No documents found. Start by uploading one.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingDocument ? 'Edit Document' : 'Upload New Document'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Case</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.documentable_id}
              onChange={(e) => setFormData({...formData, documentable_id: e.target.value})}
            >
              <option value="">Select a case...</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Category</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              rows={3}
              placeholder="Add some details about this document..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {editingDocument ? 'Replace File (Optional)' : 'Select File'}
            </label>
            <div className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              formData.file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-indigo-400'
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
                    <File className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700 truncate px-4">{formData.file.name}</p>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({...formData, file: null});
                      }}
                      className="mt-2 text-xs text-red-500 hover:underline flex items-center justify-center mx-auto"
                    >
                      <X className="h-3 w-3 mr-1" /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Click or drag to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or Images (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{editingDocument ? 'Updating...' : 'Uploading...'}</span>
                </>
              ) : (
                <>
                  {editingDocument ? <Edit className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  <span>{editingDocument ? 'Update Document' : 'Upload Document'}</span>
                </>
              )}
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
            Are you sure you want to delete document <span className="font-bold text-gray-900">{documentToDelete?.file_name}</span>?
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
