<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function index()
    {
        return response()->json(Contract::with('client')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'expiry_date' => 'nullable|string',
            'status' => 'required|in:Draft,Active,Expired',
        ]);

        $contract = Contract::create($validated);
        return response()->json($contract, 201);
    }

    public function show(Contract $contract)
    {
        return response()->json($contract->load('client'));
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'title' => 'sometimes|string|max:255',
            'content' => 'nullable|string',
            'expiry_date' => 'nullable|string',
            'status' => 'sometimes|in:Draft,Active,Expired',
        ]);

        $contract->update($validated);
        return response()->json($contract);
    }

    public function destroy(Contract $contract)
    {
        $contract->delete();
        return response()->json(null, 204);
    }
}
