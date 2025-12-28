<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'remember_token',
        'avatar', 
        'role',
        'status', 
        'provider', 
        'is_banned',
        'customer_type',
        // 'customer_status',
        // 'special_notes',
    ];
    protected $casts = [
        'is_banned' => 'boolean',
    ];
    

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'avatar'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->remember_token)) {
                $user->remember_token = Str::random(60); // Tạo token ngẫu nhiên dài 60 ký tự
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Thêm relationship với bookings
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
    
    // Thêm relationship với stayHistory
    public function stayHistory()
    {
        return $this->hasMany(StayHistory::class);
    }
    
    // Thêm relationship với customerNotes
    public function customerNotes()
    {
        return $this->hasMany(StaffCustomerNote::class, 'user_id');
    }
}




