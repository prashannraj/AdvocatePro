<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'activation_key',
        'activated_at',
        'expires_at',
        'status',
    ];

    protected $casts = [
        'activated_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public static function isActive()
    {
        return self::where('status', 'active')
            ->where('expires_at', '>', now())
            ->exists();
    }
}
