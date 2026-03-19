<?php

namespace App\Http\Controllers;

use App\Models\Court;
use Illuminate\Http\Request;

class CourtController extends Controller
{
    public function index()
    {
        return response()->json(Court::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'location' => 'required|string|max:255',
        ]);

        $court = Court::create($validated);
        return response()->json($court, 201);
    }

    public function show(Court $court)
    {
        return response()->json($court);
    }

    public function update(Request $request, Court $court)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
        ]);

        $court->update($validated);
        return response()->json($court);
    }

    public function destroy(Court $court)
    {
        $court->delete();
        return response()->json(null, 204);
    }
}
