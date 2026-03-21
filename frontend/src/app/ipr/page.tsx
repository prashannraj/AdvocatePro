'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  ExternalLink,
  Calendar,
  Eye,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Fingerprint
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
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [watches, setWatches] = useState<IPWatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assets' | 'watch' | 'renewals'>('assets');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetRes, watchRes] = await Promise.all([
        api.get('/ip-assets'),
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

  const expiringAssets = assets.filter(a => {
    if (!a.renewal_date) return false;
    const diff = new Date(a.renewal_date).getTime() - new Date().getTime();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; // Next 90 days
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        <header className="bg-white border-b border-gray-100 p-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Intellectual Property (IPR)</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">IPR Department</h1>
              <p className="text-gray-500 font-medium mt-1">Manage trademarks, patents, and monitor IP infringements.</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/cases?department=IPR')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New IPR Case</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-8 mt-8 border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('assets')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === 'assets' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              IP Portfolio ({assets.length})
              {activeTab === 'assets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('renewals')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === 'renewals' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Renewals Due
              {expiringAssets.length > 0 && <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] rounded-full">{expiringAssets.length}</span>}
              {activeTab === 'renewals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('watch')}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === 'watch' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              IP Watch Service
              {activeTab === 'watch' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
          </div>
        </header>

        <main className="p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeTab === 'assets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      asset.type === 'Trademark' ? 'bg-blue-50 text-blue-600' :
                      asset.type === 'Patent' ? 'bg-amber-50 text-amber-600' :
                      asset.type === 'Copyright' ? 'bg-purple-50 text-purple-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      <Fingerprint className="h-5 w-5" />
                    </div>
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                      asset.status === 'Registered' ? 'bg-emerald-50 text-emerald-600' :
                      asset.status === 'Filed' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                  
                  <h3 className="font-black text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                    {asset.asset_name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    {asset.type} • {asset.client?.contact_person}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-xs text-gray-500">
                      <FileText className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      <span className="font-bold">App No:</span>
                      <span className="ml-1">{asset.application_number || 'Pending'}</span>
                    </div>
                    {asset.renewal_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-indigo-400" />
                        <span className="font-bold">Renewal:</span>
                        <span className="ml-1">{new Date(asset.renewal_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center">
                      View Asset <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'renewals' ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Expiring IP Registrations</h2>
                <span className="text-[10px] font-bold text-rose-500 uppercase">Action Required</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Asset Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Renewal Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expiringAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{asset.asset_name}</span>
                        <p className="text-[10px] text-gray-400 font-mono">#{asset.registration_number}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-[9px] font-black uppercase">{asset.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{asset.client?.contact_person}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-rose-600">
                          <Clock className="h-3.5 w-3.5 mr-2" />
                          <span className="text-sm font-black">{new Date(asset.renewal_date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm">
                          Start Renewal
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expiringAssets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="max-w-xs mx-auto">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
                          <h4 className="font-black text-gray-900 uppercase tracking-tight">All clear</h4>
                          <p className="text-xs text-gray-500 font-medium mt-1">No IP assets are due for renewal in the next 90 days.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Watch Monitors</h2>
                    <button className="text-indigo-600 hover:text-indigo-700 text-[10px] font-black uppercase tracking-widest">Add Term</button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {watches.map(watch => (
                      <div key={watch.id} className="p-6 hover:bg-gray-50 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">"{watch.monitored_term}"</h4>
                          <div className="flex items-center space-x-2">
                            {watch.new_matches_count > 0 && (
                              <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                                {watch.new_matches_count} Alerts
                              </span>
                            )}
                            <button className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <TrendingUp className="h-3 w-3 mr-1 text-indigo-500" />
                          Last Scan: {watch.last_checked_date ? new Date(watch.last_checked_date).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
                  <AlertTriangle className="h-8 w-8 mb-4 text-indigo-200" />
                  <h3 className="text-lg font-black leading-tight mb-2 uppercase tracking-tight">IP Watch Alerts</h3>
                  <p className="text-indigo-100 text-xs font-medium mb-6 opacity-90">We've detected 3 new trademark applications that may infringe on your client's registered marks.</p>
                  <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-md">
                    Review Matches
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
