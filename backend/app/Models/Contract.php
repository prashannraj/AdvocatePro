<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasNepaliDate;

class Contract extends Model
{
    /** @use HasFactory<\Database\Factories\ContractFactory> */
    use HasFactory;
    use HasNepaliDate;

    protected $nepaliDates = ['expiry_date'];

    protected $fillable = ['client_id', 'title', 'content', 'expiry_date', 'status'];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
