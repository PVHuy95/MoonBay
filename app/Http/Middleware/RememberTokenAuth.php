<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RememberTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('RememberTokenAuth middleware triggered');

        $authHeader = $request->header('Authorization');
        Log::info('Received Authorization Header', ['header' => $authHeader]);

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            Log::warning('Token missing or malformed');
            return response()->json(['message' => 'Token missing'], 401);
        }

        $token = substr($authHeader, 7);
        Log::info('Extracted Token', ['token' => $token]);

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            Log::warning('Invalid token', ['token' => $token]);
            return response()->json(['message' => 'Invalid token'], 401);
        }

        if ($user->is_banned) {
            return response()->json(['message' => 'Banned users cannot access this resource'], 403);
        }

        Auth::guard('web')->login($user);
        Log::info('User authenticated', ['user_id' => $user->id]);

        return $next($request);
    }
}
