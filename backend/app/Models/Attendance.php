<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasNepaliDate;

class Attendance extends Model
{
    /** @use HasFactory<\Database\Factories\AttendanceFactory> */
    use HasFactory;
    use HasNepaliDate;

    protected $nepaliDates = ['date'];

    protected $fillable = ['user_id', 'check_in', 'check_out', 'date'];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
    ];

    public function getCheckInAttribute($value)
    {
        return $value ? \Carbon\Carbon::parse($value)->format('h:i A') : null;
    }

    public function getCheckOutAttribute($value)
    {
        return $value ? \Carbon\Carbon::parse($value)->format('h:i A') : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
