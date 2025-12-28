<?php

namespace Database\Factories;

use App\Models\BookingManager;
use App\Models\RoomInfo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class BookingManagerFactory extends Factory
{
    protected $model = BookingManager::class;

    public function definition()
    {
        $this->faker->addProvider(new \Faker\Provider\vi_VN\Person($this->faker));
        $this->faker->addProvider(new \Faker\Provider\vi_VN\Address($this->faker));
        $this->faker->addProvider(new \Faker\Provider\vi_VN\PhoneNumber($this->faker));

        // Lấy ngẫu nhiên một phòng từ bảng rooms
        $room = RoomInfo::inRandomOrder()->first();
        // Chọn checkin_date ngẫu nhiên trong tháng 4/2025
        $checkinDate = $this->faker->dateTimeBetween('2025-5-1', '2025-5-28');
        // Đảm bảo checkout_date không vượt quá 30 ngày và nằm trong tháng 4
        $maxCheckoutDate = Carbon::parse($checkinDate)->addDays(30);
        $maxAllowedDate = Carbon::parse('2025-5-28 23:59:59');
        $checkoutDate = Carbon::parse($checkinDate)->addDays($this->faker->numberBetween(1, 30));
        // Giới hạn checkoutDate bằng min của maxCheckoutDate và maxAllowedDate
        $checkoutDate = $checkoutDate->lte($maxCheckoutDate) ? $checkoutDate : $maxCheckoutDate;
        $checkoutDate = $checkoutDate->lte($maxAllowedDate) ? $checkoutDate : $maxAllowedDate;
        $numberOfRooms = $this->faker->numberBetween(1, 3);
        // Đảm bảo pricePerRoom luôn dương và khớp với room_types
        $pricePerRoom = $room ? max($room->price, 0) : $this->faker->randomElement([400000, 800000, 600000, 1000000, 1200000]);
        // Tính số ngày chênh lệch
        $daysDifference = Carbon::parse($checkinDate)->diffInDays($checkoutDate);
        // Tính total_price chính xác
        $totalPrice = $pricePerRoom * $daysDifference;

        return [
            'user_id' => $this->faker->numberBetween(3, 57),
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'room_type' => $room ? $room->type : $this->faker->randomElement(['Standard', 'Deluxe', 'Superior', 'Family', 'Suite']),
            'number_of_rooms' => $numberOfRooms,
            'children' => $this->faker->numberBetween(0, 4),
            'member' => $this->faker->numberBetween(1, 6),
            'checkin_date' => $checkinDate->format('Y-m-d'),
            'actual_check_in' => $this->faker->dateTimeBetween($checkinDate, $checkoutDate),
            'actual_check_out' => $this->faker->dateTimeBetween($checkinDate, $checkoutDate),
            'checkout_date' => $checkoutDate->format('Y-m-d'),
            'price' => $pricePerRoom,
            'total_price' => $totalPrice,
            'room_id' => $room ? $room->id : $this->faker->numberBetween(1, 60),
            'deposit_paid' => $this->faker->randomFloat(2, 0, max($totalPrice * 0.3, 0)),
            'status' => $this->faker->randomElement(['confirmed', 'cancelled']),
            'check_status' => 'checked out',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}