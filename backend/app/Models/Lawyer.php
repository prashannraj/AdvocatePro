<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lawyer extends Model
{
    /** @use HasFactory<\Database\Factories\LawyerFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'specialization', 'experience_years', 'availability_status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
