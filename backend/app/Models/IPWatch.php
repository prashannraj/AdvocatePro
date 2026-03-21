<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IPWatch extends Model
{
    use HasFactory;

    protected $table = 'ip_watches';

    protected $fillable = [
        'client_id', 'monitored_term', 'monitored_keywords', 
        'last_checked_date', 'new_matches_count', 'alerts'
    ];

    protected $casts = [
        'monitored_keywords' => 'array',
        'alerts' => 'array',
        'last_checked_date' => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
