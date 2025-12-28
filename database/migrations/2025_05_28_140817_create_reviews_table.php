<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewsTable extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id(); // Cột id (khóa chính)
            $table->bigInteger('user_id')->unsigned()->nullable(); // user_id có thể null
            $table->string('email', 191)->collation('utf8mb4_unicode_ci'); // email tối đa 191 ký tự
            $table->integer('rating'); // Đánh giá
            $table->text('comment')->collation('utf8mb4_general_ci')->nullable(); // Bình luận, có thể null
            $table->text('admin_reply')->collation('utf8mb4_general_ci')->nullable(); // Phản hồi admin, có thể null
            $table->dateTime('created_at'); // Thời gian tạo
            $table->timestamp('updated_at')->nullable(); // Thời gian cập nhật, có thể null
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
}