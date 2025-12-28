<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class StaffCustomerManagement extends Model
{
    use HasFactory;

    protected $table = 'users'; // Nếu vẫn dùng bảng users

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'customer_status',
        'special_notes',
        // Thêm các trường khác nếu cần
    ];

    // Quan hệ ví dụ
    public function stayHistory()
    {
        return $this->hasMany(StayHistory::class, 'user_id');
    }
}