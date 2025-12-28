<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        // Lấy user từ middleware
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000', // Đổi integer thành numeric để hỗ trợ decimal
            'method' => 'required|string',
            'bank_account_receiver' => 'nullable|string',
            'payment_info' => 'nullable|string',
            'status' => 'nullable|string|in:pending,paid,failed',
            'is_deposit' => 'required|boolean', // Thêm trường is_deposit
            'total_amount' => 'required|numeric|min:0', // Thêm trường total_amount
        ]);

        // Kiểm tra logic: nếu is_deposit = true, amount phải nhỏ hơn hoặc bằng total_amount
        if ($validated['is_deposit'] && $validated['amount'] > $validated['total_amount']) {
            return response()->json([
                'error' => 'Deposit amount cannot exceed total amount.'
            ], 422);
        }

        // Lưu giao dịch vào bảng payments
        $payment = Payment::create([
            'user_id' => $user->id,
            'method' => $validated['method'],
            'amount' => $validated['amount'],
            'bank_account_receiver' => $validated['bank_account_receiver'] ?? null,
            'payment_info' => $validated['payment_info'] ?? null,
            'status' => $validated['status'] ?? 'paid',
            'is_deposit' => $validated['is_deposit'],
            'total_amount' => $validated['total_amount'],
        ]);

        return response()->json([
            'message' => 'Payment saved successfully.',
            'payment' => $payment,
        ], 201);
    }
}