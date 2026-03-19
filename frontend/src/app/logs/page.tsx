'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { 
  Loader2,
  Search,
  History,
  User as UserIcon,
  Clock,
  Globe,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import Modal from '@/components/Modal';

interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  model_type: string | null;
  model_id: number | null;
  changes: any;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  } | null;
}

export default function LogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchBy] = useState('');
  
  // Details Modal
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    fetchLogs(page);
  }, [router, page]);

  const fetchLogs = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/activity-logs?page=${pageNum}`);
      setLogs(response.data.data);
      setPagination(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-700';
      case 'updated': return 'bg-blue-100 text-blue-700';
      case 'deleted': return 'bg-red-100 text-red-700';
      case 'logged_in': return 'bg-indigo-100 text-indigo-700';
      case 'logged_out': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  if (!user || loading && logs.length === 0) {
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
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
              value={searchTerm}
              onChange={(e) => setSearchBy(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
            <History className="h-4 w-4" />
            <span>System Audit Trail</span>
          </div>
        </header>

        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>
            <p className="text-gray-500 text-sm">Monitor user actions, system changes, and authentication history.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold uppercase">
                            {log.user?.name.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{log.user?.name || 'System'}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{log.ip_address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getActionBadgeClass(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 truncate max-w-xs">{log.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-900">
                            {new Date(log.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleShowDetails(log)}
                          className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">
                      No activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} logs
                </p>
                <div className="flex space-x-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1 border border-gray-200 rounded bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button 
                    disabled={page === pagination.last_page}
                    onClick={() => setPage(page + 1)}
                    className="p-1 border border-gray-200 rounded bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Activity Details"
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">User Agent</p>
                <p className="text-xs text-gray-600 break-words leading-relaxed font-medium">
                  {selectedLog.user_agent}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">IP Address</p>
                <p className="text-xs text-gray-600 font-mono font-bold">
                  {selectedLog.ip_address}
                </p>
              </div>
            </div>

            {selectedLog.changes && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-3 flex items-center">
                  <Info className="h-3 w-3 mr-1 text-indigo-600" />
                  Changes Recorded
                </p>
                <div className="space-y-3">
                  {selectedLog.changes.before && (
                    <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                      <p className="text-[10px] text-red-600 font-bold uppercase mb-2">Before</p>
                      <pre className="text-[10px] text-red-700 font-mono overflow-auto max-h-40">
                        {JSON.stringify(selectedLog.changes.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.changes.after && (
                    <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                      <p className="text-[10px] text-green-600 font-bold uppercase mb-2">After</p>
                      <pre className="text-[10px] text-green-700 font-mono overflow-auto max-h-40">
                        {JSON.stringify(selectedLog.changes.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedLog.changes && (
              <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">No granular data changes recorded for this action.</p>
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Close Details
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
