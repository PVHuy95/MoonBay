<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\StaffCustomerNote;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StaffCustomerManagementController extends Controller
{
    /**
     * Constructor với middleware auth
     */
    public function __construct()
    {
       
    }

    /**
     * Display a listing of the resource.
     * Cho phép tìm kiếm khách hàng theo tên, số điện thoại, email.
     */
    public function index(Request $request)
    {
        \Log::info('Bắt đầu lấy danh sách khách hàng', [
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'params' => $request->all()
        ]);

        $query = User::query();

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        if ($request->has('email')) {
            $query->where('email', 'like', '%' . $request->input('email') . '%');
        }

        if ($request->has('phone')) {
            $query->where('phone', 'like', '%' . $request->input('phone') . '%');
        }

        if ($request->has('customer_type')) {
            $query->where('customer_type', 'like', '%'. $request->input('customer_type'). '%');
        }

        $query->where('role', 'user');

        $customers = $query->get();

        \Log::info('Lấy danh sách khách hàng thành công', [
            'count' => $customers->count()
        ]);

        return response()->json($customers, Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     * Hiển thị lịch sử lưu trú, các ghi chú đặc biệt nổi bật.
     */
    public function show($id)
    {
        try {
            // Tìm khách hàng theo ID
            $customer = User::findOrFail($id);

            // Lấy lịch sử lưu trú từ bảng booking_rooms
            $stayHistory = \App\Models\Booking::where('user_id', $id)
                ->orderBy('checkin_date', 'desc')
                ->get();

            return response()->json([
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'customer_type' => $customer->customer_type,
                'special_notes' => $customer->special_notes,
                'stay_history' => $stayHistory,
                'created_at' => $customer->created_at,
                'updated_at' => $customer->updated_at,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching customer details', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the special notes for the specified resource in storage.
     * Cho phép cập nhật ghi chú ngay trên trang chi tiết khách hàng.
     */
    public function updateNotes(Request $request, $id)
    {
        $request->validate([
            'special_notes' => 'nullable|string|max:1000',
            'customer_type' => 'nullable|string|max:50',
        ]);

        try {
            \Log::info("Bắt đầu cập nhật ghi chú cho khách hàng ID: {$id}", [
                'customer_type' => $request->input('customer_type')
            ]);
            $customer = User::findOrFail($id);
            $customer->special_notes = $request->input('special_notes');
            if ($request->has('customer_type')) {
                $customer->customer_type = $request->input('customer_type');
            }
            $customer->save();

            \Log::info("Cập nhật ghi chú thành công cho khách hàng ID: {$id}");

            return response()->json([
                'message' => 'Customer notes updated successfully.',
                'customer' => $customer,
            ], Response::HTTP_OK);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error("Không tìm thấy khách hàng ID: {$id}");
            return response()->json(['message' => 'Customer not found'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            \Log::error("Lỗi khi cập nhật ghi chú cho khách hàng ID: {$id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error updating customer notes', 'error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created customer note in storage.
     * Chức năng được chuyển từ StaffCustomerNoteController
     */
    public function store(Request $request)
    {
        \Log::info('Bắt đầu lưu ghi chú khách hàng', $request->all());
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'note' => 'nullable|string', // Cho phép note bỏ trống
            'customer_type' => 'required|string|in:regular,vip,special',
        ]);
    
        try {
            // Xử lý token thủ công
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
    
            $token = substr($authHeader, 7);
            $staff = User::where('remember_token', $token)->first();
            
            if (!$staff) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            
            $note = new StaffCustomerNote();
            $note->user_id = $request->user_id;
            $note->staff_id = $staff->id;
            $note->staff_name = $staff->name;
            $note->note = $request->note;
            $note->customer_type = $request->customer_type;
            \Log::info('Trước khi lưu CustomerNote', $note->toArray());
            $note->save();
            \Log::info('Đã lưu CustomerNote thành công', ['id' => $note->id]);
    
            $customer = User::find($request->user_id);
            if ($customer) {
                $customer->customer_type = $request->customer_type;
                $customer->save();
                \Log::info('Đã cập nhật loại khách hàng', [
                    'user_id' => $customer->id,
                    'customer_type' => $customer->customer_type
                ]);
            }
    
            return response()->json([
                'message' => 'Ghi chú khách hàng đã được lưu thành công.',
                'note' => $note,
            ], Response::HTTP_CREATED);
    
        } catch (\Exception $e) {
            \Log::error('Lỗi khi lưu ghi chú khách hàng', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Có lỗi xảy ra khi lưu ghi chú khách hàng.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Lấy danh sách ghi chú của một khách hàng (theo user_id)
     */
    public function getCustomerNotes($user_id)
    {
        try {
            $notes = StaffCustomerNote::where('user_id', $user_id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json([
                'notes' => $notes
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể lấy danh sách ghi chú',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}