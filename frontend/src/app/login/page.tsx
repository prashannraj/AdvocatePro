'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Loader2, Lock, Mail, Key, RefreshCw, Clock, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import FormField, { inputClasses } from '@/components/FormField';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be exactly 6 digits' }),
});

type LoginForm = z.infer<typeof loginSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [emailForOtp, setEmailForOtp] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(120);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setValue: setOtpValue,
    formState: { errors: otpErrors },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post('/login', data);
      if (response.data.requires_otp) {
        setStep('otp');
        setEmailForOtp(response.data.email);
        setTimeLeft(120); // Start 120s countdown
      } else {
        // Direct login for bypassed users (e.g., admin@advocate.com)
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpForm) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post('/verify-otp', {
        email: emailForOtp,
        otp: data.otp,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/resend-otp', { email: emailForOtp });
      setSuccess('OTP resent successfully!');
      setTimeLeft(120); // Reset timer
      setOtpValue('otp', ''); // Clear input
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-white relative z-10">
        <div className="text-center">
          <div className="h-20 w-20 bg-primary rounded-3xl p-4 mx-auto mb-6 shadow-2xl shadow-primary/20 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
            <img 
              src="/logo without background.png" 
              alt="Logo" 
              className="h-full w-full object-contain filter brightness-0 invert" 
            />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            Advocate Pro
          </h2>
          <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            {step === 'login' ? 'Secure Workspace Login' : 'Two-Step Verification'}
          </p>
        </div>

        {step === 'login' ? (
          <form className="mt-10 space-y-6" onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <div className="space-y-4">
              <FormField label="Email Address" error={loginErrors.email?.message}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    {...registerLogin('email')}
                    type="email"
                    className={cn(inputClasses, "pl-11")}
                    placeholder="advocate@example.com"
                  />
                </div>
              </FormField>

              <FormField label="Access Password" error={loginErrors.password?.message}>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    {...registerLogin('password')}
                    type="password"
                    className={cn(inputClasses, "pl-11")}
                    placeholder="••••••••"
                  />
                </div>
              </FormField>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full h-14 text-sm font-black uppercase tracking-widest"
              icon={ChevronRight}
            >
              Continue to Workspace
            </Button>
          </form>
        ) : (
          <form className="mt-10 space-y-6" onSubmit={handleOtpSubmit(onOtpSubmit)}>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Sent to Secure Email</p>
              <p className="text-sm font-black text-slate-900 mb-4">{emailForOtp}</p>
              
              <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest">
                <Clock className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-slate-400">Expires in</span>
                <span className="text-primary">{timeLeft}s</span>
              </div>
            </div>

            <FormField label="Verification Code" error={otpErrors.otp?.message}>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...registerOtp('otp')}
                  type="text"
                  maxLength={6}
                  autoFocus
                  className={cn(inputClasses, "pl-11 text-center tracking-[0.8em] font-black text-xl")}
                  placeholder="000000"
                />
              </div>
            </FormField>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <p className="text-xs font-bold text-emerald-600 text-center">{success}</p>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                loading={loading}
                disabled={timeLeft === 0}
                className="w-full h-14 text-sm font-black uppercase tracking-widest"
              >
                Verify & Login
              </Button>
              
              <div className="flex justify-between items-center px-2">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors"
                >
                  Back to Login
                </button>
                
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timeLeft > 0 || resending}
                  className="text-[10px] font-black text-primary hover:text-indigo-700 disabled:text-slate-300 uppercase tracking-widest transition-colors flex items-center"
                >
                  {resending && <RefreshCw className="animate-spin h-3 w-3 mr-1.5" />}
                  Resend OTP {timeLeft > 0 ? `(${timeLeft}s)` : ''}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Precision Developed By</p>
          <p className="text-xs text-slate-900 font-black uppercase tracking-tighter">Appan Technology Pvt. Ltd</p>
        </div>
      </div>
    </div>
  );
}

