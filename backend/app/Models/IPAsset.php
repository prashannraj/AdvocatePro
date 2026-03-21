<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IPAsset extends Model
{
    use HasFactory;

    protected $table = 'ip_assets';

    protected $fillable = [
        'case_id', 'client_id', 'type', 'asset_name', 
        'application_number', 'registration_number', 
        'class', 'filing_date', 'status', 'renewal_date'
    ];

    protected $casts = [
        'filing_date' => 'date',
        'renewal_date' => 'date',
    ];

    public function caseRecord()
    {
        return $this->belongsTo(CaseRecord::class, 'case_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function infringementActions()
    {
        return $this->hasMany(InfringementAction::class, 'ip_asset_id');
    }
}
