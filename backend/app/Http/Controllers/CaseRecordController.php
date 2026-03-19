<?php

namespace App\Http\Controllers;

use App\Models\CaseRecord;
use Illuminate\Http\Request;

class CaseRecordController extends Controller
{
    public function index()
    {
        return response()->json(CaseRecord::with(['client', 'hearings', 'lawyer.user', 'court'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_number' => 'nullable|string|unique:case_records,case_number',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client_id' => 'required|exists:clients,id',
            'lawyer_id' => 'required|exists:lawyers,id',
            'status' => 'required|in:Open,Pending,Closed',
            'court_id' => 'required|exists:courts,id',
            'filed_date' => 'required|date',
            'bs_year' => 'required|string',
            'case_type_code' => 'required|string',
        ]);

        // If case_number is provided manually, use it. Otherwise generate.
        if (!empty($validated['case_number'])) {
            $caseNumber = $validated['case_number'];
            $sequentialNumber = 0; // Manual entry doesn't have a system sequence
        } else {
            // Generate sequential number for the BS Year and Case Type
            $lastCase = CaseRecord::where('bs_year', $validated['bs_year'])
                ->where('case_type_code', $validated['case_type_code'])
                ->orderBy('sequential_number', 'desc')
                ->first();

            $sequentialNumber = $lastCase ? $lastCase->sequential_number + 1 : 1;
            $formattedSeq = str_pad($sequentialNumber, 4, '0', STR_PAD_LEFT);
            
            // Convert year and seq to Nepali digits for the official case_number string
            $nepaliYear = $this->convertToNepaliDigits($validated['bs_year']);
            $nepaliSeq = $this->convertToNepaliDigits($formattedSeq);
            
            $caseNumber = "{$nepaliYear}-{$validated['case_type_code']}-{$nepaliSeq}";
        }

        $case = CaseRecord::create(array_merge($validated, [
            'case_number' => $caseNumber,
            'sequential_number' => $sequentialNumber
        ]));

        return response()->json($case, 201);
    }

    private function convertToNepaliDigits($number)
    {
        $eng = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $nep = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return str_replace($eng, $nep, (string)$number);
    }

    public function show(CaseRecord $case)
    {
        return response()->json($case->load(['client', 'hearings', 'lawyer.user', 'court']));
    }

    public function update(Request $request, CaseRecord $case)
    {
        $validated = $request->validate([
            'case_number' => 'sometimes|string|unique:case_records,case_number,' . $case->id,
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'client_id' => 'sometimes|exists:clients,id',
            'lawyer_id' => 'sometimes|exists:lawyers,id',
            'status' => 'sometimes|in:Open,Pending,Closed',
            'court_id' => 'sometimes|exists:courts,id',
            'filed_date' => 'sometimes|date',
            'closed_date' => 'nullable|date',
            'bs_year' => 'sometimes|string',
            'case_type_code' => 'sometimes|string',
        ]);

        // If case_number is provided manually, use it. 
        // If not provided, check if BS Year or Case Type changed - if so, we need to regenerate Case Number
        if (!isset($validated['case_number'])) {
            $isOldCase = str_starts_with($case->case_number, 'CASE-');
            $yearChanged = isset($validated['bs_year']) && $validated['bs_year'] !== $case->bs_year;
            $typeChanged = isset($validated['case_type_code']) && $validated['case_type_code'] !== $case->case_type_code;

            if ($yearChanged || $typeChanged || $isOldCase) {
                $year = $validated['bs_year'] ?? ($case->bs_year ?: '080');
                $type = $validated['case_type_code'] ?? ($case->case_type_code ?: 'WO');

                $lastCase = CaseRecord::where('bs_year', $year)
                    ->where('case_type_code', $type)
                    ->orderBy('sequential_number', 'desc')
                    ->first();

                $sequentialNumber = $lastCase ? $lastCase->sequential_number + 1 : 1;
                $formattedSeq = str_pad($sequentialNumber, 4, '0', STR_PAD_LEFT);
                
                $nepaliYear = $this->convertToNepaliDigits($year);
                $nepaliSeq = $this->convertToNepaliDigits($formattedSeq);
                
                $validated['case_number'] = "{$nepaliYear}-{$type}-{$nepaliSeq}";
                $validated['sequential_number'] = $sequentialNumber;
                $validated['bs_year'] = $year;
                $validated['case_type_code'] = $type;
            }
        }

        $case->update($validated);
        return response()->json($case);
    }

    public function destroy(CaseRecord $case)
    {
        $case->delete();
        return response()->json(null, 204);
    }
}
