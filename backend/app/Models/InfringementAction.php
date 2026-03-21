<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InfringementAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_asset_id', 'case_id', 'infringer_details', 
        'action_type', 'status'
    ];

    public function ipAsset()
    {
        return $this->belongsTo(IPAsset::class, 'ip_asset_id');
    }

    public function caseRecord()
    {
        return $this->belongsTo(CaseRecord::class, 'case_id');
    }
}
