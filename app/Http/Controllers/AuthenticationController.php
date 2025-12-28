<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Closure;
class AuthenticationController extends Controller
{
    public function handle(Request $request, Closure $next)
{
    $authHeader = $request->header('Authorization');

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return response()->json(['message' => 'Token missing'], 401);
    }

    $token = substr($authHeader, 7);

    $user = User::where('remember_token', $token)->first();

    if (!$user) {
        return response()->json(['message' => 'Invalid token'], 401);
    }

    Auth::login($user);

    return $next($request);
}


}