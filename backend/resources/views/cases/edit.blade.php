@extends('layouts.app')

@section('title', 'Edit Case - Advocate Pro')

@section('content')
<div class="max-w-4xl mx-auto">
    <div class="mb-8 flex items-center space-x-4">
        <a href="{{ route('cases.index') }}" class="p-2 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
            <i data-lucide="arrow-left" class="h-5 w-5"></i>
        </a>
        <div>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight">Edit Case Record</h1>
            <p class="text-gray-500 font-medium mt-1">Update information for case: {{ $case->case_number }}</p>
        </div>
    </div>

    <form action="{{ route('cases.update', $case->id) }}" method="POST">
        @csrf
        @method('PUT')
        
        <div class="space-y-6">
            <!-- Case Identification -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div class="flex items-center space-x-3 mb-6">
                    <div class="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <i data-lucide="fingerprint" class="h-4 w-4"></i>
                    </div>
                    <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest">Case Identification</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="relative group">
                        <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Case ID</label>
                        <input 
                            type="text" 
                            name="case_number" 
                            value="{{ old('case_number', $case->case_number) }}"
                            required
                            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all font-mono font-bold"
                            placeholder="e.g., ०८१-WO-०००१"
                        >
                        <p class="mt-1 text-[9px] text-gray-400 italic">This is the unique identifier for this case.</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="relative group">
                            <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">BS Year</label>
                            <input 
                                type="text" 
                                name="bs_year" 
                                value="{{ old('bs_year', $case->bs_year) }}"
                                required
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                                placeholder="e.g., 081"
                            >
                        </div>

                        <div class="relative group">
                            <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Type Code</label>
                            <select 
                                name="case_type_code" 
                                required
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all appearance-none"
                            >
                                <option value="WO" {{ old('case_type_code', $case->case_type_code) == 'WO' ? 'selected' : '' }}>WO</option>
                                <option value="CP" {{ old('case_type_code', $case->case_type_code) == 'CP' ? 'selected' : '' }}>CP</option>
                                <option value="CR" {{ old('case_type_code', $case->case_type_code) == 'CR' ? 'selected' : '' }}>CR</option>
                                <option value="RE" {{ old('case_type_code', $case->case_type_code) == 'RE' ? 'selected' : '' }}>RE</option>
                            </select>
                        </div>
                    </div>
                    
                    <input type="hidden" name="sequential_number" value="{{ $case->sequential_number }}">
                </div>
            </div>

            <!-- Basic Details -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div class="flex items-center space-x-3 mb-6">
                    <div class="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                        <i data-lucide="file-text" class="h-4 w-4"></i>
                    </div>
                    <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest">Case Details</h2>
                </div>

                <div class="space-y-6">
                    <div class="relative group">
                        <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Case Title</label>
                        <input 
                            type="text" 
                            name="title" 
                            value="{{ old('title', $case->title) }}"
                            required
                            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all font-bold"
                            placeholder="e.g., Client Name vs Opposite Party"
                        >
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="relative group">
                            <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Client</label>
                            <select 
                                name="client_id" 
                                required
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all appearance-none"
                            >
                                @foreach($clients as $client)
                                    <option value="{{ $client->id }}" {{ old('client_id', $case->client_id) == $client->id ? 'selected' : '' }}>{{ $client->contact_person }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="relative group">
                            <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Assigned Lawyer</label>
                            <select 
                                name="lawyer_id" 
                                required
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all appearance-none"
                            >
                                @foreach($lawyers as $lawyer)
                                    <option value="{{ $lawyer->id }}" {{ old('lawyer_id', $case->lawyer_id) == $lawyer->id ? 'selected' : '' }}>{{ $lawyer->user->name }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="relative group">
                            <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Court</label>
                            <select 
                                name="court_id" 
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all appearance-none"
                            >
                                <option value="">Unassigned</option>
                                @foreach($courts as $court)
                                    <option value="{{ $court->id }}" {{ old('court_id', $case->court_id) == $court->id ? 'selected' : '' }}>{{ $court->name }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="relative group">
                            <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Filed Date</label>
                            <input 
                                type="date" 
                                name="filed_date" 
                                value="{{ old('filed_date', $case->filed_date->format('Y-m-d')) }}"
                                required
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                            >
                        </div>

                        <div class="relative group">
                            <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Initial Status</label>
                            <select 
                                name="status" 
                                required
                                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all appearance-none"
                            >
                                <option value="Active" {{ old('status', $case->status) == 'Active' ? 'selected' : '' }}>Active</option>
                                <option value="Pending" {{ old('status', $case->status) == 'Pending' ? 'selected' : '' }}>Pending</option>
                                <option value="Closed" {{ old('status', $case->status) == 'Closed' ? 'selected' : '' }}>Closed</option>
                            </select>
                        </div>
                    </div>

                    <div class="relative group">
                        <label class="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest group-focus-within:text-indigo-600 transition-colors">Description</label>
                        <textarea 
                            name="description" 
                            rows="4"
                            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all resize-none"
                            placeholder="Brief overview of the case..."
                        >{{ old('description', $case->description) }}</textarea>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end space-x-4 pb-12">
                <a href="{{ route('cases.index') }}" class="px-8 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Cancel</a>
                <button type="submit" class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Update Case Record</button>
            </div>
        </div>
    </form>
</div>
@endsection
