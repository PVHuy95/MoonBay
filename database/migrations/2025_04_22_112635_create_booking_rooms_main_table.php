<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking_rooms', function (Blueprint $table) {
            $table->id(); // ID tự tăng
            $table->unsignedBigInteger('user_id'); // ID người dùng
            $table->string('name'); // Tên người dùng
            $table->string('email'); // Email người dùng
            $table->string('phone'); // Số điện thoại người dùng
            $table->string('room_type'); // Loại phòng
            $table->integer('number_of_rooms'); // Số lượng phòng
            $table->integer('children')->default(0); // Số trẻ em
            $table->integer('member'); // Số người lớn
            $table->datetime('checkin_date'); // Ngày check-in
            $table->datetime('checkout_date'); // Ngày check-out
            $table->timestamps(); // Thời gian tạo và cập nhật

            // Khóa ngoại liên kết với bảng users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_rooms');
    }
};
