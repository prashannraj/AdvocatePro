<?php

namespace App\Http\Controllers;

use App\Models\Hearing;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function index()
    {
        $hearings = Hearing::with('caseRecord')
            ->where('hearing_date', '>=', Carbon::today())
            ->orderBy('hearing_date', 'asc')
            ->get();
        return response()->json($hearings);
    }
}
