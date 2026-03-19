<?php

namespace App\Http\Controllers;

use App\Models\Lawyer;
use Illuminate\Http\Request;

class LawyerController extends Controller
{
    public function index()
    {
        return response()->json(Lawyer::with('user')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'specialization' => 'required|string|max:255',
            'experience_years' => 'required|integer',
            'availability_status' => 'required|in:available,busy,on_leave',
            'bio' => 'nullable|string',
        ]);

        $lawyer = Lawyer::create($validated);
        return response()->json($lawyer, 201);
    }

    public function show(Lawyer $lawyer)
    {
        return response()->json($lawyer->load('user'));
    }

    public function update(Request $request, Lawyer $lawyer)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'specialization' => 'sometimes|string|max:255',
            'experience_years' => 'sometimes|integer',
            'availability_status' => 'sometimes|in:available,busy,on_leave',
            'bio' => 'nullable|string',
        ]);

        $lawyer->update($validated);
        return response()->json($lawyer);
    }

    public function destroy(Lawyer $lawyer)
    {
        $lawyer->delete();
        return response()->json(null, 204);
    }
}
