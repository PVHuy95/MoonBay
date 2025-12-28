<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\Hotel;

class HotelController extends Controller
{
    public function index(): JsonResponse
    {
        // return response()->json(Hotel::all());
        $hotels = Hotel::all()->map(function ($hotel) {
            // Nếu có ảnh, trả về URL Cloudinary          
            $hotel->image_url = $hotel->image;
            return $hotel;
        });
        return response()->json($hotels);
    }
}