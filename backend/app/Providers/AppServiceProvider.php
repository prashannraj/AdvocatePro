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

        if ($settings->has('email')) {
            $email = $settings->get('email');
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Config::set('mail.from.address', $email);
            }
        }
    }
}
