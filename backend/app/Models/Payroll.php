<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    /** @use HasFactory<\Database\Factories\PayrollFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id', 'base_salary', 'allowances', 
        'deductions', 'net_salary', 'payment_date', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
