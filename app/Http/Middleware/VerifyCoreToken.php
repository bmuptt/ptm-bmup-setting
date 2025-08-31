<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Response;

class VerifyCoreToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        // Ambil cookie dari request frontend
        $token = $request->cookie('token');

        if (!$token) {
            return Response::json(['message' => 'Unauthorized. Missing cookies.'], 401);
        }

        // Kirim request ke backend Express untuk validasi token
        $response = Http::withHeaders([
            'Cookie' => "token={$token}"
        ])->get(env('API_URL_CORE') . '/profile');

        if ($response->status() !== 200) {
            return Response::json(['message' => 'Unauthorized. Invalid token.'], 401);
        }

        // $request->merge(['profile_user' => $response->json()]);

        // Set custom user resolver agar Auth::user() bisa digunakan
        $request->setUserResolver(function () use ($response) {
            $responseData = $response->json();
            $profile = $responseData['profile'];
            return (object) [
                'id' => $profile['id'],
                'name' => $profile['name'],
                'email' => $profile['email']
            ];
        });

        return $next($request);
    }
}
