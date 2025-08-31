<?php

namespace App\Providers;

use App\Repositories\Contracts\CoreRepositoryInterface;
use App\Repositories\CoreRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(CoreRepositoryInterface::class, CoreRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
