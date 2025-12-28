<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Booking;
use App\Models\RoomInfo;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function booking(Request $request)
    {
        try {
            // Xác thực dữ liệu
            $validatedData = $request->validate([
                'user_id' => 'required|exists:users,id',
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'phone' => 'nullable|string|max:15',
                'room_type' => 'required|string',
                'number_of_rooms' => 'required|integer|min:1',
                'children' => 'required|integer|min:0',
                'member' => 'required|integer|min:1',
                'price' => 'required|numeric',
                'total_price' => 'required|numeric',
                'deposit_paid' => 'required|numeric|min:0', // Thêm trường deposit_paid
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date|after:checkin_date',
                'status' => 'required|string|in:pending_payment,confirmed,cancelled', // Thêm trường status
            ]);

            // Kiểm tra xem room_type có tồn tại trong bảng rooms không
            $roomTypeExists = RoomInfo::where('type', $validatedData['room_type'])->exists();
            if (!$roomTypeExists) {
                return response()->json([
                    'message' => 'Invalid room type.',
                ], 422);
            }

            // Lấy danh sách phòng thuộc room_type và trạng thái available
            $availableRooms = RoomInfo::where('type', $validatedData['room_type'])
                ->where('status', 'available')
                ->get();

            // Kiểm tra các phòng còn trống trong khoảng thời gian yêu cầu
            $checkinDate = Carbon::parse($validatedData['checkin_date']);
            $checkoutDate = Carbon::parse($validatedData['checkout_date']);

            $bookedRoomIds = Booking::where(function ($query) use ($checkinDate, $checkoutDate) {
                $query->where('checkin_date', '<=', $checkoutDate)
                      ->where('checkout_date', '>=', $checkinDate);
            })->pluck('room_id')->toArray();

            // Lọc các phòng không bị đặt
            $freeRooms = $availableRooms->filter(function ($room) use ($bookedRoomIds) {
                return !in_array($room->id, $bookedRoomIds);
            })->take($validatedData['number_of_rooms']);

            // Kiểm tra nếu không đủ phòng
            if ($freeRooms->count() < $validatedData['number_of_rooms']) {
                return response()->json([
                    'message' => 'Not enough available rooms for the selected dates.',
                    'available_rooms' => $freeRooms->count(),
                ], 422);
            }

            // Tạo booking cho từng phòng
            $bookings = [];
            $totalPricePerRoom = $validatedData['total_price'] / $validatedData['number_of_rooms'];
            $assignedRoomIds = $freeRooms->pluck('id')->toArray();

            DB::transaction(function () use ($validatedData, $freeRooms, $totalPricePerRoom, &$bookings) {
                foreach ($freeRooms as $room) {
                    $booking = Booking::create([
                        'user_id' => $validatedData['user_id'],
                        'name' => $validatedData['name'],
                        'email' => $validatedData['email'],
                        'phone' => $validatedData['phone'],
                        'room_type' => $validatedData['room_type'],
                        'number_of_rooms' => 1,
                        'children' => $validatedData['children'],
                        'member' => $validatedData['member'],
                        'price' => $validatedData['price'],
                        'total_price' => $totalPricePerRoom,
                        'deposit_paid' => $validatedData['deposit_paid'], // Lưu số tiền đặt cọc
                        'checkin_date' => $validatedData['checkin_date'],
                        'checkout_date' => $validatedData['checkout_date'],
                        'room_id' => $room->id,
                        'status' => $validatedData['status'], // Lưu trạng thái
                    ]);
                    $bookings[] = $booking;
                }

                // Cập nhật trạng thái phòng (nếu cần)
                // Ví dụ: $freeRooms->each->update(['status' => 'booked']);
            });

            // Ghi log các room_id được gán
            Log::info('Booking created with room IDs:', ['room_ids' => $assignedRoomIds]);

            return response()->json([
                'message' => 'Booking created successfully!',
                'bookings' => $bookings,
                'room_ids' => $assignedRoomIds,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Booking Error:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create booking.', 'error' => $e->getMessage()], 500);
        }
    }

    public function getUserBookings($id)
    {
        $bookings = Booking::where('user_id', $id)->get();

        if ($bookings->isEmpty()) {
            return response()->json(['message' => 'No bookings found', 'bookings' => []], 200);
        }

        return response()->json(['bookings' => $bookings], 200);
    }

    public function destroy(Request $request, $id)
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $user = User::where('remember_token', $token)->first();

            if (!$user) {
                Log::warning('Invalid token', ['token' => $token]);
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $booking = Booking::findOrFail($id);

            if ($booking->user_id != $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $checkinDate = Carbon::parse($booking->checkin_date);
            $now = Carbon::now();

            if ($now >= $checkinDate) {
                return response()->json(['message' => 'Cannot cancel booking. Check-in time has passed or is due.'], 422);
            }

            if ($booking->room_id) {
                RoomInfo::where('id', $booking->room_id)->update(['status' => 'available']);
            }

            $booking->delete();

            return response()->json(['message' => 'Booking cancelled successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Cancel Booking Error:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to cancel booking.', 'error' => $e->getMessage()], 500);
        }
    }

    public function bookingList(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 30);
            $page = $request->input('page', 1);
            $search = $request->input('search');

            $query = Booking::select('id', 'name', 'email', 'phone', 'room_type', 'number_of_rooms', 'children', 'member', 'checkin_date', 'checkout_date', 'total_price', 'created_at', 'room_id');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('room_type', 'like', "%{$search}%");
                });
            }

            $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'data' => $bookings->items(),
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Lỗi khi lấy danh sách đặt phòng: ' . $e->getMessage());
            return response()->json([
                'message' => 'Lỗi khi lấy danh sách đặt phòng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function booking_by_staff(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'user_id' => 'required|exists:users,id',
                'name' => 'required|string|max:255',
                'email' => 'required|string',
                'phone' => 'required|string|max:15',
                'room_type' => 'required|string',
                'number_of_rooms' => 'required|integer|min:1',
                'children' => 'required|integer|min:0',
                'member' => 'required|integer|min:1',
                'price' => 'required|numeric',
                'total_price' => 'required|numeric',
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date|after:checkin_date',
            ]);

            // Kiểm tra room_type
            $roomTypeExists = RoomInfo::where('type', $validatedData['room_type'])->exists();
            if (!$roomTypeExists) {
                return response()->json([
                    'message' => 'Invalid room type.',
                ], 422);
            }

            // Tìm phòng còn trống
            $availableRooms = RoomInfo::where('type', $validatedData['room_type'])
                ->where('status', 'available')
                ->get();

            $checkinDate = Carbon::parse($validatedData['checkin_date']);
            $checkoutDate = Carbon::parse($validatedData['checkout_date']);

            $bookedRoomIds = Booking::where(function ($query) use ($checkinDate, $checkoutDate) {
                $query->where('checkin_date', '<=', $checkoutDate)
                      ->where('checkout_date', '>=', $checkinDate);
            })->pluck('room_id')->toArray();

            $freeRooms = $availableRooms->filter(function ($room) use ($bookedRoomIds) {
                return !in_array($room->id, $bookedRoomIds);
            })->take($validatedData['number_of_rooms']);

            if ($freeRooms->count() < $validatedData['number_of_rooms']) {
                return response()->json([
                    'message' => 'Not enough available rooms for the selected dates.',
                    'available_rooms' => $freeRooms->count(),
                ], 422);
            }

            // Tạo booking
            $bookings = [];
            $totalPricePerRoom = $validatedData['total_price'] / $validatedData['number_of_rooms'];
            $assignedRoomIds = $freeRooms->pluck('id')->toArray();

            DB::transaction(function () use ($validatedData, $freeRooms, $totalPricePerRoom, &$bookings) {
                foreach ($freeRooms as $room) {
                    $booking = Booking::create([
                        'user_id' => $validatedData['user_id'],
                        'name' => $validatedData['name'],
                        'email' => $validatedData['email'],
                        'phone' => $validatedData['phone'],
                        'room_type' => $validatedData['room_type'],
                        'number_of_rooms' => 1,
                        'children' => $validatedData['children'],
                        'member' => $validatedData['member'],
                        'price' => $validatedData['price'],
                        'total_price' => $totalPricePerRoom,
                        'checkin_date' => $validatedData['checkin_date'],
                        'checkout_date' => $validatedData['checkout_date'],
                        'room_id' => $room->id,
                    ]);
                    $bookings[] = $booking;
                }
            });

            Log::info('Staff booking created with room IDs:', ['room_ids' => $assignedRoomIds]);

            return response()->json([
                'message' => 'Booking created successfully!',
                'bookings' => $bookings,
                'room_ids' => $assignedRoomIds,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Booking Error:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create booking.', 'error' => $e->getMessage()], 500);
        }
    }

    public function checkAvailableRooms(Request $request)
    {
        try {
            // Xác thực dữ liệu đầu vào
            $validatedData = $request->validate([
                'room_type' => 'required|string',
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date|after:checkin_date',
            ]);

            // Kiểm tra xem room_type có tồn tại không
            $roomTypeExists = RoomInfo::where('type', $validatedData['room_type'])->exists();
            if (!$roomTypeExists) {
                return response()->json([
                    'message' => 'Invalid room type.',
                ], 422);
            }

            // Lấy danh sách phòng thuộc room_type và trạng thái available
            $availableRooms = RoomInfo::where('type', $validatedData['room_type'])
                ->where('status', 'available')
                ->pluck('id')
                ->toArray();

            // Kiểm tra các phòng đã được đặt trong khoảng thời gian yêu cầu
            $checkinDate = Carbon::parse($validatedData['checkin_date']);
            $checkoutDate = Carbon::parse($validatedData['checkout_date']);

            $bookedRoomIds = Booking::where(function ($query) use ($checkinDate, $checkoutDate) {
                $query->where('checkin_date', '<=', $checkoutDate)
                    ->where('checkout_date', '>=', $checkinDate);
            })->pluck('room_id')->toArray();

            // Lọc các phòng không bị đặt
            $freeRooms = array_diff($availableRooms, $bookedRoomIds);

            // Trả về số lượng phòng trống
            return response()->json([
                'available_rooms' => count($freeRooms),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Check Available Rooms Error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to retrieve available rooms.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}