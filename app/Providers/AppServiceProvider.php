<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        
        // Force HTTPS trong production (fix Mixed Content trên Render)
        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
        
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            return config('app.frontend_url') . "/reset-password?token={$token}&email=" . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
