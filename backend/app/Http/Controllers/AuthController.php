<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\ActivityLog;
use App\Mail\GeneralNotification;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::whereRaw('LOWER(email) = ?', [strtolower($request->email)])->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Bypass OTP for specific admin email
        if (strtolower($user->email) === 'admin@advocate.com') {
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // Log direct login
            $this->recordManualActivity($user, 'logged_in', 'Logged in directly (OTP bypassed)');

            return response()->json([
                'requires_otp' => false,
                'token' => $token,
                'user' => $user->load('role'),
            ]);
        }

        // Generate OTP for others
        $otp = rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(2);
        $user->save();

        // Send OTP via Email
        $this->sendOtpEmail($user, $otp);

        return response()->json([
            'requires_otp' => true,
            'email' => $user->email,
            'message' => 'OTP sent to your email.'
        ]);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::whereRaw('LOWER(email) = ?', [strtolower($request->email)])->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Generate new OTP
        $otp = rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(2);
        $user->save();

        $this->sendOtpEmail($user, $otp);

        return response()->json(['message' => 'OTP resent successfully.']);
    }

    protected function sendOtpEmail($user, $otp)
    {
        try {
            $content = "Your <strong>Advocate Pro</strong> login OTP is: <h2 style='color: #4f46e5; margin: 10px 0;'>$otp</h2> It will expire in 2 minutes.";
            Mail::to($user->email)->send(new GeneralNotification($content, 'Login OTP - Advocate Pro'));
        } catch (\Exception $e) {
            Log::error("Failed to send OTP email: " . $e->getMessage());
        }
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
        ]);

        $user = User::whereRaw('LOWER(email) = ?', [strtolower($request->email)])->first();

        if (!$user || $user->otp !== $request->otp || Carbon::now()->gt($user->otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['The provided OTP is invalid or has expired.'],
            ]);
        }

        // Clear OTP after successful verification
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        // Log OTP login
        $this->recordManualActivity($user, 'logged_in', 'Logged in via OTP verification');

        return response()->json([
            'token' => $token,
            'user' => $user->load('role'),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $this->recordManualActivity($user, 'logged_out', 'User logged out');
            $user->currentAccessToken()->delete();
        }
        return response()->json(['message' => 'Logged out successfully']);
    }

    protected function recordManualActivity($user, $action, $description)
    {
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('role'));
    }
}
