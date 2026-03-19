<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Hearing extends Model
{
    use LogsActivity;

    protected $fillable = ['case_id', 'hearing_date', 'judge_name', 'notes', 'status'];

    public function caseRecord()
    {
        return $this->belongsTo(CaseRecord::class, 'case_id');
    }
}
