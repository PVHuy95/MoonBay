<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;
use App\Models\ServicePricing;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class ServiceController extends Controller
{
    // Lấy danh sách tất cả dịch vụ kèm pricing
    public function index()
    {
        $services = Service::with('pricing')->get();
        return response()->json($services);
    }

    // Thêm mới một dịch vụ
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'detailed_description' => 'nullable|string',
            'working_hours' => 'nullable|string',
        ]);
        $service = Service::create($validated);
        return response()->json($service, 201);
    }

    // Cập nhật dịch vụ
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'detailed_description' => 'nullable|string',
            'working_hours' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);
        $service = Service::findOrFail($id);
        $service->update($validated);
        return response()->json($service);
    }

    // Xóa một dịch vụ và pricing liên quan
    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Thêm pricing cho dịch vụ
    public function addPricing(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'type' => 'required|string',
            'value' => 'required|string',
        ]);
        $pricing = ServicePricing::create($validated);
        return response()->json($pricing, 201);
    }

    // Xóa toàn bộ pricing của 1 service (dùng khi cập nhật)
    public function deleteAllPricing($serviceId)
    {
        ServicePricing::where('service_id', $serviceId)->delete();
        return response()->json(['message' => 'All pricing deleted']);
    }

    // Hàm upload ảnh dịch vụ
    public function uploadServiceImage(Request $request)
    {
        // if ($request->hasFile('image')) {
        //     $file = $request->file('image');
        //     $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
        //     $path = $file->storeAs('images/Long/Services', $filename, 'public');
        //     $fullPath = '/storage/' . $path;

        //     // Xóa ảnh cũ nếu có
        //     if ($request->has('oldImage')) {
        //         $oldImage = $request->input('oldImage');
        //         $oldImage = ltrim($oldImage, './');
        //         // Nếu ảnh cũ nằm trong public/images hoặc storage, xóa file
        //         $oldPath = public_path($oldImage);
        //         if (file_exists($oldPath)) {
        //             @unlink($oldPath);
        //         } else {
        //             // Nếu ảnh lưu trong storage/app/public
        //             $storagePath = storage_path('app/public/' . str_replace('storage/', '', $oldImage));
        //             if (file_exists($storagePath)) {
        //                 @unlink($storagePath);
        //             }
        //         }
        //     }

        //     return response()->json(['path' => $fullPath]);
        // }
        if ($request->hasFile('image')) {
            $uploadedFileUrl = Cloudinary::upload($request->file('image')->getRealPath())->getSecurePath();
            return response()->json(['path' => $uploadedFileUrl]);
        }
        return response()->json(['error' => 'No file uploaded'], 400);
    }
}
