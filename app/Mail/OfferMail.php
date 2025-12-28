<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OfferMail extends Mailable
{
    use Queueable, SerializesModels;

    public $offers;

    public function __construct($offers)
    {
        $this->offers = $offers;
    }

    public function build()
    {
        return $this->subject('Special Offers for You')
                    ->view('emails.offers');
    }
}