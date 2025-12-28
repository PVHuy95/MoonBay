<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StayHistory extends Model
{
    use HasFactory;
    protected $table = 'stay_history'; // Chỉ định tên bảng nếu khác với quy ước
    protected $fillable = [
        'user_id',
        'booking_id',
        'check_in_date',
        'check_out_date',
        'room_id',
        'status',
        'special_requests',
    ];

    // Quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ với Room
    public function room()
    {
        return $this->belongsTo(RoomInfo::class, 'room_id');
    }

    // Quan hệ với Booking
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}