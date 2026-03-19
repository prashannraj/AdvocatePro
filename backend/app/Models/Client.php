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

    public function cases()
    {
        return $this->hasMany(CaseRecord::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
