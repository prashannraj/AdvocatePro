<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WebCaseController;

Route::get('/', function () {
    return response()->json([
        'status' => 'secure',
        'message' => 'Advocate Pro API is running.',
        'version' => '1.0.0',
        'developed_by' => 'Appan Technology Pvt. Ltd.'
    ]);
});

Route::resource('cases', WebCaseController::class);
