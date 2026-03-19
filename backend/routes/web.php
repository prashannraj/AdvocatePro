<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WebCaseController;

Route::get('/', function () {
    return view('welcome');
});

Route::resource('cases', WebCaseController::class);
