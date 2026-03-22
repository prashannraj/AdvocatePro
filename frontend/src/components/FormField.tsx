import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export default function FormField({ 
  label, 
  error, 
  children, 
  className,
  required 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <label className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      
      <div className="relative group">
        {children}
      </div>

      {error && (
        <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClasses = "w-full min-h-[52px] px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base sm:text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium transition-all group-hover:border-slate-300 disabled:opacity-50 disabled:bg-slate-50";

export const selectClasses = "w-full min-h-[52px] px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base sm:text-sm font-bold text-slate-900 appearance-none transition-all group-hover:border-slate-300 disabled:opacity-50 disabled:bg-slate-50";

export const textareaClasses = "w-full p-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base sm:text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium resize-none transition-all group-hover:border-slate-300 disabled:opacity-50 disabled:bg-slate-50";
