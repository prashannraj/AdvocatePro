<?php

namespace App\Http\Controllers;

use App\Models\ComplianceTask;
use Illuminate\Http\Request;

class ComplianceTaskController extends Controller
{
    public function index()
    {
        return response()->json(ComplianceTask::with(['company', 'caseRecord.client'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'case_id' => 'nullable|exists:case_records,id',
            'description' => 'required|string|max:255',
            'due_date' => 'required|date',
            'completed' => 'boolean',
        ]);

        $task = ComplianceTask::create($validated);

        return response()->json($task->load(['company', 'caseRecord.client']), 201);
    }

    public function update(Request $request, ComplianceTask $compliance_task)
    {
        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'case_id' => 'nullable|exists:case_records,id',
            'description' => 'required|string|max:255',
            'due_date' => 'required|date',
            'completed' => 'boolean',
        ]);

        $compliance_task->update($validated);

        return response()->json($compliance_task->load(['company', 'caseRecord.client']));
    }

    public function destroy(ComplianceTask $compliance_task)
    {
        $compliance_task->delete();
        return response()->json(null, 204);
    }
}
