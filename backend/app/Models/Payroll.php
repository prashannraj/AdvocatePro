<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasNepaliDate;

class Payroll extends Model
{
    /** @use HasFactory<\Database\Factories\PayrollFactory> */
    use HasFactory;
    use HasNepaliDate;

    protected $nepaliDates = ['payment_date'];

    protected $casts = [
        'base_salary' => 'float',
        'allowances' => 'float',
        'deductions' => 'float',
        'net_salary' => 'float',
    ];

    protected $fillable = [
        'user_id', 'base_salary', 'allowances', 
        'deductions', 'net_salary', 'payment_date', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
