<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;

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
        if (app()->runningInConsole() || !Schema::hasTable('settings')) {
            return;
        }

        $settings = Setting::all()->pluck('value', 'key');

        if ($settings->has('office_name')) {
            Config::set('mail.from.name', $settings->get('office_name'));
        }

        // We keep the from address as defined in .env (advocate@getappantech.com)
        // to ensure SMTP authentication doesn't fail.
        // If we want to allow replies to the office email, we should use Reply-To in Mailables.
    }
}
