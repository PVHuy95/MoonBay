<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\RoomInfo;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class RoomInfoController extends Controller
{
    /**
     * Hiển thị danh sách các phòng.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10); // Số bản ghi mỗi trang, mặc định 10
            $rooms = RoomInfo::paginate($perPage);

            return response()->json([
                'data' => $rooms->items(),
                'current_page' => $rooms->currentPage(),
                'last_page' => $rooms->lastPage(),
                'total' => $rooms->total(),
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unable to fetch room list.',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    public function store(Request $request)
    {
        try {
            // Xác thực dữ liệu
            $validator = Validator::make($request->all(), [
                'room_number' => 'required|string|max:255|unique:rooms',
                'type' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'status' => 'required|in:available,booked,maintenance',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Tạo phòng mới
            $room = RoomInfo::create([
                'room_number' => $request->room_number,
                'type' => $request->type,
                'price' => $request->price,
                'status' => $request->status,
            ]);

            return response()->json([
                'message' => 'Thêm phòng thành công!',
                'data' => $room,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Thêm phòng thất bại. Vui lòng thử lại sau.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin phòng
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // Tìm phòng theo ID
            $room = RoomInfo::find($id);

            if (!$room) {
                return response()->json([
                    'message' => 'Phòng không tồn tại.',
                ], 404);
            }

            // Xác thực dữ liệu
            $validator = Validator::make($request->all(), [
                'room_number' => 'required|string|max:255|unique:rooms,room_number,' . $id,
                'type' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'status' => 'required|in:available,booked,maintenance',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Cập nhật phòng
            $room->update([
                'room_number' => $request->room_number,
                'type' => $request->type,
                'price' => $request->price,
                'status' => $request->status,
            ]);

            return response()->json([
                'message' => 'Cập nhật phòng thành công!',
                'data' => $room,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Cập nhật phòng thất bại. Vui lòng thử lại sau.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa phòng
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            // Tìm phòng theo ID
            $room = RoomInfo::find($id);

            if (!$room) {
                return response()->json([
                    'message' => 'Phòng không tồn tại.',
                ], 404);
            }

            // Xóa phòng
            $room->delete();

            return response()->json([
                'message' => 'Xóa phòng thành công!',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Xóa phòng thất bại. Vui lòng thử lại sau.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
