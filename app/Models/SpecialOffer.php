<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpecialOffer extends Model
{
    use HasFactory;

    protected $table = 'special_offers';

    protected $fillable = [
        'season',
        'free_services',
        'season_start',
        'season_end',

        'total_bill_threshold',
        'discount_percent',
        'discount_start',
        'discount_end',

        'stay_duration_days',
        'gift_description',
        'gift_image_url',
        'gift_start',
        'gift_end',

        'other_package_description',
        'offer_type',
        'other_offer_start',
        'other_offer_end'
    ];

    protected $casts = [
        'season_start' => 'date',
        'season_end' => 'date',
        'discount_start' => 'date',
        'discount_end' => 'date',
        'gift_start' => 'date',
        'gift_end' => 'date',
        'other_offer_start' => 'date',
        'other_offer_end' => 'date',
    ];
    public $timestamps = false;
}
