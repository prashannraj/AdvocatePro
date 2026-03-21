<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorporateTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_id', 'type', 'amount', 'parties', 'status'
    ];

    public function caseRecord()
    {
        return $this->belongsTo(CaseRecord::class, 'case_id');
    }
}
