<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\FollowEmail;

class FollowEmailController extends Controller
{
    public function store(Request $request)
    {
        // Kiểm tra định dạng và trùng
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:follow_emails,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first('email')
            ], 400);
        }

        // Lưu email
        FollowEmail::create([
            'email' => $request->email
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Email has been registered successfully!'
        ]);
    }
}
