<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class BookingManager extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'booking_rooms';

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'room_type',
        'number_of_rooms',
        'children',
        'member',
        'price',
        'total_price',
        'checkin_date',
        'checkout_date',
        'room_id',
        'check_status',
        'actual_check_in',
        'actual_check_out',
    ];

    protected $casts = [
        'checkin_date' => 'datetime',
        'checkout_date' => 'datetime',
        'actual_check_in' => 'datetime',
        'actual_check_out' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(RoomInfo::class, 'room_id');
    }
}