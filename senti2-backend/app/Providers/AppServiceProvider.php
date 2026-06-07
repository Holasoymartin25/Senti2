<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\Info;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        Gate::define('viewApiDocs', fn () => true);

        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi) {
                $openApi->info = new Info(
                    'Senti2 API',
                    '1.0.0',
                    'REST API for the Senti2 emotional wellness platform (Laravel + Sanctum).'
                );
            });
    }
}
