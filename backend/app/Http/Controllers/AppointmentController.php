<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    public function index()
    {
        return response()->json(Appointment::with(['client', 'lawyer'])->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'lawyer_id' => 'required|exists:lawyers,id',
            'appointment_date' => 'required|string',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'status' => 'required|in:Pending,Confirmed,Cancelled',
        ]);

        $appointment = Appointment::create($validated);
        $this->sendAppointmentNotification($appointment, 'scheduled');

        return response()->json($appointment, 201);
    }

    public function show(Appointment $appointment)
    {
        return response()->json($appointment->load(['client', 'lawyer']));
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'lawyer_id' => 'sometimes|exists:lawyers,id',
            'appointment_date' => 'sometimes|string',
            'start_time' => 'sometimes|string',
            'end_time' => 'sometimes|string',
            'status' => 'sometimes|in:Pending,Confirmed,Cancelled',
        ]);

        $appointment->update($validated);
        $this->sendAppointmentNotification($appointment, 'updated');

        return response()->json($appointment);
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(null, 204);
    }

    protected function sendAppointmentNotification(Appointment $appointment, $type)
    {
        $appointment->load(['client.user', 'lawyer.user']);
        $clientUser = $appointment->client->user;
        $lawyerUser = $appointment->lawyer->user;

        $details = "
            Appointment Details:
            Date: {$appointment->appointment_date}
            Time: {$appointment->start_time} - {$appointment->end_time}
            Status: {$appointment->status}
        ";

        $subject = "Appointment " . ucfirst($type) . " - Advocate Pro";

        try {
            // Send to Client
            if ($clientUser && $clientUser->email) {
                Mail::raw("Dear {$clientUser->name},\n\nAn appointment has been {$type} for you.\n{$details}\n\nRegards,\nAdvocate Pro Team", function ($message) use ($clientUser, $subject) {
                    $message->to($clientUser->email)->subject($subject);
                });
            }

            // Send to Lawyer
            if ($lawyerUser && $lawyerUser->email) {
                Mail::raw("Dear Advocate {$lawyerUser->name},\n\nAn appointment has been {$type} for you.\n{$details}\n\nRegards,\nAdvocate Pro Team", function ($message) use ($lawyerUser, $subject) {
                    $message->to($lawyerUser->email)->subject($subject);
                });
            }
        } catch (\Exception $e) {
            Log::error("Failed to send appointment notification: " . $e->getMessage());
        }
    }
}
