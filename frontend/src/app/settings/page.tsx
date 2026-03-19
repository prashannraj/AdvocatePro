'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import AlertModal from '@/components/AlertModal';
import { 
  Loader2,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    office_name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    logo: '',
    stamp: '',
    authorize_signature: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
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
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, [name]: reader.result as string }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/settings', settings);
      setAlertConfig({
        isOpen: true,
        title: 'Settings Saved',
        message: 'Your office settings and branding have been updated successfully.',
        type: 'success'
      });
      // Trigger branding update event
      window.dispatchEvent(new CustomEvent('branding-updated'));
    } catch (error: any) {
      console.error('Error saving settings:', error);
      
      let errorMessage = 'Failed to save settings. Please try again later.';
      const serverMessage = error.response?.data?.message || error.message;

      // Filter out raw SQL error messages to be user-friendly
      if (serverMessage?.includes('Data too long for column')) {
        errorMessage = 'One or more images are too large to save. Please try using a smaller image file or a compressed version.';
      } else if (serverMessage?.includes('Network Error')) {
        errorMessage = 'Network Error: Could not connect to the server. Please check your internet connection.';
      }

      setAlertConfig({
        isOpen: true,
        title: 'Save Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      {/* Custom Alert Modal */}
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-gray-800">Office Settings</h1>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm disabled:bg-indigo-400"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </header>

        <main className="p-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="office_name" className="block text-sm font-medium text-gray-700">Office Name</label>
                    <input type="text" name="office_name" id="office_name" value={settings.office_name || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" value={settings.email || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" name="phone" id="phone" value={settings.phone || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input type="text" name="mobile" id="mobile" value={settings.mobile || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea name="address" id="address" value={settings.address || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Branding</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {settings.logo && <img src={settings.logo} alt="Logo" className="h-16 w-16 object-contain rounded-md bg-gray-100"/>}
                    <div>
                      <label htmlFor="logo" className="block text-sm font-medium text-gray-700">Logo</label>
                      <input type="file" name="logo" id="logo" onChange={handleFileChange} className="mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {settings.stamp && <img src={settings.stamp} alt="Stamp" className="h-16 w-16 object-contain rounded-md bg-gray-100"/>}
                    <div>
                      <label htmlFor="stamp" className="block text-sm font-medium text-gray-700">Stamp</label>
                      <input type="file" name="stamp" id="stamp" onChange={handleFileChange} className="mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {settings.authorize_signature && <img src={settings.authorize_signature} alt="Signature" className="h-16 w-16 object-contain rounded-md bg-gray-100"/>}
                    <div>
                      <label htmlFor="authorize_signature" className="block text-sm font-medium text-gray-700">Authorized Signature</label>
                      <input type="file" name="authorize_signature" id="authorize_signature" onChange={handleFileChange} className="mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
