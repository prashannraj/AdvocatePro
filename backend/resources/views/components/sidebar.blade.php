@php
    $currentRoute = request()->route() ? (request()->route()->getName() ?? '') : '';

    $isActive = function($route) use ($currentRoute) {
        if (empty($currentRoute)) return false;
        if ($route === 'dashboard') {
            return $currentRoute === 'dashboard';
        }
        $baseRoute = explode('.', $route)[0];
        return str_starts_with($currentRoute, $baseRoute);
    };

    $navItems = [
        ['name' => 'Dashboard', 'href' => '#', 'icon' => 'scale', 'route' => 'dashboard'],
        ['name' => 'Cases', 'href' => route('cases.index'), 'icon' => 'briefcase', 'route' => 'cases.index'],
    ];
@endphp

<div class="w-64 bg-indigo-900 text-white flex-shrink-0 flex flex-col h-screen sticky top-0">
    <div class="p-6 border-b border-indigo-800 flex items-center space-x-3">
        <div class="h-10 w-10 bg-white/10 rounded-xl p-1.5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <img 
                src="{{ asset('logo.png') }}" 
                alt="Logo" 
                class="h-full w-full object-contain filter brightness-0 invert" 
            />
        </div>
        <div>
            <h1 class="text-sm font-black text-white uppercase tracking-tighter leading-none">Advocate Pro</h1>
            <p class="text-[10px] font-bold text-indigo-300 mt-1 uppercase tracking-widest opacity-80">Management</p>
        </div>
    </div>
    <nav class="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        @foreach($navItems as $item)
            <a 
                href="{{ $item['href'] }}" 
                class="flex items-center space-x-3 p-2 rounded-lg transition-colors {{ $isActive($item['route']) ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800 text-indigo-100' }}"
            >
                <i data-lucide="{{ $item['icon'] }}" class="h-4 w-4"></i>
                <span class="text-sm">{{ $item['name'] }}</span>
            </a>
        @endforeach

        <div class="mt-auto pt-6 pb-2 text-center">
            <p class="text-[10px] text-indigo-400 font-medium uppercase tracking-widest">Developed By</p>
            <p class="text-xs text-white font-bold">Appan Technology Pvt. Ltd</p>
        </div>
    </nav>
</div>
