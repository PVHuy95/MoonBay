<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffCustomerNote extends Model
{
    use HasFactory;

    protected $table = 'staff_customer_notes'; // Đúng tên bảng đã migrate

    protected $fillable = [
        'user_id',
        'staff_id',
        'staff_name',
        'note',
        'customer_type', // Đổi customer_status thành customer_type
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}