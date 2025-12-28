<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoomType;
use App\Models\Booking;
use App\Models\RoomInfo;
use App\Models\SpecialOffer;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    private function callDeepSeekApi($prompt)
    {
        $apiKey = env('OPENROUTER_API_KEY');
        if (!$apiKey) {
            return ['error' => 'Lỗi: API key OpenRouter không được cấu hình.'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer $apiKey",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'https://moonbayhotel.com',
                'X-Title' => 'MoonBay Chatbot',
            ])->withOptions([
                'verify' => false,
                'timeout' => 90,
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'deepseek/deepseek-chat-v3-0324:free',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Bạn là trợ lý khách sạn MoonBay. Phân tích câu hỏi của người dùng bằng tiếng Việt và CHỈ trả về một JSON hợp lệ có cấu trúc như sau:
                    {
                        "intent": "lowest_price_room | highest_price_room | mid_tier_room | most_premium_room | room_recommendation | room_types | room_prices | room_capacity | offers | available_rooms | book_room | checkin_policy | cancel_policy | peak_season | off_peak_season | specific_room_info | most_booked_room | least_booked_room | room_price_range | hotel_facilities | room_amenities | room_details | hotel_policies | nearby_attractions | compare_rooms | non_hotel",
                        "params": {
                            "people_count": số_người (nếu có, dùng cho gợi ý phòng),
                            "start_date": "YYYY-MM-DD" (nếu có, dùng cho phòng trống),
                            "end_date": "YYYY-MM-DD" (nếu có, dùng cho phòng trống),
                            "room_type": "tên loại phòng" (nếu có, dùng cho thông tin phòng, tiện ích, hoặc chi tiết phòng),
                            "room_type_1": "tên loại phòng 1" (nếu có, dùng cho so sánh phòng),
                            "room_type_2": "tên loại phòng 2" (nếu có, dùng cho so sánh phòng),
                            "time_granularity": "day | month | year" (nếu có, dùng cho phòng được đặt nhiều/ít nhất),
                            "specific_date": "YYYY-MM-DD" (nếu có, ngày cụ thể cho time_granularity = day),
                            "specific_month": "YYYY-MM" (nếu có, tháng cụ thể cho time_granularity = month),
                            "specific_year": "YYYY" (nếu có, năm cụ thể cho time_granularity = year),
                            "min_price": số_tiền (nếu có, dùng cho khoảng giá phòng),
                            "max_price": số_tiền (nếu có, dùng cho khoảng giá phòng),
                            "policy_type": "pet | airport_shuttle | smoking | child | privacy" (nếu có, dùng cho chính sách cụ thể)
                        },
                        "response": "Câu trả lời bằng ngôn ngữ tự nhiên nếu intent là non_hotel"
                    }
                    - Nếu câu hỏi liên quan đến thông tin khách sạn (giá phòng, loại phòng, phòng trống, ưu đãi, đặt phòng, chính sách, mùa cao điểm, mùa thấp điểm, thông tin phòng cụ thể, phòng được đặt nhiều/ít nhất, phòng hạng trung, khoảng giá phòng, tiện ích khách sạn, tiện ích phòng, chi tiết phòng, chính sách khách sạn, điểm tham quan gần, so sánh phòng, v.v.), xác định intent và params thích hợp.
                    - Nếu câu hỏi liên quan đến chính sách cụ thể (thú cưng, đưa đón sân bay, hút thuốc, trẻ em, bảo mật thông tin), đặt intent là "hotel_policies" và thêm "policy_type" vào params.
                    - Nếu câu hỏi không liên quan đến khách sạn, đặt intent là "non_hotel" và trả lời bằng ngôn ngữ tự nhiên trong "response".
                    - Ví dụ:
                      - Câu hỏi: "Phòng nào rẻ nhất?" -> {"intent": "lowest_price_room", "params": {}}
                      - Câu hỏi: "Phòng đắt nhất là gì?" -> {"intent": "highest_price_room", "params": {}}
                      - Câu hỏi: "Phòng hạng trung là gì?" -> {"intent": "mid_tier_room", "params": {}}
                      - Câu hỏi: "Phòng cao cấp nhất/xinh nhất/đẹp nhất/sang nhất/xịn nhất là gì?" -> {"intent": "most_premium_room", "params": {}}
                      - Câu hỏi: "Phòng Family giá bao nhiêu?" -> {"intent": "specific_room_info", "params": {"room_type": "Family"}}
                      - Câu hỏi: "Tôi đi 4 người thì nên ở phòng nào?" -> {"intent": "room_recommendation", "params": {"people_count": 4}}
                      - Câu hỏi: "Khách sạn có phòng nào chứa được 5 người không?" -> {"intent": "room_recommendation", "params": {"people_count": 5}} // Thêm dòng này
                      - Câu hỏi: "Phòng nào phù hợp cho 6 người?" -> {"intent": "room_recommendation", "params": {"people_count": 6}} // Thêm để tăng độ bao quát
                      - Câu hỏi: "Có phòng trống từ 25/05/2025 đến 27/05/2025 không?" -> {"intent": "available_rooms", "params": {"start_date": "2025-05-25", "end_date": "2025-05-27"}}
                      - Câu hỏi: "Có phòng Suite nào trống từ 1/6/2025 đến 5/6/2025 không?" -> {"intent": "available_rooms", "params": {"start_date": "2025-06-01", "end_date": "2025-06-05", "room_type": "Suite"}}
                      - Câu hỏi: "Phòng Deluxe có trống từ 15/06/2025 đến 20/06/2025 không?" -> {"intent": "available_rooms", "params": {"start_date": "2025-06-15", "end_date": "2025-06-20", "room_type": "Deluxe"}}
                      - Câu hỏi: "Tôi muốn đặt phòng" -> {"intent": "book_room", "params": {}}
                      - Câu hỏi: "Giờ nhận phòng là khi nào?" -> {"intent": "checkin_policy", "params": {}}
                      - Câu hỏi: "Chính sách hủy phòng là gì?" -> {"intent": "cancel_policy", "params": {}}
                      - Câu hỏi: "Mùa nào là cao điểm nhất?" -> {"intent": "peak_season", "params": {}}
                      - Câu hỏi: "Mùa nào là thấp điểm?" -> {"intent": "off_peak_season", "params": {}}
                      - Câu hỏi: "Phòng nào được đặt nhiều nhất trong tháng 5/2025?" -> {"intent": "most_booked_room", "params": {"time_granularity": "month", "specific_month": "2025-05"}}
                      - Câu hỏi: "Phòng nào được đặt ít nhất hôm nay?" -> {"intent": "least_booked_room", "params": {"time_granularity": "day", "specific_date": "hôm nay"}}
                      - Câu hỏi: "Tìm phòng giá từ 400 đến 600" -> {"intent": "room_price_range", "params": {"min_price": 400000, "max_price": 600000}}
                      - Câu hỏi: "Khách sạn có hồ bơi không?" -> {"intent": "hotel_facilities", "params": {}}
                      - Câu hỏi: "Phòng Suite có tiện ích gì?" -> {"intent": "room_amenities", "params": {"room_type": "Suite"}}
                      - Câu hỏi: "Phòng Deluxe đặc biệt ở điểm nào?" -> {"intent": "room_details", "params": {"room_type": "Deluxe"}}
                      - Câu hỏi: "Khách sạn có cho mang thú cưng không?" -> {"intent": "hotel_policies", "params": {"policy_type": "pet"}}
                      - Câu hỏi: "Chính sách đưa đón sân bay là gì?" -> {"intent": "hotel_policies", "params": {"policy_type": "airport_shuttle"}}
                      - Câu hỏi: "Khách sạn có cấm hút thuốc không?" -> {"intent": "hotel_policies", "params": {"policy_type": "smoking"}}
                      - Câu hỏi: "Chính sách cho trẻ em là gì?" -> {"intent": "hotel_policies", "params": {"policy_type": "child"}}
                      - Câu hỏi: "Thông tin cá nhân của khách được bảo mật thế nào?" -> {"intent": "hotel_policies", "params": {"policy_type": "privacy"}}
                      - Câu hỏi: "Người nổi tiếng A có ở khách sạn không?" -> {"intent": "hotel_policies", "params": {"policy_type": "privacy"}}
                      - Câu hỏi: "Thời tiết ở Đà Nẵng thế nào?" -> {"intent": "non_hotel", "params": {}, "response": "Thời tiết ở Đà Nẵng hôm nay..."}
                      - Câu hỏi: "Lễ, Tết, cuối tuần có tăng giá không?" -> {"intent": "price_increase"}
                      - Câu hỏi: "Lễ hoặc Tết có tăng giá không?" -> {"intent": "price_increase"}
                      - Câu hỏi: "Cuối tuần có tăng giá không?" -> {"intent": "price_increase"}
                      - Câu hỏi: "Giá phòng lễ tết có tăng không?" -> {"intent": "price_increase"}
                    - CHỈ trả về JSON hợp lệ, không thêm bất kỳ văn bản nào ngoài JSON (không giải thích, không chú thích).'
                    ],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'stream' => false,
            ])->json();

            Log::info('API Raw Response for prompt: ' . $prompt, $response);
            if (isset($response['error'])) {
                Log::error('OpenRouter API Error: ' . $response['error']['message']);
                return ['error' => 'OpenRouter API trả về lỗi: ' . $response['error']['message']];
            }
            if (!isset($response['choices']) || empty($response['choices'])) {
                Log::warning('No choices found in response');
                return ['error' => 'Không nhận được phản hồi từ từ OpenRouter AI.'];
            }
            $content = $response['choices'][0]['message']['content'] ?? '{}';
            Log::info('Raw content before processing: ' . $content);
            $content = preg_replace('/^```json\n|\n```$/s', '', trim($content));
            Log::info('Raw content after cleaning: ' . $content);
            $decoded = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Failed to decode JSON: ' . json_last_error_msg() . ', raw content: ' . $content);
                return ['error' => 'Lỗi khi phân tích phản hồi từ OpenRouter: ' . json_last_error_msg()];
            }
            Log::info('Decoded intent: ' . json_encode($decoded));
            return $decoded;
        } catch (\Exception $e) {
            Log::error('OpenRouter API Exception: ' . $e->getMessage());
            return ['error' => 'Đã xảy ra lỗi khi kết nối với OpenRouter: ' . $e->getMessage()];
        }
    }

    private function getRoomsInPriceRange($minPrice, $maxPrice)
    {
        $rooms = DB::table('room_types')
            ->select('name', 'price')
            ->whereBetween('price', [$minPrice, $maxPrice])
            ->get();
        if ($rooms->isEmpty()) {
            return "Không có phòng nào trong khoảng giá trị này.\n";
        }
        $response = '';
        foreach ($rooms as $room) {
            $response .= "- {$room->name}: " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
        }
        return $response;
    }

    public function handle(Request $request)
    {
        $userInput = $request->input('prompt');
        if (!$userInput) {
            return response()->json(['error' => 'Missing prompt'], 400);
        }

        $normalizedInput = strtolower($userInput);

        // Fallback regex cho phòng cao cấp
        if (preg_match('/\b(phong xịn nhất|phong đẹp nhất|phong sang nhất|phong cao cấp nhất)\b/', $normalizedInput)) {
            $room = DB::table('room_types')
                ->where('name', 'LIKE', '%Suite%')
                ->select('name', 'price')
                ->first();
            if (!$room) {
                $room = DB::table('room_types')
                    ->select('name', 'price')
                    ->orderBy('price', 'desc')
                    ->first();
                if (!$room) {
                    Log::warning('No rooms found for most premium room');
                    return response()->json(['response' => 'Hiện tại không có phòng cao cấp trong hệ thống.']);
                }
            }
            $response = "Phòng xịn nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho giá phòng cụ thể
        if (preg_match('/\bphong\s+([a-zA-Z\s]+)\s*(gia bao nhieu|giá bao nhiêu|co gia bao nhieu|có giá bao nhiêu)\b/', $normalizedInput, $matches)) {
            $roomType = trim($matches[1]);
            $room = DB::table('room_types')
                ->where('name', 'LIKE', '%' . $roomType . '%')
                ->select('name', 'price', 'capacity')
                ->first();
            if (!$room) {
                Log::warning('No room found for type: ' . $roomType);
                return response()->json(['response' => "Không tìm thấy thông tin về phòng {$roomType} trong hệ thống."]);
            }
            $response = "Phòng {$room->name} có giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm và sức chứa {$room->capacity} người.";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho mùa cao điểm
        if (preg_match('/\b(mua cao diem nhat|mùa cao điểm nhất)\b/', $normalizedInput)) {
            $peakSeason = Booking::select(DB::raw('MONTH(checkin_date) as month, COUNT(*) as booking_count'))
                ->groupBy('month')
                ->orderBy('booking_count', 'desc')
                ->first();
            if (!$peakSeason) {
                Log::warning('No bookings found for peak season');
                return response()->json(['response' => 'Hiện tại không có thông tin về mùa cao điểm trong hệ thống.']);
            }
            $monthName = Carbon::createFromFormat('m', $peakSeason->month)->locale('vi')->monthName;
            $response = "Mùa cao điểm nhất là tháng {$monthName} với số lượng đặt phòng cao nhất.";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho mùa thấp điểm
        if (preg_match('/\b(mua thap diem nhat|mùa thấp điểm nhất)\b/', $normalizedInput)) {
            $offPeakSeason = Booking::select(DB::raw('MONTH(checkin_date) as month, COUNT(*) as booking_count'))
                ->groupBy('month')
                ->orderBy('booking_count', 'asc')
                ->first();
            if (!$offPeakSeason) {
                Log::warning('No bookings found for off-peak season');
                return response()->json(['response' => 'Hiện tại không có thông tin về mùa thấp điểm trong hệ thống.']);
            }
            $monthName = Carbon::createFromFormat('m', $offPeakSeason->month)->locale('vi')->monthName;
            $response = "Mùa thấp điểm nhất là tháng {$monthName} với số lượng đặt phòng thấp nhất.";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho khoảng giá phòng
        if (preg_match('/\b(tim phòng|tìm phòng|phong|phòng)\s*(gia|giá)?\s*tu\s*(\d+\.?\d{0,3})\s*(?:ngan|ngàn|k)?\s*(?:den|đến)\s*(\d+\.?\d{0,3})\s*(?:ngan|ngàn|k)?\b/', $normalizedInput, $matches)) {
            $minPrice = (float)str_replace('.', '', $matches[3]) * 1000;
            $maxPrice = (float)str_replace('.', '', $matches[4]) * 1000;
            $response = "Các phòng trong khoảng giá từ " . number_format($minPrice, 0, ',', '.') . " đến " . number_format($maxPrice, 0, ',', '.') . " VNĐ/đêm:\n\n" . $this->getRoomsInPriceRange($minPrice, $maxPrice);
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho tiện ích khách sạn
        if (preg_match('/\b(khach san|khách sạn)\s*(co gi|co gì|tien ich|tiện ích|ho boi|hồ bơi|phong gym|phòng gym|nha hang|nhà hàng)\b/', $normalizedInput)) {
            $amenities = config('hotel.amenities', []);
            if (empty($amenities)) {
                Log::warning('No hotel amenities found in config');
                return response()->json(['response' => 'Hiện tại không có thông tin về tiện ích khách sạn.']);
            }
            $response = "Tiện ích của khách sạn MoonBay:\n\n";
            foreach ($amenities as $amenity) {
                $response .= "- {$amenity['name']} {$amenity['icon']}\n";
            }
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho tiện ích phòng
        if (preg_match('/\bphong\s+([a-zA-Z\s]+)\s*(co gi|co gì|tien ich|tiện ích)\b/', $normalizedInput, $matches)) {
            $roomType = trim($matches[1]);
            $roomAmenities = config('hotel.room_amenities.' . $roomType, []);
            if (empty($roomAmenities)) {
                Log::warning('No amenities found for room type: ' . $roomType);
                return response()->json(['response' => "Không tìm thấy thông tin tiện ích cho phòng {$roomType}. Bạn muốn biết thêm về các loại phòng khác không?"]);
            }
            $response = "Tiện ích của phòng {$roomType}:\n\n";
            foreach ($roomAmenities as $amenity) {
                $response .= "- {$amenity['name']} {$amenity['icon']}\n";
            }
            $response .= "\nBạn muốn biết thêm về giá phòng {$roomType} hay các điểm tham quan gần khách sạn?";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho chi tiết phòng
        if (preg_match('/\bphong\s+([a-zA-Z\s]+)\s*(dac biet|đặc biệt|co gi khac|phu hop|thich hop)\b/', $normalizedInput, $matches)) {
            $roomType = trim($matches[1]);
            $details = config('hotel.room_details.' . $roomType, []);
            if (empty($details)) {
                Log::warning('No details found for room type: ' . $roomType);
                return response()->json(['response' => "Không tìm thấy thông tin chi tiết cho phòng {$roomType}. Bạn muốn biết về tiện ích phòng này không?"]);
            }
            $response = "Thông tin phòng {$roomType}:\n\n- Mô tả: {$details['description']}\n- Phù hợp: {$details['suitable_for']}\n- Diện tích: {$details['size']}\n";
            $response .= "\nBạn muốn đặt phòng {$roomType} hay so sánh với phòng khác?";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho điểm tham quan gần khách sạn
        if (preg_match('/\b(gan khach san|gần khách sạn|choi|chơi|tham quan|di dau|đi đâu|bai bien|bãi biển)\b/', $normalizedInput)) {
            $attractions = config('hotel.nearby_attractions', []);
            if (empty($attractions)) {
                Log::warning('No nearby attractions found in config');
                return response()->json(['response' => 'Hiện tại không có thông tin về điểm tham quan gần khách sạn.']);
            }
            $response = "Các điểm tham quan gần khách sạn MoonBay:\n\n";
            foreach ($attractions as $attraction) {
                $response .= "- {$attraction['name']} (cách {$attraction['distance']}): {$attraction['description']}\n";
            }
            $response .= "\nBạn muốn biết thêm về tiện ích khách sạn hay đặt phòng?";
            return response()->json(['response' => $response]);
        }

        // Fallback regex cho so sánh phòng
        if (preg_match('/\bso sanh|so sánh\s+phong\s+([a-zA-Z\s]+)\s+(?:va|và)\s+phong\s+([a-zA-Z\s]+)\b/', $normalizedInput, $matches)) {
            $roomType1 = trim($matches[1]);
            $roomType2 = trim($matches[2]);
            $details1 = config('hotel.room_details.' . $roomType1, []);
            $details2 = config('hotel.room_details.' . $roomType2, []);
            $amenities1 = config('hotel.room_amenities.' . $roomType1, []);
            $amenities2 = config('hotel.room_amenities.' . $roomType2, []);
            if (empty($details1) || empty($details2)) {
                Log::warning('Invalid room types for comparison: ' . $roomType1 . ', ' . $roomType2);
                return response()->json(['response' => "Không tìm thấy thông tin để so sánh phòng {$roomType1} và {$roomType2}."]);
            }
            $response = "So sánh phòng {$roomType1} và {$roomType2}:\n\n";
            $response .= "- {$roomType1}:\n  + Diện tích: {$details1['size']}\n  + Phù hợp: {$details1['suitable_for']}\n  + Tiện ích: ";
            $response .= implode(', ', array_column($amenities1, 'name')) . "\n";
            $response .= "- {$roomType2}:\n  + Diện tích: {$details2['size']}\n  + Phù hợp: {$details2['suitable_for']}\n  + Tiện ích: ";
            $response .= implode(', ', array_column($amenities2, 'name')) . "\n";
            $response .= "\nBạn muốn đặt một trong hai phòng này hay cần thêm thông tin?";
            return response()->json(['response' => $response]);
        }

        if (preg_match('/\b(chua duoc|chứa được|phu hop|phù hợp|cho)\s*(\d+)\s*(nguoi|người)\b/u', $normalizedInput, $matches)) {
            $peopleCount = (int)$matches[2];
            $rooms = DB::table('room_types')
                ->select('name', 'price', 'capacity')
                ->where('capacity', '>=', $peopleCount)
                ->orderBy('capacity', 'asc')
                ->orderBy('price', 'asc')
                ->get();
            if ($rooms->isEmpty()) {
                Log::warning('No rooms found for people count: ' . $peopleCount);
                return response()->json(['response' => "Không có phòng phù hợp cho {$peopleCount} người trong hệ thống."]);
            }
            $response = "Dựa trên {$peopleCount} người, tôi gợi ý các phòng sau:\n\n";
            foreach ($rooms as $room) {
                $response .= "- {$room->name}: Sức chứa {$room->capacity} người, giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
            }
            $response .= "\nBạn có muốn đặt phòng hay xem chi tiết phòng nào?";
            return response()->json(['response' => $response]);
        }

        // Gọi DeepSeek API
        $apiResponse = $this->callDeepSeekApi($userInput);

        if (isset($apiResponse['error'])) {
            Log::error('API Response Error: ' . $apiResponse['error']);
            if (preg_match('/\b(thu cung|thú cưng|pet|cho|chó|meo|mèo|thú nuôi|animal)\b/u', $normalizedInput)) {
                $policy = config('hotel.policies.pet_policy', 'Không có thông tin về chính sách thú cưng.');
                return response()->json(['response' => "Rất tiếc, {$policy} Bạn muốn biết thêm về các chính sách khác hay tiện ích khách sạn?"]);
            }
            if (preg_match('/\b(bao mat|bảo mật|rieng tu|riêng tư|thong tin ca nhan|thông tin cá nhân|nguoi noi tieng|người nổi tiếng|kol|celeb|celebrity)\b/u', $normalizedInput)) {
                $policy = config('hotel.policies.privacy_policy', 'Không có thông tin về chính sách bảo mật.');
                return response()->json(['response' => $policy . "\nBạn muốn biết thêm về các chính sách khác hay tiện ích khách sạn?"]);
            }
            return response()->json(['response' => $apiResponse['error']]);
        }

        $intent = $apiResponse['intent'] ?? 'non_hotel';
        $params = $apiResponse['params'] ?? [];

        try {
            switch ($intent) {
                case 'lowest_price_room':
                    $room = DB::table('room_types')
                        ->select('name', 'price')
                        ->orderBy('price', 'asc')
                        ->first();
                    if (!$room) {
                        Log::warning('No rooms found for lowest_price_room');
                        return response()->json(['response' => 'Hiện tại không có thông tin về phòng trong hệ thống.']);
                    }
                    $response = "Phòng có giá rẻ nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
                    return response()->json(['response' => $response]);

                case 'highest_price_room':
                    $room = DB::table('room_types')
                        ->select('name', 'price')
                        ->orderBy('price', 'desc')
                        ->first();
                    if (!$room) {
                        Log::warning('No rooms found for highest_price_room');
                        return response()->json(['response' => 'Hiện tại không có thông tin về phòng trong hệ thống.']);
                    }
                    $response = "Phòng có giá cao nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
                    return response()->json(['response' => $response]);

                case 'mid_tier_room':
                    $rooms = DB::table('room_types')
                        ->select('name', 'price')
                        ->orderBy('price', 'asc')
                        ->get();
                    if ($rooms->count() < 3) {
                        Log::warning('Not enough rooms for mid-tier room query');
                        return response()->json(['response' => 'Hiện tại không có đủ thông tin về phòng để xác định phòng hạng trung.']);
                    }
                    $midTierRooms = $rooms->slice(1, $rooms->count() - 2);
                    if ($midTierRooms->isEmpty()) {
                        Log::warning('No mid-tier rooms found');
                        return response()->json(['response' => 'Không có phòng hạng trung trong hệ thống.']);
                    }
                    $response = "Các phòng hạng trung hiện có:\n";
                    foreach ($midTierRooms as $room) {
                        $response .= "- {$room->name}: " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
                    }
                    return response()->json(['response' => $response]);

                case 'most_premium_room':
                    $room = DB::table('room_types')
                        ->where('name', 'LIKE', '%Suite%')
                        ->select('name', 'price')
                        ->first();
                    if (!$room) {
                        $room = DB::table('room_types')
                            ->select('name', 'price')
                            ->orderBy('price', 'desc')
                            ->first();
                        if (!$room) {
                            Log::warning('No rooms found for most_premium_room');
                            return response()->json(['response' => 'Hiện tại không có phòng cao cấp trong hệ thống.']);
                        }
                    }
                    $response = "Phòng cao cấp nhất là {$room->name} với giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm.";
                    return response()->json(['response' => $response]);

                case 'specific_room_info':
                    $roomType = $params['room_type'] ?? null;
                    if (!$roomType) {
                        return response()->json(['response' => 'Vui lòng cung cấp tên loại phòng để tôi có thể cung cấp thông tin.']);
                    }
                    $room = DB::table('room_types')
                        ->where('name', 'LIKE', '%' . $roomType . '%')
                        ->select('name', 'price', 'capacity')
                        ->first();
                    if (!$room) {
                        Log::warning('No room found for type: ' . $roomType);
                        return response()->json(['response' => "Không tìm thấy thông tin về phòng {$roomType} trong hệ thống."]);
                    }
                    $response = "Phòng {$room->name} có giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm và sức chứa {$room->capacity} người.";
                    $response .= "\nBạn muốn biết thêm về tiện ích hay chi tiết phòng {$room->name}?";
                    return response()->json(['response' => $response]);

                case 'room_recommendation':
                    $peopleCount = $params['people_count'] ?? null;
                    if (!$peopleCount || !is_numeric($peopleCount) || $peopleCount <= 0) {
                        return response()->json(['response' => 'Vui lòng cung cấp số người để tôi có thể gợi ý phòng phù hợp.']);
                    }
                    $rooms = DB::table('room_types')
                        ->select('name', 'price', 'capacity')
                        ->where('capacity', '>=', $peopleCount)
                        ->orderBy('capacity', 'asc')
                        ->orderBy('price', 'asc')
                        ->get();
                    if ($rooms->isEmpty()) {
                        Log::warning('No rooms found for people count: ' . $peopleCount);
                        return response()->json(['response' => "Không có phòng phù hợp cho {$peopleCount} người trong hệ thống."]);
                    }
                    $response = "Dựa trên {$peopleCount} người, tôi gợi ý các phòng sau:\n\n";
                    foreach ($rooms as $room) {
                        $response .= "- {$room->name}: Sức chứa {$room->capacity} người, giá " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
                    }
                    $response .= "\nBạn có muốn đặt phòng hay xem chi tiết phòng nào?";
                    return response()->json(['response' => $response]);

                case 'room_types':
                    $roomTypes = DB::table('room_types')->pluck('name')->toArray();
                    if (empty($roomTypes)) {
                        Log::warning('No room types found');
                        return response()->json(['response' => 'Không tìm thấy loại phòng nào trong hệ thống.']);
                    }
                    $response = "Các loại phòng hiện có: " . implode(', ', $roomTypes) . ".";
                    $response .= "\nBạn muốn biết chi tiết về phòng nào?";
                    return response()->json(['response' => $response]);

                case 'room_prices':
                    $rooms = DB::table('room_types')->select('name', 'price')->get();
                    if ($rooms->isEmpty()) {
                        Log::warning('No rooms found for room_prices');
                        return response()->json(['response' => 'Không tìm thấy thông tin phòng trong hệ thống.']);
                    }
                    $response = "Giá các loại phòng:\n";
                    foreach ($rooms as $room) {
                        $response .= "- {$room->name}: " . number_format($room->price, 0, ',', '.') . " VNĐ/đêm\n";
                    }
                    $response .= "\nBạn muốn so sánh các phòng hay đặt phòng nào?";
                    return response()->json(['response' => $response]);

                case 'room_capacity':
                    $rooms = DB::table('room_types')->select('name', 'capacity')->get();
                    if ($rooms->isEmpty()) {
                        Log::warning('No rooms found for room_capacity');
                        return response()->json(['response' => 'Không tìm thấy thông tin phòng trong hệ thống.']);
                    }
                    $response = "Sức chứa các loại phòng:\n";
                    foreach ($rooms as $room) {
                        $response .= "- {$room->name}: {$room->capacity} người\n";
                    }
                    $response .= "\nBạn muốn gợi ý phòng cho bao nhiêu người?";
                    return response()->json(['response' => $response]);

                case 'offers':
                    $today = Carbon::today();
                    $offers = SpecialOffer::where(function ($query) use ($today) {
                        $query->where(function ($q) use ($today) {
                            $q->where('season_start', '<=', $today)
                                ->where('season_end', '>=', $today);
                        })->orWhere(function ($q) use ($today) {
                            $q->where('discount_start', '<=', $today)
                                ->where('discount_end', '>=', $today);
                        })->orWhere(function ($q) use ($today) {
                            $q->where('gift_start', '<=', $today)
                                ->where('gift_end', '>=', $today);
                        })->orWhere(function ($q) use ($today) {
                            $q->where('other_offer_start', '<=', $today)
                                ->where('other_offer_end', '>=', $today);
                        });
                    })->get();
                    if ($offers->isEmpty()) {
                        Log::warning('No offers found');
                        return response()->json(['response' => 'Hiện tại không có ưu đãi nào đang áp dụng.']);
                    }
                    $response = "Các ưu đãi hiện tại:\n\n";
                    foreach ($offers as $offer) {
                        if ($offer->season && $offer->season_start <= $today && $offer->season_end >= $today) {
                            $response .= "- Mùa: {$offer->season}\n";
                            if ($offer->free_services) {
                                $response .= "  Dịch vụ miễn phí: {$offer->free_services}\n";
                            }
                            $response .= "  Thời gian: {$offer->season_start->format('d/m/Y')} - {$offer->season_end->format('d/m/Y')}\n\n";
                        }
                        if ($offer->discount_percent && $offer->discount_start <= $today && $offer->discount_end >= $today) {
                            $response .= "- Chiết khấu: {$offer->discount_percent}% cho hóa đơn từ " . number_format($offer->total_bill_threshold, 0, ',', '.') . " VNĐ\n";
                            $response .= "  Thời gian: {$offer->discount_start->format('d/m/Y')} - {$offer->discount_end->format('d/m/Y')}\n\n";
                        }
                        if ($offer->gift_description && $offer->gift_start <= $today && $offer->gift_end >= $today) {
                            $response .= "- Quà tặng: {$offer->gift_description} khi ở {$offer->stay_duration_days} ngày\n";
                            $response .= "  Thời gian: {$offer->gift_start->format('d/m/Y')} - {$offer->gift_end->format('d/m/Y')}\n\n";
                        }
                        if ($offer->other_package_description && $offer->other_offer_start <= $today && $offer->other_offer_end >= $today) {
                            $response .= "- Gói ưu đãi khác: {$offer->other_package_description}\n";
                            $response .= "  Thời gian: {$offer->other_offer_start->format('d/m/Y')} - {$offer->other_offer_end->format('d/m/Y')}\n\n";
                        }
                    }
                    $response .= "Để tận dụng các ưu đãi, hãy đặt phòng ngay: [Đặt phòng ngay](/booking#booknow)";
                    return response()->json(['response' => $response]);

                case 'available_rooms':
                    $startDate = !empty($params['start_date']) ? Carbon::createFromFormat('Y-m-d', $params['start_date']) : null;
                    $endDate = !empty($params['end_date']) ? Carbon::createFromFormat('Y-m-d', $params['end_date']) : null;
                    $roomType = !empty($params['room_type']) ? trim(ucfirst(strtolower($params['room_type']))) : null;

                    // Log để debug
                    Log::info('Available rooms request', [
                        'start_date' => $startDate ? $startDate->toDateString() : null,
                        'end_date' => $endDate ? $endDate->toDateString() : null,
                        'room_type' => $roomType
                    ]);

                    if (!$startDate || !$endDate) {
                        Log::warning('Missing start_date or end_date');
                        return response()->json(['response' => 'Vui lòng cung cấp đầy đủ khoảng thời gian (VD: phòng trống từ 25/05/2025 đến 27/05/2025).']);
                    }

                    try {
                        $startDate->startOfDay();
                        $endDate->endOfDay();

                        if ($startDate->greaterThanOrEqualTo($endDate)) {
                            Log::warning('Invalid date range', ['start' => $startDate->toDateString(), 'end' => $endDate->toDateString()]);
                            return response()->json(['response' => 'Ngày bắt đầu phải trước ngày kết thúc.']);
                        }

                        // Lấy danh sách ID phòng đã được đặt trong khoảng thời gian
                        $bookedRoomIds = Booking::where(function ($query) use ($startDate, $endDate) {
                            $query->where('checkin_date', '<=', $endDate)
                                ->where('checkout_date', '>=', $startDate);
                        })->pluck('room_id');

                        Log::info('Booked room IDs', ['booked_room_ids' => $bookedRoomIds->toArray()]);

                        // Lấy danh sách phòng trống
                        $query = RoomInfo::whereNotIn('id', $bookedRoomIds)
                            ->select('type', 'price');

                        // Nếu có room_type (ví dụ: Suite), lọc theo loại phòng
                        if ($roomType) {
                            $query->where('type', $roomType);
                        }

                        $availableRooms = $query->get();

                        Log::info('Available rooms query result', ['rooms' => $availableRooms->toArray()]);

                        if ($availableRooms->isEmpty()) {
                            $message = $roomType
                                ? "Không có phòng {$roomType} trống trong khoảng thời gian từ " . $startDate->format('d/m/Y') . " đến " . $endDate->format('d/m/Y') . "."
                                : "Không có phòng trống trong khoảng thời gian từ " . $startDate->format('d/m/Y') . " đến " . $endDate->format('d/m/Y') . ".";
                            Log::warning($message);
                            return response()->json(['response' => $message]);
                        }

                        // Tóm tắt số lượng phòng trống theo loại
                        $roomSummary = $availableRooms->groupBy('type')->map(function ($rooms) {
                            return [
                                'count' => $rooms->count(),
                                'price' => $rooms->first()->price
                            ];
                        });

                        $response = $roomType
                            ? "Phòng {$roomType} trống từ " . $startDate->format('d/m/Y') . " đến " . $endDate->format('d/m/Y') . ":\n\n"
                            : "Phòng trống từ " . $startDate->format('d/m/Y') . " đến " . $endDate->format('d/m/Y') . ":\n\n";
                        foreach ($roomSummary as $type => $info) {
                            $response .= "Loại phòng {$type} còn {$info['count']} phòng trống, giá " . number_format($info['price'], 0, ',', '.') . " VNĐ/đêm\n\n";
                        }
                        $response .= "\nBạn muốn đặt phòng hay xem chi tiết phòng nào?";
                        return response()->json(['response' => $response]);
                    } catch (\Exception $e) {
                        Log::error('Error querying available rooms', [
                            'error' => $e->getMessage(),
                            'start_date' => $startDate ? $startDate->toDateString() : null,
                            'end_date' => $endDate ? $endDate->toDateString() : null,
                            'room_type' => $roomType
                        ]);
                        return response()->json(['response' => 'Có lỗi khi kiểm tra phòng trống. Vui lòng thử lại sau.']);
                    }

                case 'book_room':
                    $response = "Bạn muốn đặt phòng? Vui lòng nhấp vào liên kết sau để đặt phòng: [Đặt phòng ngay](/booking#booknow)";
                    return response()->json(['response' => $response]);

                case 'checkin_policy':
                    return response()->json(['response' => 'Giờ nhận phòng là 13:00 và giờ trả phòng là trước 12:00.']);

                case 'cancel_policy':
                    return response()->json(['response' => 'Bạn có thể hủy đặt phòng miễn phí trước 48 giờ so với ngày nhận phòng. Sau thời gian đó, bạn sẽ bị tính phí 100% giá trị đặt phòng.']);

                case 'peak_season':
                    $peakSeason = Booking::select(DB::raw('MONTH(checkin_date) as month, COUNT(*) as booking_count'))
                        ->groupBy('month')
                        ->orderBy('booking_count', 'desc')
                        ->first();
                    if (!$peakSeason) {
                        Log::warning('No bookings found for peak season');
                        return response()->json(['response' => 'Hiện tại không có thông tin về mùa cao điểm trong hệ thống.']);
                    }
                    $monthName = Carbon::createFromFormat('m', $peakSeason->month)->locale('vi')->monthName;
                    $response = "Mùa cao điểm nhất là tháng {$monthName} với số lượng đặt phòng cao nhất.";
                    $response .= "\nBạn muốn biết thêm về ưu đãi trong mùa cao điểm?";
                    return response()->json(['response' => $response]);

                case 'off_peak_season':
                    $offPeakSeason = Booking::select(DB::raw('MONTH(checkin_date) as month, COUNT(*) as booking_count'))
                        ->groupBy('month')
                        ->orderBy('booking_count', 'asc')
                        ->first();
                    if (!$offPeakSeason) {
                        Log::warning('No bookings found for off-peak season');
                        return response()->json(['response' => 'Hiện tại không có thông tin về mùa thấp điểm trong hệ thống.']);
                    }
                    $monthName = Carbon::createFromFormat('m', $offPeakSeason->month)->locale('vi')->monthName;
                    $response = "Mùa thấp điểm nhất là tháng {$monthName} với số lượng đặt phòng thấp nhất.";
                    $response .= "\nBạn muốn biết thêm về ưu đãi trong mùa thấp điểm?";
                    return response()->json(['response' => $response]);

                case 'most_booked_room':
                    $timeGranularity = $params['time_granularity'] ?? null;
                    if (!$timeGranularity || !in_array($timeGranularity, ['day', 'month', 'year'])) {
                        return response()->json(['response' => 'Vui lòng cung cấp khoảng thời gian hợp lệ (ngày, tháng, hoặc năm) để tôi có thể tìm phòng được đặt nhiều nhất.']);
                    }

                    $query = Booking::select('room_type', DB::raw('COUNT(*) as booking_count'))
                        ->groupBy('room_type')
                        ->orderBy('booking_count', 'desc')
                        ->orderBy('room_type', 'asc');

                    if ($timeGranularity === 'day') {
                        $specificDate = $params['specific_date'] ?? null;
                        if ($specificDate === 'hôm nay') {
                            $specificDate = Carbon::today()->format('Y-m-d');
                        }
                        if (!$specificDate) {
                            return response()->json(['response' => 'Vui lòng cung cấp ngày cụ thể (VD: hôm nay hoặc 25/05/2025) để tôi có thể tìm phòng được đặt nhiều nhất.']);
                        }
                        $date = Carbon::createFromFormat('Y-m-d', $specificDate);
                        $query->whereDate('checkin_date', '<=', $date)
                            ->whereDate('checkout_date', '>=', $date);
                        $periodLabel = "ngày " . $date->format('d/m/Y');
                    } elseif ($timeGranularity === 'month') {
                        $specificMonth = $params['specific_month'] ?? null;
                        if (!$specificMonth) {
                            return response()->json(['response' => 'Vui lòng cung cấp tháng cụ thể (VD: 05/2025) để tôi có thể tìm phòng được đặt nhiều nhất.']);
                        }
                        $monthStart = Carbon::createFromFormat('Y-m', $specificMonth)->startOfMonth();
                        $monthEnd = $monthStart->copy()->endOfMonth();
                        $query->where('checkin_date', '<=', $monthEnd)
                            ->where('checkout_date', '>=', $monthStart);
                        $monthName = $monthStart->locale('vi')->monthName;
                        $periodLabel = "tháng {$monthName} năm {$monthStart->year}";
                    } else {
                        $specificYear = $params['specific_year'] ?? null;
                        if (!$specificYear) {
                            return response()->json(['response' => 'Vui lòng cung cấp năm cụ thể (VD: 2025) để tôi có thể tìm phòng được đặt nhiều nhất.']);
                        }
                        $yearStart = Carbon::createFromFormat('Y', $specificYear)->startOfYear();
                        $yearEnd = $yearStart->copy()->endOfYear();
                        $query->where('checkin_date', '<=', $yearEnd)
                            ->where('checkout_date', '>=', $yearStart);
                        $periodLabel = "năm {$specificYear}";
                    }

                    $mostBooked = $query->first();
                    if (!$mostBooked) {
                        Log::warning('No bookings found for most booked room');
                        return response()->json(['response' => "Không có dữ liệu đặt phòng nào trong {$periodLabel}."]);
                    }
                    $response = "Phòng được đặt nhiều nhất trong {$periodLabel} là loại phòng {$mostBooked->room_type} với {$mostBooked->booking_count} lượt đặt.";
                    $response .= "\nBạn muốn xem chi tiết phòng {$mostBooked->room_type}?";
                    return response()->json(['response' => $response]);

                case 'least_booked_room':
                    $timeGranularity = $params['time_granularity'] ?? null;
                    if (!$timeGranularity || !in_array($timeGranularity, ['day', 'month', 'year'])) {
                        return response()->json(['response' => 'Vui lòng cung cấp khoảng thời gian hợp lệ (ngày, tháng, hoặc năm) để tôi có thể tìm phòng được đặt ít nhất.']);
                    }

                    $query = Booking::select('room_type', DB::raw('COUNT(*) as booking_count'))
                        ->groupBy('room_type')
                        ->orderBy('booking_count', 'asc')
                        ->orderBy('room_type', 'asc');

                    if ($timeGranularity === 'day') {
                        $specificDate = $params['specific_date'] ?? null;
                        if ($specificDate === 'hôm nay') {
                            $specificDate = Carbon::today()->format('Y-m-d');
                        }
                        if (!$specificDate) {
                            return response()->json(['response' => 'Vui lòng cung cấp ngày cụ thể (VD: hôm nay hoặc 25/05/2025) để tôi có thể tìm phòng được đặt ít nhất.']);
                        }
                        $date = Carbon::createFromFormat('Y-m-d', $specificDate);
                        $query->whereDate('checkin_date', '<=', $date)
                            ->whereDate('checkout_date', '>=', $date);
                        $periodLabel = "ngày " . $date->format('d/m/Y');
                    } elseif ($timeGranularity === 'month') {
                        $specificMonth = $params['specific_month'] ?? null;
                        if (!$specificMonth) {
                            return response()->json(['response' => 'Vui lòng cung cấp tháng cụ thể (VD: 05/2025) để tôi có thể tìm phòng được đặt ít nhất.']);
                        }
                        $monthStart = Carbon::createFromFormat('Y-m', $specificMonth)->startOfMonth();
                        $monthEnd = $monthStart->copy()->endOfMonth();
                        $query->where('checkin_date', '<=', $monthEnd)
                            ->where('checkout_date', '>=', $monthStart);
                        $monthName = $monthStart->locale('vi')->monthName;
                        $periodLabel = "tháng {$monthName} năm {$monthStart->year}";
                    } else {
                        $specificYear = $params['specific_year'] ?? null;
                        if (!$specificYear) {
                            return response()->json(['response' => 'Vui lòng cung cấp năm cụ thể (VD: 2025) để tôi có thể tìm phòng được đặt ít nhất.']);
                        }
                        $yearStart = Carbon::createFromFormat('Y', $specificYear)->startOfYear();
                        $yearEnd = $yearStart->copy()->endOfYear();
                        $query->where('checkin_date', '<=', $yearEnd)
                            ->where('checkout_date', '>=', $yearStart);
                        $periodLabel = "năm {$specificYear}";
                    }

                    $leastBooked = $query->first();
                    if (!$leastBooked) {
                        Log::warning('No bookings found for least booked room');
                        return response()->json(['response' => "Không có dữ liệu đặt phòng nào trong {$periodLabel}."]);
                    }
                    $response = "Phòng được đặt ít nhất trong {$periodLabel} là loại phòng {$leastBooked->room_type} với {$leastBooked->booking_count} lượt đặt.";
                    $response .= "\nBạn muốn xem chi tiết phòng {$leastBooked->room_type}?";
                    return response()->json(['response' => $response]);

                case 'room_price_range':
                    $minPrice = $params['min_price'] ?? null;
                    $maxPrice = $params['max_price'] ?? null;
                    if (!$minPrice || !$maxPrice || !is_numeric($minPrice) || !is_numeric($maxPrice) || $minPrice < 0 || $maxPrice < $minPrice) {
                        return response()->json(['response' => 'Vui lòng cung cấp khoảng giá hợp lệ (VD: từ 400.000 đến 600.000 VNĐ).']);
                    }
                    $response = "Các phòng trong khoảng giá từ " . number_format($minPrice, 0, ',', '.') . " đến " . number_format($maxPrice, 0, ',', '.') . " VNĐ/đêm:\n\n" . $this->getRoomsInPriceRange($minPrice, $maxPrice);
                    $response .= "\nBạn muốn xem chi tiết phòng nào trong danh sách này?";
                    return response()->json(['response' => $response]);

                case 'hotel_facilities':
                    $amenities = config('hotel.amenities', []);
                    if (empty($amenities)) {
                        Log::warning('No hotel amenities found');
                        return response()->json(['response' => 'Hiện tại không có thông tin về tiện ích khách sạn.']);
                    }
                    $response = "Tiện ích của khách sạn MoonBay:\n\n";
                    foreach ($amenities as $item) {
                        $response .= "- {$item['name']} {$item['icon']}\n";
                    }
                    $response .= "\nBạn muốn biết thêm về các điểm tham quan gần khách sạn?";
                    return response()->json(['response' => $response]);

                case 'room_amenities':
                    $roomType = $params['room_type'] ?? null;
                    if (!$roomType) {
                        return response()->json(['response' => 'Vui lòng cung cấp tên loại phòng để tôi có thể cung cấp thông tin tiện ích.']);
                    }
                    $roomAmenities = config('hotel.room_amenities.' . $roomType, []);
                    if (empty($roomAmenities)) {
                        Log::warning('No amenities found for room type: ' . $roomType);
                        return response()->json(['response' => "Không tìm thấy thông tin tiện ích cho phòng {$roomType}. Bạn muốn biết về chi tiết phòng này không?"]);
                    }
                    $response = "Tiện ích của phòng {$roomType}:\n\n";
                    foreach ($roomAmenities as $amenity) {
                        $response .= "- {$amenity['name']} {$amenity['icon']}\n";
                    }
                    $response .= "\nBạn muốn biết thêm về giá phòng {$roomType} hay so sánh với phòng khác?";
                    return response()->json(['response' => $response]);

                case 'room_details':
                    $roomType = $params['room_type'] ?? null;
                    if (!$roomType) {
                        return response()->json(['response' => 'Vui lòng cung cấp tên loại phòng để tôi có thể cung cấp thông tin chi tiết.']);
                    }
                    $details = config('hotel.room_details.' . $roomType, []);
                    if (empty($details)) {
                        Log::warning('No details found for room type: ' . $roomType);
                        return response()->json(['response' => "Không tìm thấy thông tin chi tiết cho phòng {$roomType}. Bạn muốn biết về tiện ích phòng này không?"]);
                    }
                    $response = "Thông tin phòng {$roomType}:\n\n- Mô tả: {$details['description']}\n- Phù hợp: {$details['suitable_for']}\n- Diện tích: {$details['size']}\n";
                    $response .= "\nBạn muốn đặt phòng {$roomType} hay so sánh với phòng khác?";
                    return response()->json(['response' => $response]);

                case 'hotel_policies':
                    // Sửa đổi: Ưu tiên policy_type từ DeepSeek API trước khi dùng regex
                    $policyType = $params['policy_type'] ?? null;
                    $policyMap = [
                        'pet' => 'pet_policy',
                        'airport_shuttle' => 'airport_shuttle',
                        'smoking' => 'smoking_policy',
                        'child' => 'child_policy',
                        'privacy' => 'privacy_policy',
                    ];

                    if ($policyType && isset($policyMap[$policyType])) {
                        $policy = config('hotel.policies.' . $policyMap[$policyType], 'Không có thông tin về chính sách này.');
                        // Sửa đổi: Tùy chỉnh phản hồi để tự nhiên hơn
                        $prefix = ($policyType === 'pet') ? 'Rất tiếc, ' : '';
                        $response = $prefix . $policy . "\nBạn muốn biết thêm về các chính sách khác hay tiện ích khách sạn?";
                    } else {
                        // Fallback regex nếu API không cung cấp policy_type
                        // Sửa đổi: Sử dụng regex với hỗ trợ Unicode và mở rộng từ khóa
                        if (preg_match('/\b(thu cung|thú cưng|pet|cho|chó|meo|mèo|thú nuôi|animal)\b/u', $normalizedInput)) {
                            $policy = config('hotel.policies.pet_policy', 'Không có thông tin về chính sách thú cưng.');
                            $response = "Rất tiếc, {$policy} Bạn có muốn biết thêm về các chính sách khác hay tiện ích khách sạn?";
                        } elseif (preg_match('/\b(dua don|đưa đón|sân bay|shuttle|airport)\b/u', $normalizedInput)) {
                            $policy = config('hotel.policies.airport_shuttle', 'Không có thông tin về dịch vụ đưa đón sân bay.');
                            $response = $policy . "\nBạn muốn biết thêm về các chính sách khác hay tiện ích khách sạn?";
                        } elseif (preg_match('/\b(hut thuoc|hút thuốc|smoking)\b/u', $normalizedInput)) {
                            $policy = config('hotel.policies.smoking_policy', 'Không có thông tin về chính sách hút thuốc.');
                            $response = $policy . "\nBạn có muốn biết thêm về các chính sách khác hay tiện ích khách sạn?";
                        } elseif (preg_match('/\b(tre em|trẻ em|con nít|be|bé|trẻ nhỏ|kid|child)\b/u', $normalizedInput)) {
                            $policy = config('hotel.policies.child_policy', 'Không có thông tin về chính sách trẻ em.');
                            $response = $policy . "\nBạn có muốn biết thêm về các chính sách khác hay tiện ích khách sạn?";
                        } elseif (preg_match('/\b(bao mat|bảo mật|rieng tu|riêng tư|thong tin ca nhan|thông tin cá nhân|nguoi noi tieng|người nổi tiếng|kol|celeb|celebrity)\b/u', $normalizedInput)) {
                            $policy = config('hotel.policies.privacy_policy', 'Không có thông tin về chính sách bảo mật.');
                            $response = $policy . "\nBạn muốn biết thêm về các chính sách khác hay tiện ích khách sạn?";
                        } else {
                            // Nếu không xác định được chính sách cụ thể, trả về toàn bộ chính sách
                            $policies = config('hotel.policies', []);
                            if (empty($policies)) {
                                Log::warning('No policies found');
                                return response()->json(['response' => 'Hiện tại không có thông tin về chính sách khách sạn.']);
                            }
                            $response = "Chính sách của khách sạn MoonBay:\n\n";
                            foreach ($policies as $key => $value) {
                                $response .= "- {$value}\n";
                            }
                            $response .= "\nBạn muốn biết thêm về tiện ích khách sạn hay các loại phòng?";
                        }
                    }
                    return response()->json(['response' => $response]);

                case 'nearby_attractions':
                    $attractions = config('hotel.nearby_attractions', []);
                    if (empty($attractions)) {
                        Log::warning('No nearby attractions found');
                        return response()->json(['response' => 'Hiện tại không có thông tin về điểm tham quan gần khách sạn.']);
                    }
                    $response = "Các điểm tham quan gần khách sạn MoonBay:\n\n";
                    foreach ($attractions as $attraction) {
                        $response .= "- {$attraction['name']} (cách {$attraction['distance']}): {$attraction['description']}\n";
                    }
                    $response .= "\nBạn muốn biết thêm về tiện ích khách sạn hay đặt phòng?";
                    return response()->json(['response' => $response]);
                case 'price_increase':
                    $response = "";
                    if (strpos($normalizedInput, 'lễ') !== false || strpos($normalizedInput, 'tết') !== false) {
                        $response .= "Lễ, Tết tăng 50%.";
                    }
                    if (strpos($normalizedInput, 'cuối tuần') !== false) {
                        $response .= " Cuối tuần tăng 20%.";
                    }
                    if (empty($response)) {
                        $response = "Khách sạn không áp dụng tăng giá cho các ngày thường.";
                    }
                    $response .= "\nBạn có muốn kiểm tra thêm thông tin nào không?";
                    return response()->json(['response' => $response]);

                case 'compare_rooms':
                    $roomType1 = $params['room_type_1'] ?? null;
                    $roomType2 = $params['room_type_2'] ?? null;
                    if (!$roomType1 || !$roomType2) {
                        return response()->json(['response' => 'Vui lòng cung cấp hai loại phòng để so sánh (VD: so sánh phòng Superior và Deluxe).']);
                    }
                    $details1 = config('hotel.room_details.' . $roomType1, []);
                    $details2 = config('hotel.room_details.' . $roomType2, []);
                    $amenities1 = config('hotel.room_amenities.' . $roomType1, []);
                    $amenities2 = config('hotel.room_amenities.' . $roomType2, []);
                    if (empty($details1) || empty($details2)) {
                        Log::warning('Invalid room types for comparison: ' . $roomType1 . ', ' . $roomType2);
                        return response()->json(['response' => "Không tìm thấy thông tin để so sánh phòng {$roomType1} và {$roomType2}."]);
                    }
                    $response = "So sánh phòng {$roomType1} và {$roomType2}:\n\n";
                    $response .= "- {$roomType1}:\n  + Diện tích: {$details1['size']}\n  + Phù hợp: {$details1['suitable_for']}\n  + Tiện ích: ";
                    $response .= implode(', ', array_column($amenities1, 'name')) . "\n";
                    $response .= "- {$roomType2}:\n  + Diện tích: {$details2['size']}\n  + Phù hợp: {$details2['suitable_for']}\n  + Tiện ích: ";
                    $response .= implode(', ', array_column($amenities2, 'name')) . "\n";
                    $response .= "\nBạn muốn đặt một trong hai phòng này hay cần thêm thông tin?";
                    return response()->json(['response' => $response]);

                case 'non_hotel':
                    $response = $apiResponse['response'] ?? 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
                    $response .= "\nBạn muốn biết về khách sạn MoonBay, như tiện ích, phòng, hay điểm tham quan gần đây?";
                    return response()->json(['response' => $response]);

                default:
                    Log::warning('Unrecognized intent: ' . $intent);
                    return response()->json(['response' => 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử lại hoặc hỏi về phòng, tiện ích, chính sách, hoặc điểm tham quan gần khách sạn.']);
            }
        } catch (\Exception $e) {
            Log::error('Database query error: ' . $e->getMessage());
            return response()->json(['response' => 'Lỗi khi truy vấn cơ sở dữ liệu: ' . $e->getMessage()], 500);
        }
    }
}
