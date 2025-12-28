<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\Booking_email_successfully;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class Booking_email_successfullyController extends Controller
{
    public function sendEmail(Request $request)
    {
        // Kiểm tra dữ liệu đầu vào (giữ nguyên quy tắc xác thực ban đầu)
        $validator = Validator::make($request->all(), [
            'to' => 'required|email',
            'user_name' => 'required|string',
            'room_type' => 'required|string',
            'number_of_rooms' => 'required|integer|min:1',
            'checkin_date' => 'required|date',
            'checkout_date' => 'required|date|after:checkin_date',
            'total_price' => 'required|string',
            'deposit_paid' => 'required|string',
            'remaining_amount' => 'required|string',
            'payment_status' => 'required|string',
            'member' => 'required|integer|min:1',
            'children' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Lấy dữ liệu đã xác thực
            $validated = $validator->validated();

            // Chuyển đổi kiểu dữ liệu và gán vào $bookingData
            $bookingData = [
                'user_name' => strval($validated['user_name']), // Chuỗi
                'room_type' => strval($validated['room_type']), // Chuỗi
                'number_of_rooms' => intval($validated['number_of_rooms']), // Số nguyên
                'checkin_date' => $validated['checkin_date'], // Giữ nguyên định dạng ngày
                'checkout_date' => $validated['checkout_date'], // Giữ nguyên định dạng ngày
                'total_price' => floatval(str_replace(',', '', $validated['total_price'])), // Chuyển chuỗi thành số
                'deposit_paid' => floatval(str_replace(',', '', $validated['deposit_paid'])), // Chuyển chuỗi thành số
                'remaining_amount' => floatval(str_replace(',', '', $validated['remaining_amount'])), // Chuyển chuỗi thành số
                'payment_status' => strval($validated['payment_status']), // Chuỗi
                'member' => intval($validated['member']), // Số nguyên
                'children' => intval($validated['children']), // Số nguyên
            ];

            // Gửi email
            Mail::to($validated['to'])->send(new Booking_email_successfully($bookingData));

            return response()->json(['message' => 'Booking confirmation email sent successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error sending email: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send email',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}