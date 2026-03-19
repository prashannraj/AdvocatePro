'use client';

export default function BrandedBadge() {
  return (
    <div className="fixed bottom-6 left-6 z-[9999] print:hidden">
      <div className="h-10 w-10 bg-gray-900 rounded-full border-2 border-indigo-500 p-2 shadow-2xl hover:scale-125 transition-all duration-300 flex items-center justify-center group cursor-pointer hover:bg-indigo-600 overflow-visible">
        <img 
          src="/logo without background.png" 
          alt="Logo" 
          className="h-full w-full object-contain filter brightness-0 invert" 
        />
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-gray-700 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
          Advocate Pro v1.0
        </div>
      </div>
    </div>
  );
}
