@extends('layouts.app')

@section('title', 'Cases - Advocate Pro')

@section('content')
<div class="mb-8 flex justify-between items-end">
    <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Case Records</h1>
        <p class="text-gray-500 font-medium mt-1">Track and manage all legal proceedings.</p>
    </div>
    <a href="{{ route('cases.create') }}" 
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2"
    >
        <i data-lucide="plus" class="h-4 w-4 text-white"></i>
        <span>New Case</span>
    </a>
</div>

@if(session('success'))
<div class="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center space-x-3">
    <i data-lucide="check-circle" class="h-5 w-5 text-emerald-500"></i>
    <p class="text-sm font-bold">{{ session('success') }}</p>
</div>
@endif

<!-- Search -->
<div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
    <form action="{{ route('cases.index') }}" method="GET" class="relative w-96">
        <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"></i>
        <input 
            type="text" 
            name="search"
            value="{{ request('search') }}"
            placeholder="Search by title or case number..."
            class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
        >
    </form>
</div>

<!-- Cases Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    @forelse($cases as $case)
    <div class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4">
            <span class="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest {{ $case->status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400' }}">
                {{ $case->status }}
            </span>
        </div>
        
        <div class="mb-4">
            <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{{ $case->case_number }}</p>
            <h3 class="font-black text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                <a href="{{ route('cases.show', $case->id) }}">{{ $case->title }}</a>
            </h3>
        </div>

        <div class="space-y-3 mb-6">
            <div class="flex items-center text-xs text-gray-500">
                <i data-lucide="user" class="h-3.5 w-3.5 mr-2 text-gray-400"></i>
                <span class="font-bold">Client:</span>
                <span class="ml-1 truncate">{{ $case->client->contact_person }}</span>
            </div>
            <div class="flex items-center text-xs text-gray-500">
                <i data-lucide="gavel" class="h-3.5 w-3.5 mr-2 text-gray-400"></i>
                <span class="font-bold">Court:</span>
                <span class="ml-1 truncate">{{ $case->court->name ?? 'N/A' }}</span>
            </div>
            <div class="flex items-center text-xs text-gray-500">
                <i data-lucide="calendar" class="h-3.5 w-3.5 mr-2 text-gray-400"></i>
                <span class="font-bold">Filed:</span>
                <span class="ml-1">{{ $case->filed_date->format('M d, Y') }}</span>
            </div>
        </div>

        <div class="pt-4 border-t border-gray-50 flex items-center justify-between">
            <div class="flex items-center -space-x-2">
                <div class="h-7 w-7 rounded-lg bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase" title="Lawyer: {{ $case->lawyer->user->name }}">
                    {{ $case->lawyer->user->name[0] }}
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <a href="{{ route('cases.show', $case->id) }}" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <i data-lucide="eye" class="h-4 w-4"></i>
                </a>
                <a href="{{ route('cases.edit', $case->id) }}" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <i data-lucide="edit-3" class="h-4 w-4"></i>
                </a>
                <form action="{{ route('cases.destroy', $case->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this case record?')">
                    @csrf
                    @method('DELETE')
                    <button class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>
    @empty
    <div class="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <i data-lucide="briefcase" class="h-12 w-12 text-gray-200 mx-auto mb-4"></i>
        <p class="text-sm text-gray-400 font-bold uppercase tracking-widest">No cases found</p>
    </div>
    @endforelse
</div>

@if($cases->hasPages())
<div class="mt-8">
    {{ $cases->links() }}
</div>
@endif
@endsection
