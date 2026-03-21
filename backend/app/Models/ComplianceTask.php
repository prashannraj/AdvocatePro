<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplianceTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'case_id', 'description', 'due_date', 'completed'
    ];

    protected $casts = [
        'completed' => 'boolean',
        'due_date' => 'date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function caseRecord()
    {
        return $this->belongsTo(CaseRecord::class, 'case_id');
    }
}
