<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicePricing extends Model
{
    protected $table = 'service_pricing';
    protected $fillable = [
        'service_id', 'type', 'value'
    ];
}