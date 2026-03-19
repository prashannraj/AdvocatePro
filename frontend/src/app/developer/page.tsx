'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Key, Plus, Trash2, CheckCircle2, XCircle, Loader2, ShieldCheck, Copy, ExternalLink } from 'lucide-react';

interface LicenseKey {
  id: number;
  key: string;
  client_name: string;
  is_used: boolean;
  used_at: string | null;
  generated_by: string;
  created_at: string;
}

export default function DeveloperPage() {
  const [masterKey, setMasterKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dev/license-keys', {
        headers: { 'X-Dev-Secret': masterKey }
      });
      setKeys(response.data);
      setIsAuthorized(true);
    } catch (err) {
      alert('Unauthorized: Invalid Master Secret Key');
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.post('/dev/license-keys', { client_name: clientName }, {
        headers: { 'X-Dev-Secret': masterKey }
      });
      setClientName('');
      fetchKeys();
    } catch (err) {
      alert('Failed to generate key');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this key?')) return;
    try {
      await api.delete(`/dev/license-keys/${id}`, {
        headers: { 'X-Dev-Secret': masterKey }
      });
      fetchKeys();
    } catch (err) {
      alert('Failed to delete key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Key copied to clipboard!');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 text-center">
          <ShieldCheck className="h-16 w-16 text-indigo-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Developer Portal</h1>
          <p className="text-gray-400 text-sm mb-8 font-medium">Restricted Access for Appan Technology Pvt. Ltd.</p>
          
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter Master Secret Key"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-white font-mono"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
            />
            <button
              onClick={fetchKeys}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
            >
              Access License Manager
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">License Management</h1>
            <p className="text-gray-500 text-sm font-medium">Appan Technology Pvt. Ltd. - Developer Console</p>
          </div>
          <button 
            onClick={() => setIsAuthorized(false)}
            className="text-xs font-bold text-gray-500 hover:text-red-600 uppercase tracking-widest"
          >
            Logout Portal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Generator Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center">
                <Plus className="h-4 w-4 mr-2 text-indigo-600" /> Generate New Key
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Client Name / Office</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kathmandu District Court"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={generating || !clientName}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Create Activation Key'}
                </button>
              </form>
            </div>
          </div>

          {/* Keys List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Active License Keys</h2>
                <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                  Total: {keys.length}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {keys.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                          No license keys generated yet.
                        </td>
                      </tr>
                    ) : (
                      keys.map((key) => (
                        <tr key={key.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{key.client_name}</p>
                            <p className="text-[10px] text-gray-400">Gen: {new Date(key.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                                {key.key}
                              </span>
                              <button 
                                onClick={() => copyToClipboard(key.key)}
                                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {key.is_used ? (
                              <div className="flex items-center text-green-600 space-x-1">
                                <CheckCircle2 size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Activated</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-amber-500 space-x-1">
                                <XCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Pending</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDelete(key.id)}
                              className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
