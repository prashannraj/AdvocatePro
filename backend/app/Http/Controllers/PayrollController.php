<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function index()
    {
        return response()->json(Payroll::with('user')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'base_salary' => 'required|numeric',
            'allowances' => 'required|numeric',
            'deductions' => 'required|numeric',
            'net_salary' => 'required|numeric',
            'payment_date' => 'required|string',
            'status' => 'required|in:Paid,Pending',
        ]);

        $payroll = Payroll::create($validated);
        return response()->json($payroll, 201);
    }

    public function show(Payroll $payroll)
    {
        return response()->json($payroll->load('user'));
    }

    public function update(Request $request, Payroll $payroll)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'base_salary' => 'sometimes|numeric',
            'allowances' => 'sometimes|numeric',
            'deductions' => 'sometimes|numeric',
            'net_salary' => 'sometimes|numeric',
            'payment_date' => 'sometimes|string',
            'status' => 'sometimes|in:Paid,Pending',
        ]);

        $payroll->update($validated);
        return response()->json($payroll);
    }

    public function destroy(Payroll $payroll)
    {
        $payroll->delete();
        return response()->json(null, 204);
    }
}
