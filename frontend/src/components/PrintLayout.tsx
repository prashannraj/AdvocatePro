'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface Settings {
  office_name: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  logo?: string;
}

interface PrintLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function PrintLayout({ children, title }: PrintLayoutProps) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings for print:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Letter Pad Header - Visible only on print or when specifically needed */}
      <header className="hidden print:flex flex-col border-b-2 border-indigo-600 pb-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-indigo-900 uppercase tracking-tighter mb-1">
              {settings?.office_name || 'Advocate Office'}
            </h1>
            <p className="text-indigo-600 font-bold text-sm tracking-widest uppercase">
              Legal Consultancy & Advocacy Services
            </p>
          </div>
          {settings?.logo && (
            <img src={settings.logo} alt="Logo" className="h-16 w-auto object-contain" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-[10px] text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-50 p-1 rounded text-indigo-600">
              <MapPin size={10} />
            </div>
            <span className="font-medium truncate">{settings?.address || 'Office Address'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-50 p-1 rounded text-indigo-600">
              <Phone size={10} />
            </div>
            <span className="font-medium">{settings?.phone || settings?.mobile || 'Contact Number'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-50 p-1 rounded text-indigo-600">
              <Mail size={10} />
            </div>
            <span className="font-medium">{settings?.email || 'office@example.com'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative">
        {title && (
          <div className="hidden print:block mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 inline-block px-8 uppercase tracking-widest">
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>

      {/* Letter Pad Footer - Visible only on print */}
      <footer className="hidden print:flex flex-col items-center justify-center mt-12 pt-6 border-t border-gray-100">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-6 w-6 bg-indigo-900 rounded-md flex items-center justify-center text-white font-bold text-[10px]">A</div>
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Advocate Pro Management System</span>
        </div>
        <p className="text-[10px] text-gray-600 font-bold mb-1">Developed by: Appan Technology Pvt. Ltd</p>
        <p className="text-[8px] text-gray-400 font-medium italic">
          This is a computer-generated report. No signature required. 
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </footer>

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 2cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            background-color: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
          .print\:flex {
            display: flex !important;
          }
          .print\:block {
            display: block !important;
          }
          .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          .border {
            border-color: #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
}
