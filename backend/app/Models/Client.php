<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Client extends Model
{
    /** @use HasFactory<\Database\Factories\ClientFactory> */
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'user_id', 'client_type', 'contact_person', 'phone', 'address'
    ];

    public function caseRecords()
    {
        return $this->hasMany(CaseRecord::class);
    }

    public function companies()
    {
        return $this->hasMany(Company::class);
    }

    public function ipAssets()
    {
        return $this->hasMany(IPAsset::class);
    }

    public function ipWatches()
    {
        return $this->hasMany(IPWatch::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
