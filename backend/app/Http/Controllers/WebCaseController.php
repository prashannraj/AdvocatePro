<?php

namespace App\Http\Controllers;

use App\Models\CaseRecord;
use App\Models\Client;
use App\Models\Lawyer;
use App\Models\Court;
use Illuminate\Http\Request;

class WebCaseController extends Controller
{
    public function index(Request $request)
    {
        $query = CaseRecord::with(['client', 'lawyer.user', 'court'])->latest();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('case_number', 'like', "%{$search}%");
            });
        }

        $cases = $query->paginate(10);

        return view('cases.index', compact('cases'));
    }

    public function create()
    {
        $clients = Client::orderBy('contact_person')->get();
        $lawyers = Lawyer::with('user')->get();
        $courts = Court::orderBy('name')->get();
        return view('cases.create', compact('clients', 'lawyers', 'courts'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'lawyer_id' => 'required|exists:lawyers,id',
            'court_id' => 'nullable|exists:courts,id',
            'case_number' => 'nullable|string|unique:case_records,case_number',
            'bs_year' => 'required|string',
            'case_type_code' => 'required|string',
            'sequential_number' => 'nullable|integer',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'filed_date' => 'required|date',
        ]);

        if (empty($validated['sequential_number'])) {
            $lastCase = CaseRecord::where('bs_year', $validated['bs_year'])
                ->where('case_type_code', $validated['case_type_code'])
                ->orderBy('sequential_number', 'desc')
                ->first();
            $validated['sequential_number'] = $lastCase ? $lastCase->sequential_number + 1 : 1;
        }

        if (empty($validated['case_number'])) {
            $formattedSeq = str_pad($validated['sequential_number'], 4, '0', STR_PAD_LEFT);
            $nepaliYear = $this->convertToNepaliDigits($validated['bs_year']);
            $nepaliSeq = $this->convertToNepaliDigits($formattedSeq);
            $validated['case_number'] = "{$nepaliYear}-{$validated['case_type_code']}-{$nepaliSeq}";
        }

        CaseRecord::create($validated);

        return redirect()->route('cases.index')->with('success', 'Case created successfully.');
    }

    public function show(CaseRecord $case)
    {
        $case->load(['client', 'lawyer.user', 'court', 'hearings', 'documents']);
        return view('cases.show', compact('case'));
    }

    public function edit(CaseRecord $case)
    {
        $clients = Client::orderBy('contact_person')->get();
        $lawyers = Lawyer::with('user')->get();
        $courts = Court::orderBy('name')->get();
        return view('cases.edit', compact('case', 'clients', 'lawyers', 'courts'));
    }

    public function update(Request $request, CaseRecord $case)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'lawyer_id' => 'required|exists:lawyers,id',
            'court_id' => 'nullable|exists:courts,id',
            'case_number' => 'required|string|unique:case_records,case_number,' . $case->id,
            'bs_year' => 'required|string',
            'case_type_code' => 'required|string',
            'sequential_number' => 'nullable|integer',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'filed_date' => 'required|date',
        ]);

        $case->update($validated);

        return redirect()->route('cases.index')->with('success', 'Case updated successfully.');
    }

    public function destroy(CaseRecord $case)
    {
        $case->delete();
        return redirect()->route('cases.index')->with('success', 'Case deleted successfully.');
    }

    private function convertToNepaliDigits($number)
    {
        $eng = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $nep = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return str_replace($eng, $nep, (string)$number);
    }
}
