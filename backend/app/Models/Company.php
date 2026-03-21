<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id', 'company_name', 'registration_number', 
        'PAN', 'address', 'directors'
    ];

    protected $casts = [
        'directors' => 'array',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function complianceTasks()
    {
        return $this->hasMany(ComplianceTask::class);
    }
}
