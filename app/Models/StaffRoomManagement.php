<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffRoomManagement extends Model
{
    protected $table = 'rooms'; // Chỉ định bảng rooms
    protected $fillable = [
        'room_number',
        'type',
        'description',
        'price',
        'status'
    ];
}
