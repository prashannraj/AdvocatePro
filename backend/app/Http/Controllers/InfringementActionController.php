<?php

namespace App\Http\Controllers;

use App\Models\InfringementAction;
use Illuminate\Http\Request;

class InfringementActionController extends Controller
{
    public function index()
    {
        return response()->json(InfringementAction::with(['ipAsset', 'caseRecord.client'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ip_asset_id' => 'required|exists:ip_assets,id',
            'case_id' => 'nullable|exists:case_records,id',
            'infringer_details' => 'required|string',
            'action_type' => 'required|in:CeaseDesist,Litigation,Takedown,Opposition',
            'status' => 'required|string|max:255',
        ]);

        $action = InfringementAction::create($validated);

        return response()->json($action->load(['ipAsset', 'caseRecord.client']), 201);
    }

    public function update(Request $request, InfringementAction $infringement_action)
    {
        $validated = $request->validate([
            'ip_asset_id' => 'required|exists:ip_assets,id',
            'case_id' => 'nullable|exists:case_records,id',
            'infringer_details' => 'required|string',
            'action_type' => 'required|in:CeaseDesist,Litigation,Takedown,Opposition',
            'status' => 'required|string|max:255',
        ]);

        $infringement_action->update($validated);

        return response()->json($infringement_action->load(['ipAsset', 'caseRecord.client']));
    }

    public function destroy(InfringementAction $infringement_action)
    {
        $infringement_action->delete();
        return response()->json(null, 204);
    }
}
