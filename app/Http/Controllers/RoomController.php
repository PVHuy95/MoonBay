<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class RoomController extends Controller
{
    public function index()
    {
        $roomTypes = RoomType::all()->map(function ($roomType) {
            // $roomType->image_url = $roomType->image ? asset('storage/' . $roomType->image) : null;
            $roomType->image_url = $roomType->image;
            return $roomType;
        });

        return response()->json($roomTypes, 200);
    }

    public function show()
    {
        $roomTypes = RoomType::all()->map(function ($roomType) {
            return [
                'id' => $roomType->id,
                'name' => $roomType->name,
                'price' => $roomType->price,
                'capacity' => $roomType->capacity,
            ];
        });

        return response()->json(['room_types' => $roomTypes], 200);
    }

    public function update(Request $request, $id)
    {
        try {
            $roomType = RoomType::findOrFail($id);

            $request->validate([
                'name' => 'sometimes|string|max:255',
                'capacity' => 'sometimes|integer|min:1',
                'price' => 'sometimes|numeric|min:0',
                'description' => 'sometimes|string|nullable',
                'image' => 'sometimes|file|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [
                'image.file' => 'The image field must be a file.',
                'image.image' => 'The image must be a valid image (JPEG, PNG, JPG, GIF).',
                'image.max' => 'The image size must not exceed 2MB.',
                'capacity.integer' => 'The capacity must be a valid integer.',
                'capacity.min' => 'The capacity must be at least 1.',
                'price.numeric' => 'The price must be a valid number.',
                'price.min' => 'The price must be non-negative.',
            ]);

            Log::info('Data received from request:', $request->all());

            $roomType->fill($request->except('image'));

            // if ($request->hasFile('image')) {
            //     // Delete old image if exists
            //     if ($roomType->image && Storage::disk('public')->exists($roomType->image)) {
            //         Log::info('Deleting old image:', ['file' => $roomType->image]);
            //         Storage::disk('public')->delete($roomType->image);
            //     }

            //     // Use original filename
            //     $filename = $request->file('image')->getClientOriginalName();
            //     $filename = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $filename); // Sanitize filename
            //     if (Storage::disk('public')->exists('room_types_huy/' . $filename)) {
            //         Log::warning('File already exists, will overwrite:', ['file' => $filename]);
            //     }
            //     $path = $request->file('image')->storeAs('room_types_huy', $filename, 'public');
            //     $roomType->image = $path;
            // }
            if ($request->hasFile('image')) {
                $uploadedFileUrl = Cloudinary::upload($request->file('image')->getRealPath())->getSecurePath();
                $roomType->image = $uploadedFileUrl;
                Log::info('New image uploaded to Cloudinary:', ['url' => $uploadedFileUrl]);
            }

            $roomType->save();

            // $imageUrl = $roomType->image ? asset('storage/' . $roomType->image) : null;
            $imageUrl = $roomType->image; // Cloudinary trả về URL đầy đủ

            Log::info('Room type updated successfully:', [
                'id' => $id,
                'data' => $roomType->toArray(),
            ]);

            return response()->json([
                'message' => 'Room type updated successfully',
                'data' => [
                    'id' => $roomType->id,
                    'name' => $roomType->name,
                    'capacity' => $roomType->capacity,
                    'price' => $roomType->price,
                    'description' => $roomType->description,
                    'image' => $imageUrl,
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', ['errors' => $e->errors(), 'request' => $request->all()]);
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating room:', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'error' => 'Failed to update room: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'capacity' => 'required|integer|min:1',
                'price' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [
                'image.file' => 'The image field must be a file.',
                'image.image' => 'The image must be a valid image (JPEG, PNG, JPG, GIF).',
                'image.max' => 'The image size must not exceed 2MB.',
                'name.required' => 'The room name is required.',
                'capacity.required' => 'The capacity is required.',
                'capacity.integer' => 'The capacity must be a valid integer.',
                'capacity.min' => 'The capacity must be at least 1.',
                'price.required' => 'The price is required.',
                'price.numeric' => 'The price must be a valid number.',
                'price.min' => 'The price must be non-negative.',
            ]);

            $room = new RoomType();
            $room->name = $validatedData['name'];
            $room->capacity = $validatedData['capacity'];
            $room->price = $validatedData['price'];
            $room->description = $validatedData['description'] ?? null;

            // if ($request->hasFile('image')) {
            //     $file = $request->file('image');
            //     $filename = $file->getClientOriginalName();
            //     $filename = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $filename); // Sanitize filename
            //     if (Storage::disk('public')->exists('room_types_huy/' . $filename)) {
            //         Log::warning('File already exists, will overwrite:', ['file' => $filename]);
            //     }
            //     $path = $file->storeAs('room_types_huy', $filename, 'public');
            //     $room->image = $path;
            // }

            if ($request->hasFile('image')) {
                $uploadedFileUrl = Cloudinary::upload($request->file('image')->getRealPath())->getSecurePath();
                $room->image = $uploadedFileUrl;
                Log::info('New image uploaded to Cloudinary:', ['url' => $uploadedFileUrl]);
            }

            $room->save();

            // $imageUrl = $room->image ? asset('storage/' . $room->image) : null;
            $imageUrl = $room->image; // Cloudinary trả về URL đầy đủ

            Log::info('Room type created successfully:', ['data' => $room->toArray()]);

            return response()->json([
                'message' => 'Room type created successfully',
                'data' => [
                    'id' => $room->id,
                    'name' => $room->name,
                    'capacity' => $room->capacity,
                    'price' => $room->price,
                    'description' => $room->description,
                    'image' => $imageUrl,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', ['errors' => $e->errors(), 'request' => $request->all()]);
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating room:', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json([
                'error' => 'Failed to add room: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(RoomType $room_type)
    {
        try {
            // if ($room_type->image && Storage::disk('public')->exists($room_type->image)) {
            //     Storage::disk('public')->delete($room_type->image);
            //     Log::info('Image deleted successfully:', ['file' => $room_type->image]);
            // }
            if ($room_type->image) {
                try {
                    $publicId = extractCloudinaryPublicId($room_type->image);
                    if ($publicId) {
                        Cloudinary::destroy($publicId);
                        Log::info('Image deleted from Cloudinary:', ['publicId' => $publicId]);
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to delete image from Cloudinary', ['error' => $e->getMessage()]);
                }
            }

            $room_type->delete();

            Log::info('Room type deleted successfully:', ['id' => $room_type->id]);

            return response()->json(['message' => 'Deleted successfully.'], 204);
        } catch (\Exception $e) {
            Log::error('Error deleting room:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to delete room: ' . $e->getMessage(),
            ], 500);
        }
    }
}
