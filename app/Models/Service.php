<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'title', 'image', 'description', 'detailed_description', 'working_hours', 'status'
    ];

    public function pricing()
    {
        return $this->hasMany(ServicePricing::class, 'service_id');
    }
}