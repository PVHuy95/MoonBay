<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowEmail extends Model
{
    protected $fillable = ['email'];
    public $timestamps = true;
}
