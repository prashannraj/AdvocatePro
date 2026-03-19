<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CaseRecord;
use App\Models\Client;
use App\Models\Hearing;
use App\Models\Contract;
use App\Models\Document;
use App\Models\Appointment;
use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\Court;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $totalCases = CaseRecord::count();
        $activeClients = Client::count();
        $hearingsToday = Hearing::whereDate('hearing_date', Carbon::today())->count();
        $pendingContracts = Contract::where('status', 'Draft')->count();
        
        // New features stats
        $totalAppointments = Appointment::count();
        $totalCourts = Court::count();
        $todayAttendance = Attendance::whereDate('date', Carbon::today())->count();
        $pendingPayroll = Payroll::where('status', 'Pending')->count();

        $upcomingHearingsQuery = Hearing::with('caseRecord')
            ->where('hearing_date', '>=', Carbon::today());

        if ($search) {
            $upcomingHearingsQuery->whereHas('caseRecord', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('case_number', 'like', "%{$search}%");
            });
        }

        $upcomingHearings = $upcomingHearingsQuery
            ->orderBy('hearing_date', 'asc')
            ->orderBy('created_at', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($hearing) {
                return [
                    'id' => $hearing->id,
                    'case_title' => $hearing->caseRecord->title,
                    'case_number' => $hearing->caseRecord->case_number,
                    'hearing_date' => $hearing->hearing_date,
                    'time' => '10:00 AM', // Placeholder
                    'court' => 'District Court 4', // Placeholder
                    'status' => $hearing->status,
                ];
            });

        $recentDocumentsQuery = Document::latest();

        if ($search) {
            $recentDocumentsQuery->where('file_name', 'like', "%{$search}%");
        }

        $recentDocuments = $recentDocumentsQuery
            ->limit(5)
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'file_name' => $doc->file_name,
                    'file_type' => $doc->file_type,
                    'updated_at' => $doc->updated_at->diffForHumans(),
                    'file_size' => '2.4 MB', // Placeholder
                ];
            });

        // Today's Appointments
        $todayAppointments = Appointment::with('client')
            ->whereDate('appointment_date', Carbon::today())
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'client_name' => $app->client->contact_person,
                    'time' => $app->start_time . ' - ' . $app->end_time,
                    'status' => $app->status
                ];
            });

        return response()->json([
            'stats' => [
                ['name' => 'Total Cases', 'value' => (string)$totalCases, 'icon' => 'Briefcase', 'color' => 'bg-blue-500'],
                ['name' => 'Active Clients', 'value' => (string)$activeClients, 'icon' => 'Users', 'color' => 'bg-green-500'],
                ['name' => 'Hearings Today', 'value' => (string)$hearingsToday, 'icon' => 'Calendar', 'color' => 'bg-orange-500'],
                ['name' => 'Pending Contracts', 'value' => (string)$pendingContracts, 'icon' => 'FileText', 'color' => 'bg-purple-500'],
                // Added stats for new features
                ['name' => 'Appointments', 'value' => (string)$totalAppointments, 'icon' => 'Clock', 'color' => 'bg-indigo-500'],
                ['name' => 'Courts', 'value' => (string)$totalCourts, 'icon' => 'MapPin', 'color' => 'bg-red-500'],
                ['name' => 'Attendance Today', 'value' => (string)$todayAttendance, 'icon' => 'UserCheck', 'color' => 'bg-teal-500'],
                ['name' => 'Pending Payroll', 'value' => (string)$pendingPayroll, 'icon' => 'Banknote', 'color' => 'bg-yellow-500'],
            ],
            'upcomingHearings' => $upcomingHearings,
            'recentDocuments' => $recentDocuments,
            'todayAppointments' => $todayAppointments,
        ]);
    }
}
