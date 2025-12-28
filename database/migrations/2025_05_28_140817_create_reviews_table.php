<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewsTable extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id(); 
            $table->bigInteger('user_id')->unsigned()->nullable();
            
            $table->string('email', 191); 
            
            $table->integer('rating');
            
            $table->text('comment')->nullable(); 
            $table->text('admin_reply')->nullable(); 
            
            $table->timestamps(); 
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
}