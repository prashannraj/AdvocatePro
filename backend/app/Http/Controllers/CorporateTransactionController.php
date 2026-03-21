<?php

namespace App\Http\Controllers;

use App\Models\CorporateTransaction;
use Illuminate\Http\Request;

class CorporateTransactionController extends Controller
{
    public function index()
    {
        return response()->json(CorporateTransaction::with(['caseRecord.client'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'required|exists:case_records,id',
            'type' => 'required|in:FDI,JV,M&A,Loan,Other',
            'amount' => 'nullable|numeric',
            'parties' => 'nullable|string',
            'status' => 'required|string',
        ]);

        $transaction = CorporateTransaction::create($validated);

        return response()->json($transaction->load(['caseRecord.client']), 201);
    }

    public function update(Request $request, CorporateTransaction $corporate_transaction)
    {
        $validated = $request->validate([
            'case_id' => 'required|exists:case_records,id',
            'type' => 'required|in:FDI,JV,M&A,Loan,Other',
            'amount' => 'nullable|numeric',
            'parties' => 'nullable|string',
            'status' => 'required|string',
        ]);

        $corporate_transaction->update($validated);

        return response()->json($corporate_transaction->load(['caseRecord.client']));
    }

    public function destroy(CorporateTransaction $corporate_transaction)
    {
        $corporate_transaction->delete();
        return response()->json(null, 204);
    }
}
