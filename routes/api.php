<?php

use App\Http\Middleware\VerifyCoreToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Documentation routes
Route::get('/documentation', [App\Http\Controllers\SwaggerController::class, 'index']);
Route::get('/documentation.json', [App\Http\Controllers\SwaggerController::class, 'json']);

Route::get('/setting/core', [App\Http\Controllers\CoreController::class, 'show']);

Route::middleware([VerifyCoreToken::class])->group(function () {
    Route::patch('/setting/core', [App\Http\Controllers\CoreController::class, 'update']);
    
    // Config key routes (TinyMCE and other keys)
    Route::get('/setting/config-key', [App\Http\Controllers\ConfigKeyController::class, 'getConfigKey']);
    
    // Member routes - all require authentication
    Route::prefix('setting/members')->group(function () {
        Route::get('/', [App\Http\Controllers\MemberController::class, 'index']);
        Route::post('/', [App\Http\Controllers\MemberController::class, 'store']);
        Route::post('/create-user', [App\Http\Controllers\MemberController::class, 'createUser']);
        Route::get('/{id}', [App\Http\Controllers\MemberController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\MemberController::class, 'update']);
        Route::get('/user/{userId}', [App\Http\Controllers\MemberController::class, 'showByUserId']);
        Route::get('/email/{email}', [App\Http\Controllers\MemberController::class, 'showByEmail']);
        Route::delete('/{id}', [App\Http\Controllers\MemberController::class, 'destroy']);
    });
});
