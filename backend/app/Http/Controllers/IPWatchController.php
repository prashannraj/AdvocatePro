<?php

namespace App\Http\Controllers;

use App\Models\IPWatch;
use Illuminate\Http\Request;

class IPWatchController extends Controller
{
    public function index()
    {
        return response()->json(IPWatch::with('client.user')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'monitored_term' => 'required|string|max:255',
            'monitored_keywords' => 'nullable|array',
            'last_checked_date' => 'nullable|date',
            'new_matches_count' => 'nullable|integer',
            'alerts' => 'nullable|array',
        ]);

        $watch = IPWatch::create($validated);

        return response()->json($watch->load('client.user'), 201);
    }

    public function update(Request $request, IPWatch $ip_watch)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'monitored_term' => 'required|string|max:255',
            'monitored_keywords' => 'nullable|array',
            'last_checked_date' => 'nullable|date',
            'new_matches_count' => 'nullable|integer',
            'alerts' => 'nullable|array',
        ]);

        $ip_watch->update($validated);

        return response()->json($ip_watch->load('client.user'));
    }

    public function destroy(IPWatch $ip_watch)
    {
        $ip_watch->delete();
        return response()->json(null, 204);
    }
}
