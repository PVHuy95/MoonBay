<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class Booking_email_successfully extends Mailable
{
    use Queueable, SerializesModels;

    public $Data;

    public function __construct($bookingData)
    {
        $this->Data = $bookingData;
    }

    public function build()
    {
        return $this->from(config('mail.from.address'), config('mail.from.name'))
                    ->subject('Confirm booking at Moon Bay Hotel')
                    ->view('emails.View_Booking_email_successfully')
                    ->with(['data' => $this->Data]);
    }
}