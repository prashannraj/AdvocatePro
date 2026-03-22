'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
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
  Loader2,
  ChevronRight,
  Info,
  Gavel
} from 'lucide-react';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card';
import FormField, { inputClasses, selectClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';

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
  'Other Case-Specific Documents',
  // IPR Specific
  'Trademark Application Form',
  'Patent Specification',
  'Copyright Deposit Copy',
  'Cease & Desist Letter',
  'Opposition / Reply',
  'License Agreement',
  'Power of Attorney for IP'
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

  if (!client) {
    return (
      <ResponsiveLayout user={user} title="Client Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <Info className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Client file not found</h2>
          <p className="text-slate-500 mb-8">The client you are looking for might have been deleted or moved.</p>
          <Button onClick={() => router.push('/clients')}>Back to Inventory</Button>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout user={user} title={`Case File: ${client.contact_person}`}>
      <PrintLayout title={`Legal Case Summary: ${client.contact_person}`}>
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0 print:hidden">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-slate-500 hover:text-primary transition-colors text-sm font-bold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client Registry
          </button>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handlePrint} className="text-[10px] font-black uppercase tracking-widest">
              <Printer className="h-4 w-4 mr-2" />
              Print File
            </Button>
          </div>
        </div>

        {/* Client Profile Card */}
        <Card className="bg-slate-900 text-white border-none shadow-xl shadow-slate-200/50 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserIcon size={120} />
          </div>
          <CardContent className="p-8 sm:p-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="flex items-center space-x-5">
                <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl uppercase">
                  {client.contact_person.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight leading-tight">{client.contact_person}</h2>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/20 px-2 py-0.5 rounded-md">{client.client_type}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry ID: #{client.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mailing Address</p>
                  <p className="font-bold text-sm text-slate-100">{client.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Contact Number</p>
                  <p className="font-bold text-sm text-slate-100">{client.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Section */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-primary" />
            Matter Inventory ({client.cases.length})
          </h3>
        </div>

        <div className="space-y-8">
          {client.cases.length > 0 ? (
            client.cases.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="h-1.5 bg-slate-100 w-full group-hover:bg-primary transition-colors" />
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ref: {item.case_number}</span>
                        <Badge variant={item.status === 'Open' ? 'success' : item.status === 'Pending' ? 'warning' : 'default'}>
                          {item.status}
                        </Badge>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{item.title}</h4>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenUploadModal(item)}
                        icon={Plus}
                        className="text-[10px] font-black uppercase tracking-widest h-10 print:hidden"
                      >
                        Vault File
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
                    {item.description || 'No detailed brief provided for this matter.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-slate-50">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Scale size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Counsel</p>
                        <p className="text-xs font-bold text-slate-900">{item.lawyer?.user?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Gavel size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tribunal</p>
                        <p className="text-xs font-bold text-slate-900 truncate">{item.court?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lodged On</p>
                        <p className="text-xs font-bold text-slate-900">{item.filed_date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center">
                        <FileText className="h-3.5 w-3.5 mr-2 text-primary" />
                        Digital Vault ({item.documents?.length || 0})
                      </h5>
                    </div>

                    {item.documents && item.documents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.documents.map((doc) => (
                          <div key={doc.id} className="group/doc relative bg-slate-50/50 border border-slate-100 rounded-2xl p-4 hover:border-primary/20 transition-all flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary group-hover/doc:scale-110 transition-transform">
                              <File size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 truncate">
                                {doc.category || 'General'}
                              </p>
                              <h6 className="text-xs font-black text-slate-900 truncate mb-1">
                                {doc.file_name}
                              </h6>
                              <div className="flex items-center space-x-3 opacity-0 group-hover/doc:opacity-100 transition-opacity mt-2 print:hidden">
                                <button 
                                  onClick={() => handleDownload(doc)}
                                  className="text-[9px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </button>
                                <button 
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest flex items-center"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-8 text-center print:hidden">
                        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No documents in vault</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )) : (
            <Card className="p-20 text-center opacity-40 border-none bg-transparent">
              <Briefcase className="h-16 w-16 mx-auto mb-6" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">No Matter History</h3>
            </Card>
          )}
        </div>
      </PrintLayout>

      {/* Upload Modal */}
      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => !uploading && setIsUploadModalOpen(false)}
        title={`Vault File Upload`}
        fullScreenMobile
      >
        <form onSubmit={handleUpload} className="space-y-8 pb-24 sm:pb-0">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Matter Selection</p>
            <h4 className="font-black text-slate-900 leading-tight">{selectedCase?.title}</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">Ref: {selectedCase?.case_number}</p>
          </div>

          <FormSection title="File Classification" icon={Info}>
            <div className="sm:col-span-2">
              <FormField label="Document Category" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData({...uploadFormData, category: e.target.value})}
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
              <FormField label="Internal Notes (Optional)">
                <textarea
                  className={inputClasses}
                  rows={3}
                  placeholder="Details for internal reference..."
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({...uploadFormData, description: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Source Document" icon={Upload}>
            <div className="sm:col-span-2">
              <div className={`relative border-2 border-dashed rounded-2xl p-10 transition-all flex flex-col items-center justify-center text-center ${
                uploadFormData.file ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'
              }`}>
                <input
                  type="file"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setUploadFormData({...uploadFormData, file: e.target.files?.[0] || null})}
                  accept=".pdf,.doc,.docx,image/*"
                />
                
                {uploadFormData.file ? (
                  <>
                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary mb-4">
                      <File className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-black text-slate-900 truncate max-w-[250px]">{uploadFormData.file.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for vaulting</p>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFormData({...uploadFormData, file: null});
                      }}
                      className="mt-4 text-[10px] font-black text-rose-500 hover:underline uppercase tracking-widest z-20"
                    >
                      Remove Selection
                    </button>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Drop file or click to browse</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Support: PDF, DOCX, Images (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>
          </FormSection>

          {/* Action Buttons */}
          <div className="fixed sm:static bottom-0 left-0 right-0 p-4 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex space-x-3 z-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
              className="flex-1 h-12"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={uploading}
              className="flex-[2] h-12 shadow-xl shadow-primary/20"
              disabled={!uploadFormData.file}
            >
              Vault Document
            </Button>
          </div>
        </form>
      </Modal>
    </ResponsiveLayout>
  );
}
