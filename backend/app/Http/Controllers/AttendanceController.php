<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index()
    {
        return response()->json(Attendance::with('user')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'check_in' => 'required|string',
            'check_out' => 'nullable|string',
            'date' => 'required|string',
        ]);

        // If time is provided without date, prepend the date
        if (isset($validated['check_in']) && !str_contains($validated['check_in'], '-')) {
            $validated['check_in'] = $validated['date'] . ' ' . $validated['check_in'];
        }
        if (isset($validated['check_out']) && !str_contains($validated['check_out'], '-')) {
            $validated['check_out'] = $validated['date'] . ' ' . $validated['check_out'];
        }

        $attendance = Attendance::create($validated);
        return response()->json($attendance, 201);
    }

    public function show(Attendance $attendance)
    {
        return response()->json($attendance->load('user'));
    }

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'check_in' => 'sometimes|string',
            'check_out' => 'nullable|string',
            'date' => 'sometimes|string',
        ]);

        $date = $validated['date'] ?? $attendance->date;

        if (isset($validated['check_in']) && !str_contains($validated['check_in'], '-')) {
            $validated['check_in'] = $date . ' ' . $validated['check_in'];
        }
        if (isset($validated['check_out']) && !str_contains($validated['check_out'], '-')) {
            $validated['check_out'] = $date . ' ' . $validated['check_out'];
        }

        $attendance->update($validated);
        return response()->json($attendance);
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();
        return response()->json(null, 204);
    }
}
