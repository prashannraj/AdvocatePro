@extends('layouts.app')

@section('title', 'Case Details - Advocate Pro')

@section('content')
<div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center space-x-4">
            <a href="{{ route('cases.index') }}" class="p-2 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                <i data-lucide="arrow-left" class="h-5 w-5"></i>
            </a>
            <div>
                <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{{ $case->case_number }}</p>
                <h1 class="text-3xl font-black text-gray-900 tracking-tight">{{ $case->title }}</h1>
            </div>
        </div>
        <div class="flex items-center space-x-3">
            <span class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest {{ $case->status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100' }}">
                {{ $case->status }}
            </span>
            <a href="{{ route('cases.edit', $case->id) }}" class="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center space-x-2">
                <i data-lucide="edit-3" class="h-4 w-4"></i>
                <span>Edit Case</span>
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
            <!-- Overview -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center">
                    <i data-lucide="info" class="h-4 w-4 mr-2 text-indigo-600"></i>
                    Case Overview
                </h2>
                <div class="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                    {!! nl2br(e($case->description ?? 'No description provided for this case.')) !!}
                </div>
            </div>

            <!-- Case Identification Details -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center">
                    <i data-lucide="fingerprint" class="h-4 w-4 mr-2 text-indigo-600"></i>
                    Identification Details
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Official Case ID</p>
                        <p class="text-sm font-black text-gray-900 font-mono">{{ $case->case_number }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">BS Year</p>
                        <p class="text-sm font-black text-gray-900">{{ $case->bs_year }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type Code</p>
                        <p class="text-sm font-black text-gray-900">{{ $case->case_type_code }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sequential #</p>
                        <p class="text-sm font-black text-gray-900 font-mono">{{ str_pad($case->sequential_number, 4, '0', STR_PAD_LEFT) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar Details -->
        <div class="space-y-8">
            <!-- Involved Parties -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Parties Involved</h2>
                <div class="space-y-6">
                    <div class="flex items-start space-x-4">
                        <div class="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                            <i data-lucide="user" class="h-5 w-5"></i>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</p>
                            <p class="text-sm font-black text-gray-900 leading-tight">{{ $case->client->contact_person }}</p>
                            <p class="text-[10px] text-gray-500 mt-0.5">{{ $case->client->company_name ?? 'Individual' }}</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-4">
                        <div class="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                            <i data-lucide="briefcase" class="h-5 w-5"></i>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Lawyer</p>
                            <p class="text-sm font-black text-gray-900 leading-tight">{{ $case->lawyer->user->name }}</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-4">
                        <div class="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-sm border border-cyan-100">
                            <i data-lucide="gavel" class="h-5 w-5"></i>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Court</p>
                            <p class="text-sm font-black text-gray-900 leading-tight">{{ $case->court->name ?? 'Not Assigned' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Timeline -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Key Dates</h2>
                <div class="space-y-4">
                    <div class="flex justify-between items-center py-2 border-b border-gray-50">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Filed Date</span>
                        <span class="text-sm font-black text-gray-900">{{ $case->filed_date->format('M d, Y') }}</span>
                    </div>
                    @if($case->closed_date)
                    <div class="flex justify-between items-center py-2 border-b border-gray-50">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Closed Date</span>
                        <span class="text-sm font-black text-rose-600">{{ $case->closed_date->format('M d, Y') }}</span>
                    </div>
                    @endif
                    <div class="flex justify-between items-center py-2">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Updated</span>
                        <span class="text-xs text-gray-500 font-medium">{{ $case->updated_at->diffForHumans() }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
