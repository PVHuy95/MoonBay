<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test send email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Mail::raw('Test email from Laravel', function($message) {
            $message->to('truonglong24498@gmail.com')->subject('Test Email');
        });
        $this->info('Email đã được gửi!');
    }
}
