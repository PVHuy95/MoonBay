<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Review;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function indexUser(Request $request)
{
    $query = Review::query();

    if ($request->has('filter_rating') && is_numeric($request->filter_rating)) {
        $query->where('rating', $request->filter_rating);
    }

    $query->orderByDesc('created_at');

    $reviews = $query->paginate(3);

    $ratingsCount = Review::selectRaw('rating, COUNT(*) as count')
        ->groupBy('rating')
        ->pluck('count', 'rating')
        ->toArray();

    return response()->json([
        'reviews' => $reviews,
        'ratingsCount' => $ratingsCount,
    ]);
}

public function indexAdmin(Request $request)
{
    $query = Review::with('user');

    if ($request->has('filter_rating') && is_numeric($request->filter_rating)) {
        $query->where('rating', $request->filter_rating);
    }

    if ($request->has('sort_rating')) {
        if ($request->sort_rating === 'asc') {
            $query->orderBy('rating', 'asc');
        } elseif ($request->sort_rating === 'desc') {
            $query->orderBy('rating', 'desc');
        }
    } else {
        $query->latest();
    }

    $reviews = $query->paginate(10);

    $ratingsCount = Review::selectRaw('rating, COUNT(*) as count')
        ->groupBy('rating')
        ->pluck('count', 'rating')
        ->toArray();

    return response()->json([
        'reviews' => $reviews,
        'ratingsCount' => $ratingsCount,
    ]);
}




    public function store(Request $request)
{
    $user = Auth::user();
    
    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    if ($user->is_banned) {
        return response()->json(['message' => 'You are banned and cannot submit reviews. Contact support for assistance.'], 403);
    }

    $validated = $request->validate([
        'rating' => 'required|integer|min:1|max:5',
        'comment' => 'required|string',
    ]);

    Review::create([
        'user_id' => $user->id,
        'email' => $user->email,
        'rating' => $validated['rating'],
        'comment' => $validated['comment'],
    ]);

    return response()->json(['message' => 'Review added successfully']);
}

public function destroy($id)
{
    $review = Review::find($id);

    if (!$review) {
        return response()->json(['message' => 'Review không tồn tại'], 404);
    }

    $review->delete();

    return response()->json(['message' => 'Review đã được xóa thành công']);
}

public function reply(Request $request, $id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'admin_reply' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Reply is required'], 400);
        }

        $review->admin_reply = $request->admin_reply;
        $review->save();

        return response()->json(['message' => 'Reply submitted successfully', 'review' => $review]);
    }

public function getReviewsByUserID($id)
    {
        try {
            // Lấy danh sách reviews dựa trên $id (user_id)
            $reviews = Review::where('user_id', $id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
            ], 500);
        }
    }

}