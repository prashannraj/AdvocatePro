<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;
use App\Traits\HasNepaliDate;

class CaseRecord extends Model
{
    /** @use HasFactory<\Database\Factories\CaseRecordFactory> */
    use HasFactory;
    use LogsActivity;
    use HasNepaliDate;

    protected $nepaliDates = ['filed_date', 'closed_date'];

    protected $fillable = [
        'case_number', 'bs_year', 'case_type_code', 'sequential_number',
        'title', 'department', 'description', 'client_id', 
        'lawyer_id', 'opposite_lawyer_name', 'status', 
        'court_id', 'filed_date', 'closed_date'
    ];

    public function corporateTransactions()
    {
        return $this->hasMany(CorporateTransaction::class, 'case_id');
    }

    public function complianceTasks()
    {
        return $this->hasMany(ComplianceTask::class, 'case_id');
    }

    public function hearings()
    {        return $this->hasMany(Hearing::class, 'case_id');
    }

    public function client()
    {        return $this->belongsTo(Client::class);
    }

    public function lawyer()
    {
        return $this->belongsTo(Lawyer::class);
    }

    public function court()
    {
        return $this->belongsTo(Court::class);
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
