<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OfferMail;
use Illuminate\Support\Facades\DB;

class OfferController extends Controller
{
    public function sendOffers()
    {
        $offers = DB::table('special_offers')->get();
        $emails = DB::table('follow_emails')->pluck('email');

        foreach ($emails as $email) {
            Mail::to($email)->send(new OfferMail($offers));
        }

        return response()->json(['message' => 'Offers sent successfully'], 200);
    }
}