<?php

namespace App\Http\Controllers;

use App\Models\CaseRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\GeneralNotification;

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
            'department' => 'required|in:Litigation,Corporate,IPR,Other,Criminal,Civil',
            'description' => 'nullable|string',
            'client_id' => 'required|exists:clients,id',
            'lawyer_id' => 'required|exists:lawyers,id',
            'status' => 'required|in:Open,Pending,Closed',
            'court_id' => 'nullable|exists:courts,id',
            'filed_date' => 'required|string',
            'bs_year' => 'required|string',
            'case_type_code' => 'required|string',
        ]);

        // If case_number is provided manually, use it. Otherwise generate.
        $sequentialNumber = 0;
        if (empty($validated['case_number'])) {
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
        } else {
            $caseNumber = $validated['case_number'];
        }

        $case = CaseRecord::create(array_merge($validated, [
            'case_number' => $caseNumber,
            'sequential_number' => $sequentialNumber
        ]));

        $this->sendCaseNotification($case, 'created');

        return response()->json($case->load(['client', 'lawyer.user', 'court']), 201);
    }

    protected function sendCaseNotification(CaseRecord $case, $type)
    {
        $case->refresh();
        $case->load(['client.user', 'lawyer.user']);
        $clientUser = $case->client->user;
        $lawyerUser = $case->lawyer->user;

        $details = "
            Case Details:
            Title: {$case->title}
            Case Number: {$case->case_number}
            Status: {$case->status}
            Filed Date: {$case->filed_date}
        ";

        $subject = "Case " . ucfirst($type) . " - Advocate Pro";

        try {
            // Send to Client
            if ($clientUser && $clientUser->email) {
                Mail::to($clientUser->email)->send(new GeneralNotification(
                    "Dear {$clientUser->name},\n\nA case has been {$type} for you.\n{$details}\n\nRegards,\nAdvocate Pro Team",
                    $subject
                ));
            } else {
                Log::warning("Case notification not sent to client: User or email missing.");
            }

            // Send to Lawyer
            if ($lawyerUser && $lawyerUser->email) {
                Mail::to($lawyerUser->email)->send(new GeneralNotification(
                    "Dear Advocate {$lawyerUser->name},\n\nA case has been {$type} for you.\n{$details}\n\nRegards,\nAdvocate Pro Team",
                    $subject
                ));
            } else {
                Log::warning("Case notification not sent to lawyer: User or email missing.");
            }
        } catch (\Exception $e) {
            Log::error("Failed to send case notification: " . $e->getMessage());
        }
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
            'case_number' => 'nullable|string|unique:case_records,case_number,' . $case->id,
            'title' => 'required|string|max:255',
            'department' => 'required|in:Litigation,Corporate,IPR,Other',
            'description' => 'nullable|string',
            'client_id' => 'required|exists:clients,id',
            'lawyer_id' => 'required|exists:lawyers,id',
            'status' => 'required|in:Open,Pending,Closed',
            'court_id' => 'nullable|exists:courts,id',
            'filed_date' => 'required|string',
        ]);

        $case->update($validated);
        $this->sendCaseNotification($case, 'updated');
        return response()->json($case->load(['client', 'lawyer.user', 'court']));
    }

    public function destroy(CaseRecord $case)
    {
        $case->delete();
        return response()->json(null, 204);
    }
}
