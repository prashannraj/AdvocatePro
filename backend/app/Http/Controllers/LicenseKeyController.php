<?php

namespace App\Http\Controllers;

use App\Models\LicenseKey;
use Illuminate\Http\Request;

class LicenseKeyController extends Controller
{
    public function index()
    {
        return response()->json(LicenseKey::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|unique:license_keys,key',
            'is_used' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $licenseKey = LicenseKey::create($validated);

        return response()->json($licenseKey, 201);
    }

    public function show(LicenseKey $license_key)
    {
        return response()->json($license_key);
    }

    public function update(Request $request, LicenseKey $license_key)
    {
        $validated = $request->validate([
            'key' => 'required|string|unique:license_keys,key,' . $license_key->id,
            'is_used' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $license_key->update($validated);

        return response()->json($license_key);
    }

    public function destroy(LicenseKey $license_key)
    {
        $license_key->delete();
        return response()->json(null, 204);
    }
}
