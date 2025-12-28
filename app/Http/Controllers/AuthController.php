<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use App\Models\Booking;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|numeric|digits_between:10,15|unique:users,phone',
                'password' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
            ]);

            // Token đã được tự động tạo bởi model User (trong boot method)

            return response()->json([
                'message' => 'Registration successful',
                'user' => $user,
                'token' => $user->remember_token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            // Ghi log thông tin yêu cầu đăng nhập
            Log::info('Login attempt', ['email' => $request->input('email')]);

            // Validate request
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);
            Log::info('Validation passed', $validated);

            // Tìm user theo email
            $user = User::where('email', $validated['email'])->first();
            if (!$user) {
                Log::warning('User not found', ['email' => $validated['email']]);
                return response()->json(['message' => 'Invalid credentials'], 401);
            }
            Log::info('User found', ['user_id' => $user->id]);

            // Kiểm tra password
            if (!Hash::check($validated['password'], $user->password)) {
                Log::warning('Password mismatch', ['email' => $validated['email']]);
                return response()->json(['message' => 'Invalid credentials'], 401);
            }
            Log::info('Password verified');

            // Tạo token mới và lưu vào remember_token
            $token = Str::random(60);
            $user->remember_token = $token;
            $user->save();
            Log::info('Token generated and saved', ['user_id' => $user->id, 'token' => $token]);

            // Trả về thông tin user và token
            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                ],
                'token' => $token,
            ], 200);
        } catch (\Exception $e) {
            // Ghi log lỗi nếu có ngoại lệ
            Log::error('Login Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return response()->json(['message' => 'Login failed: ' . $e->getMessage()], 500);
        }
    }

    public function ForgotPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
            ], [
                'email.required' => 'Email is required.',
                'email.email' => 'Please provide a valid email address.',
                'email.exists' => 'This email is not registered.',
            ]);

            $status = Password::sendResetLink(
                $request->only('email')
            );

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'message' => 'A password reset link has been sent to your email address.',
                    'status' => $status,
                ], 200);
            }

            return response()->json([
                'message' => 'Unable to send reset link. Please try again later.',
                'status' => $status,
            ], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Forgot Password Error:', ['error' => $e->getMessage(), 'email' => $request->email]);
            return response()->json(['message' => 'An unexpected error occurred.'], 500);
        }
    }

    public function ResetPassword(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required',
                'email' => 'required|email|exists:users,email',
                'password' => 'required|min:8|confirmed',
            ], [
                'password.confirmed' => 'The password confirmation does not match.',
                'password.min' => 'Password must be at least 8 characters.',
            ]);

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->password = Hash::make($password);
                    $user->save();
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json(['message' => 'Password has been reset successfully.'], 200);
            }

            return response()->json(['message' => __($status)], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Reset Password Error:', ['error' => $e->getMessage(), 'data' => $request->all()]);
            return response()->json(['message' => 'An unexpected error occurred.'], 500);
        }
    }

   public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    try {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        if ($user->id != $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ];

        // Chỉ cập nhật avatar nếu có file mới
        // if ($request->hasFile('avatar')) {
        //     Log::info('Avatar file detected:', ['file' => $request->file('avatar')->getClientOriginalName()]);

        //     if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
        //         Storage::disk('public')->delete($user->avatar);
        //         Log::info('Old avatar deleted:', ['path' => $user->avatar]);
        //     }

        //     $path = $request->file('avatar')->store('avarta_user', 'public');
        //     Log::info('New avatar stored:', ['path' => $path]);
        //     $userData['avatar'] = $path;
        // }
        if ($request->hasFile('avatar')) {
            Log::info('Avatar file detected:', ['file' => $request->file('avatar')->getClientOriginalName()]);

            $uploadedFileUrl = Cloudinary::upload($request->file('avatar')->getRealPath())->getSecurePath();
            Log::info('New avatar uploaded to Cloudinary:', ['url' => $uploadedFileUrl]);
            $userData['avatar'] = $uploadedFileUrl;
        }

        $user->update($userData);
        $updatedUser = User::find($id);
        Log::info('User updated in database:', ['user' => $updatedUser->toArray()]);

        Booking::where('user_id', $id)->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ]);

        // Sử dụng giá trị avatar từ database, nếu null thì giữ giá trị cũ từ prevUser
        // $avatarUrl = !empty($updatedUser->avatar)
        //     ? url('/storage/' . $updatedUser->avatar)
        //     : ($user->avatar ? url('/storage/' . $user->avatar) : '/images/Dat/avatar/default.png');
        $avatarUrl = $updatedUser->avatar ?? '/images/Dat/avatar/default.png';

        Log::info('Avatar URL:', ['url' => $avatarUrl]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => array_merge($updatedUser->toArray(), [
                'avatar' => $avatarUrl,
            ]),
        ], 200);
    } catch (\Exception $e) {
        Log::error('Update User Error: ' . $e->getMessage());
        return response()->json(['message' => 'Failed to update user: ' . $e->getMessage()], 500);
    }
}

    public function changePassword(Request $request, $id)
    {
        // Lấy token từ header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Tìm user dựa trên remember_token
        $user = User::where('remember_token', $token)->first();

        if (!$user) {
            \Log::warning('Invalid token', ['token' => $token]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Kiểm tra user có quyền truy cập
        if ($user->id != $id) {
            \Log::warning('ChangePassword - Unauthorized access attempt', ['id' => $id, 'user_id' => $user->id]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validation dữ liệu
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        // Kiểm tra mật khẩu hiện tại
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        // Cập nhật mật khẩu mới
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully'], 200);
    }

    // function login with google (CAUTION: This function is dangerous, do not change anything here)
    public function redirectToGoogle()
    {
        try {
            Log::info('Redirecting to Google for login', [
                'client_id' => config('services.google.client_id'),
                'redirect_uri' => config('services.google.redirect'),
            ]);

            $url = Socialite::driver('google')
                ->setScopes([
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                ])
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            Log::info('Google redirect URL generated', ['url' => $url]);
            return response()->json(['url' => $url], 200);
        } catch (\Exception $e) {
            Log::error('Google Redirect Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to redirect to Google: ' . $e->getMessage()], 500);
        }
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            Log::info('Google callback received', ['request' => $request->all()]);
            $googleUser = Socialite::driver('google')
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->stateless()
                ->user();

            $user = User::where('email', $googleUser->email)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => Hash::make(uniqid()),
                    'provider' => 'google',
                    'avatar' => $googleUser->avatar,
                ]);
            } else {
                $user->update([
                    'avatar' => $googleUser->avatar,
                ]);
            }

            if (!$user->remember_token) {
                $user->remember_token = \Illuminate\Support\Str::random(60);
                $user->save();
            }

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'token' => $user->remember_token,
                'role' => $user->role,
                'status' => $user->status,
                'provider' => $user->provider,
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];

            // Redirect về frontend với token và user trong query string
            $redirectUrl = 'http://localhost:8000/auth/callback?' . http_build_query([
                'token' => $user->remember_token,
                'user' => json_encode($userData),
            ]);

            return redirect($redirectUrl);
        } catch (\Exception $e) {
            // Redirect về frontend với lỗi
            $redirectUrl = 'http://localhost:8000/auth/callback?' . http_build_query([
                'error' => 'Google login failed: ' . $e->getMessage(),
            ]);
            return redirect($redirectUrl);
        }
    }

    public function getUser(Request $request)
{
    $token = $request->header('Authorization');
    $token = str_replace('Bearer ', '', $token);

    $user = User::where('remember_token', $token)->first();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'avatar' => $user->avatar,
        'phone' => $user->phone,
        'role' => $user->role,
        'status' => $user->status,
        'provider' => $user->provider,
        'created_at' => $user->created_at,
        'updated_at' => $user->updated_at,
    ]);
}

    public function registerbystaff(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|max:255',
                'phone' => 'required|numeric|digits_between:10,15|unique:users,phone',
                'password' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
            ]);

            // Token đã được tự động tạo bởi model User (trong boot method)

            // return response()->json([
            //     'message' => 'Registration successful',
            //     'user' => $user,
            //     'token' => $user->remember_token,
            // ], 201);

            Log::info('User registered successfully', ['user_id' => $user->id]);
        } catch (\Exception $e) {
            Log::error('Registration Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

}