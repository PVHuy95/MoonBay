<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaints extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'customer_email',
        'customer_phone',
        'complaint_type',
        'description',
        'contact_preference',
        'status',
        'handler_name',
    ];
}
