'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Lock, ShieldAlert, Loader2, Key, HelpCircle, CheckCircle2, Sparkles, PhoneCall, Gift } from 'lucide-react';

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activationKey, setActivationKey] = useState('');
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [expiryInfo, setExpiryInfo] = useState<{ expires_at: string | null, days_left: number } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkStatus();
  }, [pathname]);

  const checkStatus = async () => {
    try {
      const response = await api.get('/subscription/status');
      setIsActive(response.data.is_active);
      setExpiryInfo({
        expires_at: response.data.expires_at,
        days_left: response.data.days_left
      });
    } catch (err) {
      console.error('Failed to check subscription status:', err);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivating(true);
    setError('');
    try {
      const response = await api.post('/subscription/activate', { activation_key: activationKey });
      alert(response.data.message);
      setIsActive(true);
      checkStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Activation failed. Please check your key.');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="text-center">
          <div className="h-20 w-20 bg-indigo-600 rounded-3xl p-4 mx-auto mb-6 shadow-xl shadow-indigo-100 flex items-center justify-center animate-pulse">
            <img 
              src="/logo without background.png" 
              alt="Logo" 
              className="h-full w-full object-contain filter brightness-0 invert" 
            />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">
            Advocate Pro
          </p>
        </div>
      </div>
    );
  }

  // Allow access to login/public pages if needed, but usually, we block everything if expired
  if (!isActive) {
    return (
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto">
          {/* Left Column: Attractive Advertisement */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
              <ShieldAlert size={200} />
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-6">
                <Sparkles size={14} className="text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Premium Legal Tech</span>
              </div>
              <h2 className="text-4xl font-black leading-tight mb-4 tracking-tighter">
                Upgrade Your <br /> 
                <span className="text-indigo-300">Legal Practice.</span>
              </h2>
              <p className="text-indigo-100 text-sm font-medium mb-10 leading-relaxed max-w-xs">
                Empower your firm with the most advanced management system in Nepal. 
                Secure, efficient, and tailored for professional advocates.
              </p>

              <div className="space-y-6">
                {/* Pricing Cards */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">New Installation</span>
                    <div className="bg-yellow-400 text-indigo-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Best Value</div>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black">NPR. 25,000</span>
                    <span className="text-indigo-300 text-xs font-bold">/ Year</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-all">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block mb-2">Annual Renewal</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black">NPR. 10,000</span>
                    <span className="text-indigo-300 text-xs font-bold">/ Year</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Sales & Support</p>
                  <p className="text-sm font-black">+977-9807669230</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Activation Form */}
          <div className="p-10 lg:p-12 flex flex-col justify-center bg-white">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">System Activation</h3>
              <p className="text-gray-500 text-sm font-medium">Please enter your activation key to unlock the system.</p>
            </div>

            <form onSubmit={handleActivate} className="space-y-6">
              <div className="relative group">
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-[0.2em] group-focus-within:text-indigo-600 transition-colors">
                  Activation Key
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <Key size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ADV-2026-XXXX-XXXX"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-mono tracking-widest transition-all"
                    value={activationKey}
                    onChange={(e) => setActivationKey(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-500 text-[11px] mt-2 font-bold flex items-center italic">
                  <ShieldAlert size={12} className="mr-1" /> {error}
                </p>}
              </div>

              <button
                type="submit"
                disabled={activating || !activationKey}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 hover:shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-3"
              >
                {activating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying License...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Activate System</span>
                  </>
                )}
              </button>
            </form>

            {/* Trial Offer */}
            <div className="mt-8 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start space-x-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Gift size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-1">New to Advocate Pro?</h4>
                <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                  Try our **15-Day Free Demo Mode** to explore all premium features before you buy.
                </p>
                <p className="text-[10px] font-bold text-indigo-500 mt-2 italic">Key: ADV-2026-TRIAL-KEY</p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Developed by</p>
              <p className="text-xs font-black text-gray-700">Appan Technology Pvt. Ltd.</p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">Dhanusha, Nagarain-2, Nepal</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Small floating status for admins or users to see expiry date */}
      {expiryInfo?.expires_at && (
        <div className="fixed bottom-4 right-4 z-[999] print:hidden">
          <div className={`px-4 py-2 rounded-full shadow-lg border text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 ${
            expiryInfo.days_left < 30 ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-600 border-green-200'
          }`}>
            <div className={`h-2 w-2 rounded-full ${expiryInfo.days_left < 30 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span>Subscription Expires: {expiryInfo.expires_at} ({expiryInfo.days_left} days left)</span>
          </div>
        </div>
      )}
    </>
  );
}
