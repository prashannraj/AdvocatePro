'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card';
import Badge from '@/components/Badge';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import FormField, { inputClasses, selectClasses, textareaClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import { 
  Shield, 
  Plus, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Calendar,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  Trash2,
  LayoutGrid,
  Search,
  Zap,
  Info,
  User,
  Activity
} from 'lucide-react';

interface IPAsset {
  id: number;
  type: string;
  asset_name: string;
  application_number: string;
  registration_number: string;
  status: string;
  renewal_date: string;
  client?: { contact_person: string };
}

interface IPWatch {
  id: number;
  monitored_term: string;
  last_checked_date: string;
  new_matches_count: number;
}

export default function IPRPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [watches, setWatches] = useState<IPWatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assets' | 'watch' | 'renewals'>('assets');
  const [clients, setClients] = useState<any[]>([]);

  // Modal states
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [assetForm, setAssetForm] = useState({
    type: 'Trademark',
    asset_name: '',
    application_number: '',
    registration_number: '',
    status: 'Filed',
    renewal_date: '',
    client_id: '',
  });

  const [watchForm, setWatchForm] = useState({
    monitored_term: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    fetchData();
    fetchSupportData();
  }, []);

  const fetchData = async (search = '') => {
    try {
      setLoading(true);
      const [assetRes, watchRes] = await Promise.all([
        api.get(`/ip-assets?search=${search}`),
        api.get('/ip-watches')
      ]);
      setAssets(assetRes.data);
      setWatches(watchRes.data);
    } catch (error) {
      console.error('Failed to fetch IPR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (error) {
      console.error('Failed to fetch support data:', error);
    }
  };

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/ip-assets', assetForm);
      setIsAssetModalOpen(false);
      fetchData();
      setAssetForm({ type: 'Trademark', asset_name: '', application_number: '', registration_number: '', status: 'Filed', renewal_date: '', client_id: '' });
    } catch (error) {
      console.error('Failed to save asset:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/ip-watches', watchForm);
      setIsWatchModalOpen(false);
      fetchData();
      setWatchForm({ monitored_term: '' });
    } catch (error) {
      console.error('Failed to save watch:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const expiringAssets = assets.filter(a => {
    if (!a.renewal_date) return false;
    const diff = new Date(a.renewal_date).getTime() - new Date().getTime();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
  });

  return (
    <ResponsiveLayout 
      user={user} 
      title="IPR Department"
      onSearch={(q) => fetchData(q)}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">IP Portfolio</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage trademarks, patents, and intellectual assets.</p>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {[
            { id: 'assets', label: 'Portfolio', icon: LayoutGrid },
            { id: 'renewals', label: 'Renewals', icon: Calendar, count: expiringAssets.length },
            { id: 'watch', label: 'Watch Service', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.count ? (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-white text-primary' : 'bg-rose-500 text-white'}`}>
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : activeTab === 'assets' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <Card key={asset.id} className="group">
              <div className="flex justify-between items-start mb-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  asset.type === 'Trademark' ? 'bg-blue-50 text-blue-600' :
                  asset.type === 'Patent' ? 'bg-amber-50 text-amber-600' :
                  asset.type === 'Copyright' ? 'bg-purple-50 text-purple-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  <Fingerprint className="h-6 w-6" />
                </div>
                <Badge 
                  variant={asset.status === 'Registered' ? 'success' : asset.status === 'Filed' ? 'info' : 'warning'}
                >
                  {asset.status}
                </Badge>
              </div>
              
              <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors leading-tight">
                {asset.asset_name}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
                {asset.type} • {asset.client?.contact_person}
              </p>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">App No.</span>
                  <span className="text-slate-900 font-mono">{asset.application_number || 'Pending'}</span>
                </div>
                {asset.renewal_date && (
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Renewal</span>
                    <span className="text-primary">{new Date(asset.renewal_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary h-8"
                  onClick={() => router.push(`/ipr/${asset.id}`)}
                >
                  View Details <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          <button 
            onClick={() => setIsAssetModalOpen(true)}
            className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary/30 hover:text-primary transition-all min-h-[240px] group"
          >
            <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Register New IP</span>
          </button>
        </div>
      ) : activeTab === 'renewals' ? (
        <Card className="p-0 overflow-hidden border-slate-100">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <CardTitle icon={Calendar}>Renewal Pipeline</CardTitle>
            <Badge variant="destructive">Action Required</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Renewal Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expiringAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                          <Fingerprint size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900">{asset.asset_name}</span>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{asset.type} • #{asset.registration_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-widest">{asset.client?.contact_person}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-rose-600 font-black text-xs uppercase tracking-widest">
                        <Clock className="h-3 w-3 mr-1.5" />
                        {new Date(asset.renewal_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" className="h-8 text-[9px]">Start Renewal</Button>
                    </td>
                  </tr>
                ))}
                {expiringAssets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="max-w-xs mx-auto opacity-40">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">All IP assets are current</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-0 overflow-hidden border-slate-100">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <CardTitle icon={Zap}>Monitored Terms</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={Plus} 
                  className="h-8 text-[9px]"
                  onClick={() => setIsWatchModalOpen(true)}
                >
                  Add Term
                </Button>
              </div>
              <div className="divide-y divide-slate-50">
                {watches.map(watch => (
                  <div key={watch.id} className="p-6 hover:bg-slate-50 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">"{watch.monitored_term}"</h4>
                      <div className="flex items-center space-x-2">
                        {watch.new_matches_count > 0 && (
                          <Badge variant="destructive">{watch.new_matches_count} Alerts</Badge>
                        )}
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-500 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <TrendingUp className="h-3 w-3 mr-1.5 text-primary" />
                      Last Scan: {watch.last_checked_date ? new Date(watch.last_checked_date).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <AlertTriangle className="h-10 w-10 mb-6 text-indigo-200" />
              <h3 className="text-xl font-black leading-tight mb-3 uppercase tracking-tight">IP Watch Alerts</h3>
              <p className="text-indigo-100 text-xs font-medium mb-8 opacity-80 leading-relaxed">We've detected new trademark applications that may conflict with your clients' portfolio.</p>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary h-12">
                Review Matches
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New IP Asset Modal */}
      <Modal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        title="Register New IP Asset"
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleAssetSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Asset Classification" icon={Info}>
            <FormField label="Asset Type" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={assetForm.type}
                  onChange={(e) => setAssetForm({...assetForm, type: e.target.value})}
                >
                  <option value="Trademark">Trademark</option>
                  <option value="Patent">Patent</option>
                  <option value="Copyright">Copyright</option>
                  <option value="Design">Design</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>

            <FormField label="Asset Name" required>
              <input
                type="text"
                required
                className={inputClasses}
                placeholder="e.g. Brand Name or Invention Title"
                value={assetForm.asset_name}
                onChange={(e) => setAssetForm({...assetForm, asset_name: e.target.value})}
              />
            </FormField>
          </FormSection>

          <FormSection title="Registration Details" icon={Activity}>
            <FormField label="Application Number">
              <input
                type="text"
                className={inputClasses}
                value={assetForm.application_number}
                onChange={(e) => setAssetForm({...assetForm, application_number: e.target.value})}
              />
            </FormField>

            <FormField label="Registration Number">
              <input
                type="text"
                className={inputClasses}
                value={assetForm.registration_number}
                onChange={(e) => setAssetForm({...assetForm, registration_number: e.target.value})}
              />
            </FormField>

            <FormField label="Current Status" required>
              <div className="relative">
                <select
                  className={selectClasses}
                  value={assetForm.status}
                  onChange={(e) => setAssetForm({...assetForm, status: e.target.value})}
                >
                  <option value="Filed">Filed</option>
                  <option value="Published">Published</option>
                  <option value="Registered">Registered</option>
                  <option value="Renewed">Renewed</option>
                  <option value="Expired">Expired</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </FormField>

            <FormField label="Renewal Date">
              <input
                type="date"
                className={inputClasses}
                value={assetForm.renewal_date}
                onChange={(e) => setAssetForm({...assetForm, renewal_date: e.target.value})}
              />
            </FormField>
          </FormSection>

          <FormSection title="Ownership" icon={User}>
            <div className="sm:col-span-2">
              <FormField label="Assign to Client" required>
                <div className="relative">
                  <select
                    required
                    className={selectClasses}
                    value={assetForm.client_id}
                    onChange={(e) => setAssetForm({...assetForm, client_id: e.target.value})}
                  >
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.contact_person}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </FormField>
            </div>
          </FormSection>

          <div className="fixed sm:static bottom-0 left-0 right-0 p-4 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex space-x-3 z-50">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setIsAssetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="flex-[2] h-12">
              Register Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* New IP Watch Modal */}
      <Modal
        isOpen={isWatchModalOpen}
        onClose={() => setIsWatchModalOpen(false)}
        title="Add IP Watch Term"
        loading={submitting}
        fullScreenMobile
      >
        <form onSubmit={handleWatchSubmit} className="space-y-8 pb-24 sm:pb-0">
          <FormSection title="Monitoring Criteria" icon={Zap}>
            <div className="sm:col-span-2">
              <FormField label="Term to Monitor" required>
                <input
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="e.g. Trademark Name, Logo Text"
                  value={watchForm.monitored_term}
                  onChange={(e) => setWatchForm({...watchForm, monitored_term: e.target.value})}
                />
              </FormField>
              <p className="mt-2 text-[10px] text-slate-400 font-medium">
                Our system will scan new gazettes and trademark journals for phonetically or visually similar applications.
              </p>
            </div>
          </FormSection>

          <div className="fixed sm:static bottom-0 left-0 right-0 p-4 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 flex space-x-3 z-50">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setIsWatchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="flex-[2] h-12">
              Start Monitoring
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mobile FAB */}
      <button 
        onClick={() => {
          if (activeTab === 'assets') setIsAssetModalOpen(true);
          else if (activeTab === 'watch') setIsWatchModalOpen(true);
        }}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus className="h-7 w-7" />
      </button>
    </ResponsiveLayout>
  );
}
