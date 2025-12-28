<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class RoomType extends Model
{
    protected $table = 'room_types';

    protected $fillable = ['name', 'capacity', 'description', 'image', 'price'];

    protected static function booted()
    {
        static::deleting(function ($room_type) {
            if ($room_type->image && Storage::disk('public')->exists($room_type->image)) {
                Storage::disk('public')->delete($room_type->image);
            }
        });
    }
}
