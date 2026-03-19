<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;
use App\Models\Lawyer;
use App\Models\Court;
use App\Models\CaseRecord;
use App\Models\Hearing;
use App\Models\Contract;
use App\Models\Document;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Attendance;
use App\Models\Payroll;
use Carbon\Carbon;

class DashboardDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the lawyer user or create one
        $lawyerUser = User::whereHas('role', function($q) { $q->where('slug', 'lawyer'); })->first();
        if (!$lawyerUser) {
            $lawyerRole = \App\Models\Role::where('slug', 'lawyer')->first();
            $lawyerUser = User::create([
                'name' => 'John Lawyer',
                'email' => 'lawyer@advocate.com',
                'password' => bcrypt('password'),
                'role_id' => $lawyerRole->id,
                'status' => 'active',
            ]);
        }

        $lawyer = Lawyer::updateOrCreate(
            ['user_id' => $lawyerUser->id],
            [
                'specialization' => 'Criminal Law',
                'experience_years' => 10,
                'availability_status' => 'available'
            ]
        );

        $client = Client::updateOrCreate(
            ['contact_person' => 'Jane Doe'],
            [
                'client_type' => 'Individual',
                'phone' => '1234567890',
                'address' => '123 Main St'
            ]
        );

        $court = Court::updateOrCreate(
            ['name' => 'Supreme Court'],
            [
                'category' => 'High',
                'location' => 'Capital City'
            ]
        );

        $case = CaseRecord::updateOrCreate(
            ['case_number' => 'CASE-2026-001'],
            [
                'title' => 'State vs. John Doe',
                'description' => 'A complex criminal case.',
                'client_id' => $client->id,
                'lawyer_id' => $lawyer->id,
                'status' => 'Open',
                'court_id' => $court->id,
                'filed_date' => Carbon::now()->subMonths(2)
            ]
        );

        $court2 = Court::updateOrCreate(
            ['name' => 'District Court 4'],
            [
                'category' => 'Lower',
                'location' => 'West Zone'
            ]
        );

        // Create 5 cases
        for ($i = 1; $i <= 5; $i++) {
            $caseNum = "CASE-2026-00{$i}";
            $case = CaseRecord::updateOrCreate(
                ['case_number' => $caseNum],
                [
                    'title' => "Case of Client {$i} vs. Entity {$i}",
                    'description' => "Detailed description for case {$i}.",
                    'client_id' => $client->id,
                    'lawyer_id' => $lawyer->id,
                    'status' => $i % 2 == 0 ? 'Open' : 'Pending',
                    'court_id' => $i % 2 == 0 ? $court->id : $court2->id,
                    'filed_date' => Carbon::now()->subMonths($i)
                ]
            );

            Hearing::updateOrCreate(
                ['case_id' => $case->id, 'hearing_date' => Carbon::today()->addDays($i)],
                [
                    'judge_name' => "Judge Name {$i}",
                    'status' => 'Scheduled'
                ]
            );

            Document::updateOrCreate(
                ['file_name' => "Legal_Document_{$i}.pdf", 'documentable_id' => $case->id],
                [
                    'documentable_type' => CaseRecord::class,
                    'file_path' => "docs/case_00{$i}.pdf",
                    'file_type' => 'pdf'
                ]
            );
        }

        Contract::updateOrCreate(
            ['title' => 'NDA Agreement', 'client_id' => $client->id],
            ['status' => 'Draft']
        );

        Contract::updateOrCreate(
            ['title' => 'Retainer Agreement', 'client_id' => $client->id],
            ['status' => 'Draft']
        );

        // Seed Appointments
        Appointment::updateOrCreate(
            ['client_id' => $client->id, 'appointment_date' => Carbon::today()],
            [
                'lawyer_id' => $lawyer->id,
                'start_time' => '10:00 AM',
                'end_time' => '11:00 AM',
                'status' => 'Confirmed'
            ]
        );

        Appointment::updateOrCreate(
            ['client_id' => $client->id, 'appointment_date' => Carbon::today()->addDay()],
            [
                'lawyer_id' => $lawyer->id,
                'start_time' => '02:00 PM',
                'end_time' => '03:00 PM',
                'status' => 'Pending'
            ]
        );

        // Seed Attendance
        Attendance::updateOrCreate(
            ['user_id' => $lawyerUser->id, 'date' => Carbon::today()],
            [
                'check_in' => '09:00 AM',
                'check_out' => null
            ]
        );

        // Seed Payroll
        Payroll::updateOrCreate(
            ['user_id' => $lawyerUser->id, 'payment_date' => Carbon::now()->startOfMonth()],
            [
                'base_salary' => 5000,
                'allowances' => 500,
                'deductions' => 200,
                'net_salary' => 5300,
                'status' => 'Pending'
            ]
        );
    }
}
