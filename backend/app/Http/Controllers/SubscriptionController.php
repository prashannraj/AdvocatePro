<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\LicenseKey;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    // Developer Secret Key (Hardcoded for Appan Technology)
    private $DEV_SECRET = 'APPAN-TECH-DEV-MASTER-2026';

    public function status()
    {
        $subscription = Subscription::where('status', 'active')
            ->orderBy('expires_at', 'desc')
            ->first();

        return response()->json([
            'is_active' => $subscription ? $subscription->expires_at->isFuture() : false,
            'expires_at' => $subscription ? $subscription->expires_at->toDateString() : null,
            'days_left' => $subscription ? now()->diffInDays($subscription->expires_at, false) : 0,
        ]);
    }

    public function activate(Request $request)
    {
        $request->validate([
            'activation_key' => 'required|string',
        ]);

        $key = $request->activation_key;

        // Check if key exists in our generated licenses and hasn't been used
        $license = LicenseKey::where('key', $key)
            ->where('is_used', false)
            ->first();

        // Also allow the demo trial key for now
        if (!$license && $key !== 'ADV-2026-TRIAL-KEY') {
            return response()->json([
                'message' => 'Invalid or expired activation key. Please contact Appan Technology Pvt. Ltd.',
            ], 422);
        }

        // Deactivate old active subscriptions
        Subscription::where('status', 'active')->update(['status' => 'expired']);

        // Determine expiration date: 15 days for trial key, 1 year for others
        $isTrial = ($key === 'ADV-2026-TRIAL-KEY');
        $expiresAt = $isTrial ? now()->addDays(15) : now()->addYear();

        $subscription = Subscription::create([
            'activation_key' => $key,
            'activated_at' => now(),
            'expires_at' => $expiresAt,
            'status' => 'active',
        ]);

        // Mark the license as used if it was a real one
        if ($license) {
            $license->update([
                'is_used' => true,
                'used_at' => now(),
            ]);
        }

        $message = $isTrial 
            ? 'Demo mode activated successfully for 15 days!' 
            : 'Application activated successfully for one year!';

        return response()->json([
            'message' => $message,
            'expires_at' => $subscription->expires_at->toDateString(),
        ]);
    }

    // --- Developer/Vendor Methods ---

    public function listKeys(Request $request)
    {
        if ($request->header('X-Dev-Secret') !== $this->DEV_SECRET) {
            return response()->json(['message' => 'Unauthorized Access'], 401);
        }

        return response()->json(LicenseKey::orderBy('created_at', 'desc')->get());
    }

    public function generateKey(Request $request)
    {
        if ($request->header('X-Dev-Secret') !== $this->DEV_SECRET) {
            return response()->json(['message' => 'Unauthorized Access'], 401);
        }

        $request->validate([
            'client_name' => 'required|string|max:255',
        ]);

        // Generate a random secure key: ADV-2026-RANDOM-HASH
        $random = strtoupper(Str::random(8));
        $key = "ADV-2026-" . $random;

        $license = LicenseKey::create([
            'key' => $key,
            'client_name' => $request->client_name,
            'generated_by' => 'Appan Tech Admin',
        ]);

        return response()->json([
            'message' => 'New key generated successfully!',
            'key' => $license,
        ]);
    }

    public function deleteKey(Request $request, $id)
    {
        if ($request->header('X-Dev-Secret') !== $this->DEV_SECRET) {
            return response()->json(['message' => 'Unauthorized Access'], 401);
        }

        LicenseKey::findOrFail($id)->delete();
        return response()->json(['message' => 'Key deleted successfully']);
    }
}
