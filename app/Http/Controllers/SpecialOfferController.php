<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SpecialOffer;
use Illuminate\Http\Request;

class SpecialOfferController extends Controller
{
    public function index()
    {
        $offers = SpecialOffer::all();
        return response()->json($offers);
    }
    public function update(Request $request, $id)
    {
        $offer = SpecialOffer::find($id);
        if (!$offer) {
            return response()->json(['message' => 'Offer not found'], 404);
        }

        $offer->update([
            'season' => $request->season,
            'free_services' => $request->free_services,
            'season_start' => $request->season_start,
            'season_end' => $request->season_end,

            'total_bill_threshold' => $request->total_bill_threshold,
            'discount_percent' => $request->discount_percent,
            'discount_start' => $request->discount_start,
            'discount_end' => $request->discount_end,

            'stay_duration_days' => $request->stay_duration_days,
            'gift_description' => $request->gift_description,
            'gift_start' => $request->gift_start,
            'gift_end' => $request->gift_end,

            'other_package_description' => $request->other_package_description,
            'offer_type' => $request->offer_type,
            'other_offer_start' => $request->other_offer_start,
            'other_offer_end' => $request->other_offer_end,
        ]);

        return response()->json(['message' => 'Offer updated successfully']);
    }
}
