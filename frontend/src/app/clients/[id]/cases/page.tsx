'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import PrintLayout from '@/components/PrintLayout';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  Scale, 
  ArrowLeft, 
  Printer, 
  FileText, 
  Plus, 
  Upload,
  Download,
  Trash2,
  File,
  X,
  Loader2
} from 'lucide-react';
import Modal from '@/components/Modal';

interface Document {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  category?: string;
  description?: string;
  created_at: string;
}

interface Case {
  id: number;
  case_number: string;
  bs_year?: string;
  case_type_code?: string;
  sequential_number?: number;
  title: string;
  description: string;
  status: string;
  filed_date: string;
  lawyer?: { user?: { name: string } };
  court?: { name: string };
  documents?: Document[];
}

const DOCUMENT_CATEGORIES = [
  'Petition/Application/Plaint (निवेदनपत्र / फिरादपत्र)',
  'Power of Attorney / Vakalatnama (वारेसनामा)',
  'Identification Documents (नागरिकता प्रमाणपत्र, etc.)',
  'Supporting Evidence / Annexures',
  'Court Fee Payment Receipt / Challan',
  'Other Case-Specific Documents'
];

interface Client {
  id: number;
  contact_person: string;
  client_type: string;
  phone: string;
  address: string;
  cases: Case[];
}

export default function ClientCasesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
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
    fetchClientCases();
  }, [id, router]);

  const fetchClientCases = async () => {
    try {
      const response = await api.get(`/clients/${id}/cases`);
      setClient(response.data);
    } catch (error) {
      console.error('Error fetching client cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenUploadModal = (item: Case) => {
    setSelectedCase(item);
    setUploadFormData({
      category: DOCUMENT_CATEGORIES[0],
      description: '',
      file: null
    });
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !uploadFormData.file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('documentable_id', selectedCase.id.toString());
      formData.append('documentable_type', 'App\\Models\\CaseRecord');
      formData.append('file', uploadFormData.file);
      formData.append('category', uploadFormData.category);
      formData.append('description', uploadFormData.description);

      await api.post('/documents', formData);
      setIsUploadModalOpen(false);
      fetchClientCases(); // Refresh data
    } catch (error: any) {
      console.error('Error uploading document:', error);
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[];
        alert(`Validation Error: ${firstError[0]}`);
      } else {
        alert('Failed to upload document. Please check file size and format.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${docId}`);
        fetchClientCases(); // Refresh data
      } catch (error) {
        console.error('Error deleting document:', error);
      }
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

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-4">Client not found.</p>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 print:hidden">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Clients</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </header>

        <main className="p-8 max-w-5xl mx-auto">
          <PrintLayout title="Client Case Summary">
            {/* Client Profile Card */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 print:shadow-none print:border-none print:p-0">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl uppercase print:hidden">
                    {client.contact_person.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{client.contact_person}</h2>
                    <p className="text-indigo-600 font-medium">{client.client_type} Client</p>
                  </div>
                </div>
                <div className="text-right print:hidden">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Client Profile</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center text-gray-600">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center mr-4 text-gray-400 print:hidden">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Phone Number</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center mr-4 text-gray-400 print:hidden">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Address</p>
                    <p className="font-medium">{client.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cases Section */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-indigo-600 print:hidden" />
                Associated Cases ({client.cases.length})
              </h3>
            </div>

            <div className="space-y-6">
              {client.cases.length > 0 ? (
                client.cases.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border print:border-gray-200">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2 mb-0.5">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Case ID: {item.case_number}</span>
                          {item.case_type_code && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-bold border border-indigo-200 uppercase tracking-tighter">
                              {item.case_type_code}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'Open' ? 'bg-green-100 text-green-700' : 
                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        {item.description || 'No description provided for this case.'}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center text-sm">
                          <UserIcon className="h-4 w-4 mr-2 text-gray-400 print:hidden" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Lawyer</p>
                            <p className="font-medium text-gray-700">{item.lawyer?.user?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <Scale className="h-4 w-4 mr-2 text-gray-400 print:hidden" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Court</p>
                            <p className="font-medium text-gray-700">{item.court?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400 print:hidden" />
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Filed Date</p>
                            <p className="font-medium text-gray-700">{item.filed_date}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documents Section */}
                      <div className="mt-8 pt-6 border-t border-gray-100 print:mt-10">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-bold text-gray-900 flex items-center uppercase tracking-tight">
                            <FileText className="h-4 w-4 mr-2 text-indigo-600 print:hidden" />
                            Case Documents ({item.documents?.length || 0})
                          </h5>
                          <button 
                            onClick={() => handleOpenUploadModal(item)}
                            className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors print:hidden"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Document</span>
                          </button>
                        </div>

                        {item.documents && item.documents.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1 print:gap-4">
                            {item.documents.map((doc) => (
                              <div key={doc.id} className="group relative bg-gray-50 border border-gray-100 rounded-xl p-4 transition-all print:bg-white print:border-b print:border-gray-100 print:rounded-none print:px-0 print:py-3 break-inside-avoid">
                                <div className="flex items-start space-x-3">
                                  <div className="h-10 w-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-indigo-600 print:hidden">
                                    <File className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5 truncate">
                                      {doc.category || 'General Document'}
                                    </p>
                                    <h6 className="text-sm font-bold text-gray-900 truncate mb-1">
                                      {doc.file_name}
                                    </h6>
                                    {doc.description && (
                                      <p className="text-xs text-gray-500 line-clamp-1 mb-2 print:line-clamp-none">
                                        {doc.description}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-3 print:hidden">
                                      <button 
                                        onClick={() => handleDownload(doc)}
                                        className="flex items-center text-[10px] font-bold text-gray-500 hover:text-indigo-600 uppercase tracking-wider"
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="flex items-center text-[10px] font-bold text-gray-400 hover:text-red-600 uppercase tracking-wider"
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center print:hidden">
                            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No documents uploaded for this case yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Cases Found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">This client doesn't have any cases associated with them yet.</p>
                </div>
              )}
            </div>
          </PrintLayout>
        </main>
      </div>

      {/* Upload Modal */}
      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => !uploading && setIsUploadModalOpen(false)}
        title={`Upload Case Document`}
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg mb-4">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1">Case Target</p>
            <h4 className="font-bold text-indigo-900">{selectedCase?.title}</h4>
            <p className="text-xs text-indigo-600">ID: {selectedCase?.case_number}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Document Category</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={uploadFormData.category}
              onChange={(e) => setUploadFormData({...uploadFormData, category: e.target.value})}
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[80px]"
              placeholder="Add some details about this document..."
              value={uploadFormData.description}
              onChange={(e) => setUploadFormData({...uploadFormData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Select File</label>
            <div className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
              uploadFormData.file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-indigo-400'
            }`}>
              <input
                type="file"
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setUploadFormData({...uploadFormData, file: e.target.files?.[0] || null})}
                accept=".pdf,.doc,.docx,image/*"
              />
              <div className="text-center">
                {uploadFormData.file ? (
                  <>
                    <File className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-green-700 truncate px-4">{uploadFormData.file.name}</p>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFormData({...uploadFormData, file: null});
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
              disabled={uploading}
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !uploadFormData.file}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
