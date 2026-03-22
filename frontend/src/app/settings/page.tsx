'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FormField, { inputClasses, textareaClasses } from '@/components/FormField';
import FormSection from '@/components/FormSection';
import AlertModal from '@/components/AlertModal';
import { 
  Loader2,
  Save,
  Building2,
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Image as ImageIcon,
  Stamp,
  PenTool,
  Info
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
    <ResponsiveLayout user={user} title="Global Settings">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Firm Configuration</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Configure your office profile, letterhead branding, and contact details.</p>
          </div>
          
          <Button 
            onClick={handleSave}
            loading={isSaving}
            icon={Save}
            className="sm:w-auto w-full"
          >
            Save Changes
          </Button>
        </div>

        <div className="space-y-8 pb-24 sm:pb-8">
          <FormSection title="Office Identity" icon={Building2} variant="elevated">
            <div className="sm:col-span-2">
              <FormField label="Full Office Name" required>
                <input
                  type="text"
                  name="office_name"
                  className={inputClasses}
                  value={settings.office_name}
                  onChange={handleInputChange}
                />
              </FormField>
            </div>

            <FormField label="Primary Email">
              <input
                type="email"
                name="email"
                className={inputClasses}
                value={settings.email}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Landline Phone">
              <input
                type="text"
                name="phone"
                className={inputClasses}
                value={settings.phone}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField label="Mobile Number">
              <input
                type="text"
                name="mobile"
                className={inputClasses}
                value={settings.mobile}
                onChange={handleInputChange}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Physical Address" required>
                <textarea
                  name="address"
                  rows={2}
                  className={textareaClasses}
                  value={settings.address}
                  onChange={handleInputChange}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Letterhead Branding" icon={PenTool} variant="elevated">
            <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <FormField label="Firm Logo">
                  <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 transition-all hover:border-primary/30">
                    {settings.logo ? (
                      <img src={settings.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    )}
                    <input
                      type="file"
                      name="logo"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </FormField>
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Transparent PNG Recommended</p>
              </div>

              {/* Stamp Upload */}
              <div className="space-y-3">
                <FormField label="Office Stamp">
                  <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 transition-all hover:border-primary/30">
                    {settings.stamp ? (
                      <img src={settings.stamp} alt="Stamp" className="w-full h-full object-contain p-4" />
                    ) : (
                      <Stamp className="h-8 w-8 text-slate-300" />
                    )}
                    <input
                      type="file"
                      name="stamp"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </FormField>
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Round/Rectangular Stamp</p>
              </div>

              {/* Signature Upload */}
              <div className="space-y-3">
                <FormField label="Authorized Signature">
                  <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 transition-all hover:border-primary/30">
                    {settings.authorize_signature ? (
                      <img src={settings.authorize_signature} alt="Signature" className="w-full h-full object-contain p-4" />
                    ) : (
                      <PenTool className="h-8 w-8 text-slate-300" />
                    )}
                    <input
                      type="file"
                      name="authorize_signature"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </FormField>
                <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Clear Digital Signature</p>
              </div>
            </div>
          </FormSection>
        </div>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </ResponsiveLayout>
  );
}
