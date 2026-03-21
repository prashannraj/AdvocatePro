<?php

namespace App\Http\Controllers;

use App\Models\Hearing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\GeneralNotification;

class HearingController extends Controller
{
    public function index()
    {
        return response()->json(Hearing::with('caseRecord')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'required|exists:case_records,id',
            'hearing_date' => 'required|string',
            'judge_name' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'required|in:Scheduled,Adjourned,Completed',
        ]);

        $hearing = Hearing::create($validated);
        $this->sendHearingNotification($hearing, 'scheduled');
        
        return response()->json($hearing, 201);
    }

    public function show(Hearing $hearing)
    {
        return response()->json($hearing->load('caseRecord'));
    }

    public function update(Request $request, Hearing $hearing)
    {
        $validated = $request->validate([
            'case_id' => 'sometimes|exists:case_records,id',
            'hearing_date' => 'sometimes|string',
            'judge_name' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:Scheduled,Adjourned,Completed',
        ]);

        $hearing->update($validated);
        $this->sendHearingNotification($hearing, 'updated');

        return response()->json($hearing);
    }

    public function destroy(Hearing $hearing)
    {
        $hearing->delete();
        return response()->json(null, 204);
    }

    protected function sendHearingNotification(Hearing $hearing, $type)
    {
        $hearing->refresh();
        $hearing->load(['caseRecord.client.user', 'caseRecord.lawyer.user']);
        $case = $hearing->caseRecord;
        $clientUser = $case->client->user;
        $lawyerUser = $case->lawyer->user;

        $details = "
            Hearing Details:
            Case: {$case->title} (#{$case->case_number})
            Date: {$hearing->hearing_date}
            Judge: {$hearing->judge_name}
            Status: {$hearing->status}
            Notes: " . ($hearing->notes ?? 'N/A') . "
        ";

        $subject = "Hearing " . ucfirst($type) . " - Advocate Pro";

        try {
            // Send to Client
            if ($clientUser && $clientUser->email) {
                Mail::to($clientUser->email)->send(new GeneralNotification(
                    "Dear {$clientUser->name},\n\nA hearing has been {$type} for your case.\n{$details}\n\nRegards,\nAdvocate Pro Team",
                    $subject
                ));
            } else {
                Log::warning("Hearing notification not sent to client: User or email missing.");
            }

            // Send to Lawyer
            if ($lawyerUser && $lawyerUser->email) {
                Mail::to($lawyerUser->email)->send(new GeneralNotification(
                    "Dear Advocate {$lawyerUser->name},\n\nA hearing has been {$type} for your assigned case.\n{$details}\n\nRegards,\nAdvocate Pro Team",
                    $subject
                ));
            } else {
                Log::warning("Hearing notification not sent to lawyer: User or email missing.");
            }
        } catch (\Exception $e) {
            Log::error("Failed to send hearing notification: " . $e->getMessage());
        }
    }
}
