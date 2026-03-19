<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;
use App\Traits\HasNepaliDate;

class Appointment extends Model
{
    /** @use HasFactory<\Database\Factories\AppointmentFactory> */
    use HasFactory;
    use LogsActivity;
    use HasNepaliDate;

    protected $nepaliDates = ['appointment_date'];

    protected $fillable = [
        'client_id', 'lawyer_id', 'appointment_date', 
        'start_time', 'end_time', 'status'
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function lawyer()
    {
        return $this->belongsTo(Lawyer::class);
    }
}
