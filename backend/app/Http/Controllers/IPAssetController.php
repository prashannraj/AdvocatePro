<?php

namespace App\Http\Controllers;

use App\Models\IPAsset;
use Illuminate\Http\Request;

class IPAssetController extends Controller
{
    public function index()
    {
        return response()->json(IPAsset::with(['client.user', 'caseRecord'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'case_id' => 'nullable|exists:case_records,id',
            'type' => 'required|in:Trademark,Patent,Copyright,Design',
            'asset_name' => 'required|string|max:255',
            'application_number' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'class' => 'nullable|string|max:255',
            'filing_date' => 'nullable|date',
            'status' => 'required|in:Filed,Examined,Registered,Opposed,Renewed,Expired',
            'renewal_date' => 'nullable|date',
        ]);

        $asset = IPAsset::create($validated);

        return response()->json($asset->load(['client.user', 'caseRecord']), 201);
    }

    public function show(IPAsset $ip_asset)
    {
        return response()->json($ip_asset->load(['client.user', 'caseRecord', 'infringementActions']));
    }

    public function update(Request $request, IPAsset $ip_asset)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'case_id' => 'nullable|exists:case_records,id',
            'type' => 'required|in:Trademark,Patent,Copyright,Design',
            'asset_name' => 'required|string|max:255',
            'application_number' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'class' => 'nullable|string|max:255',
            'filing_date' => 'nullable|date',
            'status' => 'required|in:Filed,Examined,Registered,Opposed,Renewed,Expired',
            'renewal_date' => 'nullable|date',
        ]);

        $ip_asset->update($validated);

        return response()->json($ip_asset->load(['client.user', 'caseRecord']));
    }

    public function destroy(IPAsset $ip_asset)
    {
        $ip_asset->delete();
        return response()->json(null, 204);
    }
}
