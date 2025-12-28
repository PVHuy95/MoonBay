<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Booking;


class RoomInfo extends Model
{
    use HasFactory;

    protected $table = 'rooms';

    protected $fillable = [
        'room_number',
        'type',
        'description',
        'price',
        'status',
        'image_url',
        'created_at',
        'updated_at',
    ];

    /**
     * Mối quan hệ: RoomInfo có nhiều BookingRoom
     */
    public function bookingRooms()
    {
        return $this->hasMany(Booking::class, 'room_id');
    }
}