'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Loader2, Lock, Mail, Key, RefreshCw, Clock } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-100 border border-gray-100">
        <div className="text-center">
          <div className="h-24 w-24 bg-indigo-600 rounded-3xl p-4 mx-auto mb-6 shadow-xl shadow-indigo-200 flex items-center justify-center transform hover:scale-105 transition-transform">
            <img 
              src="/logo without background.png" 
              alt="Logo" 
              className="h-full w-full object-contain filter brightness-0 invert" 
            />
          </div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
            Advocate Pro
          </h2>
          <p className="mt-3 text-sm font-bold text-gray-500 uppercase tracking-widest">
            {step === 'login' ? 'Secure Workspace Login' : 'Two-Step Verification'}
          </p>
        </div>

        {step === 'login' ? (
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerLogin('email')}
                  type="email"
                  className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                {loginErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{loginErrors.email.message}</p>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerLogin('password')}
                  type="password"
                  className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                {loginErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{loginErrors.password.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                Next Step
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit(onOtpSubmit)}>
            <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-center">
              <p className="text-sm text-indigo-700 font-medium">
                We've sent a 6-digit code to <br />
                <span className="font-bold">{emailForOtp}</span>
              </p>
              <div className="mt-2 text-xs text-indigo-500 flex items-center justify-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Expires in <span className="font-bold">{timeLeft}s</span></span>
              </div>
            </div>

            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerOtp('otp')}
                  type="text"
                  maxLength={6}
                  autoFocus
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center tracking-[1em] font-mono text-xl"
                  placeholder="000000"
                />
                {otpErrors.otp && (
                  <p className="mt-1 text-xs text-red-600 text-center">{otpErrors.otp.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading || timeLeft === 0}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                Verify & Login
              </button>
              
              <div className="flex justify-between items-center px-1">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  Back to Login
                </button>
                
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timeLeft > 0 || resending}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:font-normal flex items-center"
                >
                  {resending ? <RefreshCw className="animate-spin h-3 w-3 mr-1" /> : null}
                  Resend OTP {timeLeft > 0 ? `(${timeLeft}s)` : ''}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Developed By</p>
          <p className="text-sm text-gray-600 font-bold">Appan Technology Pvt. Ltd</p>
        </div>
      </div>
    </div>
  );
}

