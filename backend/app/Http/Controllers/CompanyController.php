<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index()
    {
        return response()->json(Company::with('client.user')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'company_name' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'PAN' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'directors' => 'nullable|array',
        ]);

        $company = Company::create($validated);

        return response()->json($company->load('client.user'), 201);
    }

    public function show(Company $company)
    {
        return response()->json($company->load(['client.user', 'complianceTasks']));
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'company_name' => 'required|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'PAN' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'directors' => 'nullable|array',
        ]);

        $company->update($validated);

        return response()->json($company->load('client.user'));
    }

    public function destroy(Company $company)
    {
        $company->delete();
        return response()->json(null, 204);
    }
}
