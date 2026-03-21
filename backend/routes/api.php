<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\LawyerController;
use App\Http\Controllers\CaseRecordController;
use App\Http\Controllers\HearingController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CourtController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ActivityLogController;

use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\LicenseKeyController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CorporateTransactionController;
use App\Http\Controllers\ComplianceTaskController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::get('/settings', [SettingController::class, 'index']);

// Public subscription routes
Route::get('/subscription/status', [SubscriptionController::class, 'status']);
Route::post('/subscription/activate', [SubscriptionController::class, 'activate']);

// Developer routes for Appan Technology (Protected by X-Dev-Secret header)
Route::get('/dev/license-keys', [SubscriptionController::class, 'listKeys']);
Route::post('/dev/license-keys', [SubscriptionController::class, 'generateKey']);
Route::delete('/dev/license-keys/{id}', [SubscriptionController::class, 'deleteKey']);

Route::middleware(['auth:sanctum', 'subscription'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/nepali-date/now', [DashboardController::class, 'getNepaliDateNow']);
    
    // Resourceful Routes for CRUD
    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('permissions', PermissionController::class);
    Route::apiResource('lawyers', LawyerController::class);
    Route::apiResource('cases', CaseRecordController::class);
    Route::apiResource('hearings', HearingController::class);
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('courts', CourtController::class);
    Route::apiResource('attendance', AttendanceController::class);
    Route::apiResource('payroll', PayrollController::class);
    Route::apiResource('contracts', ContractController::class);
    Route::apiResource('clients', ClientController::class);
    Route::get('/clients/{client}/cases', [ClientController::class, 'cases']);
    Route::apiResource('documents', DocumentController::class);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);

    Route::post('/settings', [SettingController::class, 'update']);

    Route::apiResource('activity-logs', ActivityLogController::class);
    Route::apiResource('subscriptions', SubscriptionController::class);
    Route::apiResource('license-keys', LicenseKeyController::class);
    
    // Corporate Routes
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('corporate-transactions', CorporateTransactionController::class);
    Route::apiResource('compliance-tasks', ComplianceTaskController::class);

    Route::get('/schedule', [ScheduleController::class, 'index']);
});
