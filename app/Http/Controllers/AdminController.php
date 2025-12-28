<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function banUser($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->is_banned) {
            return response()->json(['message' => 'User is already banned'], 409);
        }

        $user->update(['is_banned' => 1]);
        return response()->json(['message' => 'User has been banned and can no longer submit reviews']);
    }

    public function unbanUser($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if (!$user->is_banned) {
            return response()->json(['message' => 'User is not banned'], 409);
        }

        $user->update(['is_banned' => 0]);
        return response()->json(['message' => 'User has been unbanned and can now submit reviews']);
    }
}