<?php

use App\Http\Middleware\VerifyCoreToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/setting/core', [App\Http\Controllers\CoreController::class, 'show']);

Route::middleware([VerifyCoreToken::class])->group(function () {
    Route::patch('/setting/core', [App\Http\Controllers\CoreController::class, 'update']);
});
