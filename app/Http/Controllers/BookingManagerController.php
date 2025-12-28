<?php

namespace App\Http\Controllers;

use App\Models\BookingManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingManagerController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 30);
            $checkinDateLte = $request->input('checkin_date_lte');
            $checkoutDateGte = $request->input('checkout_date_gte');

            $query = BookingManager::with('room');

            // Lọc booking dựa trên khoảng thời gian chồng lấn
            if ($checkinDateLte && $checkoutDateGte) {
                $query->where(function ($query) use ($checkinDateLte, $checkoutDateGte) {
                    $query->where('checkin_date', '<=', $checkinDateLte)
                          ->where('checkout_date', '>=', $checkoutDateGte);
                });
            }

            $bookings = $query->paginate($perPage);

            // Định dạng dữ liệu trả về
            $formattedBookings = collect($bookings->items())->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'room_id' => $booking->room_id,
                    'checkin_date' => $booking->checkin_date,
                    'checkout_date' => $booking->checkout_date,
                    'check_status' => $booking->check_status,
                    'actual_check_in' => $booking->actual_check_in,
                    'actual_check_out' => $booking->actual_check_out,
                    'name' => $booking->name ?? 'Unknown', // Xử lý trường hợp name null
                    'phone' => $booking->phone ?? 'N/A',   // Xử lý trường hợp phone null
                    'room' => $booking->room ? [
                        'id' => $booking->room->id,
                        'room_number' => $booking->room->room_number,
                        'status' => $booking->room->status,
                    ] : null,
                ];
            })->toArray();

            return response()->json([
                'data' => $formattedBookings,
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'total' => $bookings->total(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch bookings: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'checkin_date' => 'required|date',
                'checkout_date' => 'required|date|after_or_equal:checkin_date',
                'check_status' => 'required|in:not checked in,checked in,checked out',
                'actual_check_in' => 'nullable|date',
                'actual_check_out' => 'nullable|date|after_or_equal:actual_check_in',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $booking = BookingManager::findOrFail($id);

            // Kiểm tra xung đột khi gia hạn checkout_date
            if ($request->check_status === 'checked in' && $request->checkout_date > $booking->checkout_date) {
                $conflictingBooking = BookingManager::where('room_id', $booking->room_id)
                    ->where('id', '!=', $id)
                    ->where(function ($query) use ($request, $booking) {
                        $query->whereBetween('checkin_date', [$booking->checkin_date, $request->checkout_date])
                              ->orWhereBetween('checkout_date', [$booking->checkin_date, $request->checkout_date])
                              ->orWhere(function ($q) use ($booking, $request) {
                                  $q->where('checkin_date', '<=', $booking->checkin_date)
                                    ->where('checkout_date', '>=', $request->checkout_date);
                              });
                    })
                    ->exists();

                if ($conflictingBooking) {
                    return response()->json(['error' => 'New check-out date conflicts with another booking'], 409);
                }
            }

            $booking->update($request->only([
                'checkin_date',
                'checkout_date',
                'check_status',
                'actual_check_in',
                'actual_check_out',
            ]));

            // Trả về dữ liệu booking đã cập nhật
            return response()->json([
                'id' => $booking->id,
                'room_id' => $booking->room_id,
                'checkin_date' => $booking->checkin_date,
                'checkout_date' => $booking->checkout_date,
                'check_status' => $booking->check_status,
                'actual_check_in' => $booking->actual_check_in,
                'actual_check_out' => $booking->actual_check_out,
                'name' => $booking->name ?? 'Unknown',
                'phone' => $booking->phone ?? 'N/A',
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update booking: ' . $e->getMessage()], 500);
        }
    }
}