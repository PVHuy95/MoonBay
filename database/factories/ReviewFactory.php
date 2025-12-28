<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    public function definition()
    {
        // Danh sách tên người dùng tiếng Việt cho email
        $vietnameseUsernames = [
            'nguyen_van_an', 'tran_thi_bich', 'le_hoang_nam', 'pham_minh_tu',
            'hoang_thi_mai', 'vu_van_hung', 'dang_thi_lan', 'bui_duc_minh',
            'ngo_thanh_tung', 'doan_thi_huong', 'nguyen_thi_lien', 'tran_van_duc',
            'le_thi_hong', 'pham_van_khoa', 'hoang_duc_thang', 'vu_thi_ngoc',
            'dang_van_long', 'bui_thi_thao', 'ngo_van_tai', 'doan_thi_phuong',
            'nguyen_anh_tuan', 'tran_thi_cuc', 'le_van_hai', 'pham_thi_dung',
            'hoang_van_bao', 'vu_thi_hien', 'dang_thi_mai', 'bui_van_son',
            'ngo_thi_kim', 'doan_van_phuc'
        ];

        // Danh sách bình luận tiếng Việt về khách sạn MoonBay
        $vietnameseComments = [
            // Tích cực
            'Khách sạn MoonBay tuyệt vời, phòng sạch sẽ và nhân viên rất nhiệt tình!',
            'Trải nghiệm tại MoonBay thật đáng nhớ, view biển đẹp mê hồn.',
            'Phòng ở MoonBay rộng rãi, tiện nghi, rất đáng tiền!',
            'Dịch vụ của MoonBay cực kỳ chuyên nghiệp, nhân viên thân thiện.',
            'MoonBay có hồ bơi đẹp, đồ ăn sáng đa dạng và ngon miệng.',
            'Vị trí khách sạn MoonBay rất tiện lợi, gần biển và trung tâm.',
            'Tôi rất hài lòng với kỳ nghỉ tại MoonBay, sẽ quay lại lần sau!',
            'Khách sạn MoonBay có không gian sang trọng, dịch vụ 5 sao.',
            'Phòng ở MoonBay sạch sẽ, giường êm, ngủ rất ngon.',
            'MoonBay là lựa chọn tuyệt vời cho kỳ nghỉ gia đình, rất an toàn.',
            'Nhân viên MoonBay hỗ trợ nhiệt tình, check-in nhanh chóng.',
            'Không gian MoonBay yên tĩnh, phù hợp để thư giãn và nghỉ ngơi.',
            'Đồ ăn tại nhà hàng MoonBay rất ngon, đặc biệt là hải sản.',
            'MoonBay có thiết kế hiện đại, phòng tắm sạch và tiện nghi.',
            'Kỳ nghỉ tại MoonBay thật tuyệt, nhân viên luôn mỉm cười chào đón.',
            // Trung lập
            'Khách sạn MoonBay ổn, nhưng wifi hơi yếu vào buổi tối.',
            'Phòng ở MoonBay đẹp, nhưng giá hơi cao so với kỳ vọng.',
            'Dịch vụ MoonBay tốt, nhưng cần cải thiện tốc độ check-out.',
            'MoonBay có vị trí đẹp, nhưng bãi đỗ xe hơi nhỏ.',
            'Đồ ăn ở MoonBay ngon, nhưng thực đơn cần đa dạng hơn.',
            'Phòng ở MoonBay sạch, nhưng cách âm chưa được tốt lắm.',
            'MoonBay có không gian đẹp, nhưng dịch vụ đưa đón chưa tiện lợi.',
            'Nhân viên MoonBay thân thiện, nhưng phản hồi yêu cầu hơi chậm.',
            'Khách sạn MoonBay tốt, nhưng nên có thêm tiện ích cho trẻ em.',
            'View biển ở MoonBay đẹp, nhưng phòng hơi nhỏ so với giá tiền.',
            // Tiêu cực
            'Khách sạn MoonBay cần cải thiện tốc độ phục vụ tại nhà hàng.',
            'Phòng ở MoonBay sạch, nhưng điều hòa hơi ồn khi ngủ.',
            'Dịch vụ MoonBay ổn, nhưng giá cả chưa hợp lý lắm.',
            'MoonBay cần nâng cấp cơ sở vật chất, đặc biệt là khu vực hồ bơi.',
            'Nhân viên MoonBay cần đào tạo thêm về kỹ năng giao tiếp.',
            'Wifi ở MoonBay quá chậm, không phù hợp cho công việc.',
            'Khách sạn MoonBay đẹp, nhưng thời gian chờ thang máy lâu.',
            'Đồ ăn sáng ở MoonBay chưa đa dạng, cần thêm món Việt Nam.',
            'Phòng ở MoonBay hơi cũ, cần bảo trì thường xuyên hơn.',
            'MoonBay có vị trí tốt, nhưng dịch vụ phòng hơi chậm.'
        ];

        // Danh sách phản hồi admin tiếng Việt từ khách sạn MoonBay
        $vietnameseAdminReplies = [
            'Cảm ơn bạn đã chọn MoonBay, chúng tôi rất vui được phục vụ bạn!',
            'MoonBay trân trọng đánh giá của bạn, hy vọng gặp lại bạn lần sau!',
            'Cảm ơn ý kiến của bạn, MoonBay sẽ cải thiện dịch vụ tốt hơn.',
            'Chúng tôi rất tiếc vì bất tiện, MoonBay sẽ liên hệ để hỗ trợ bạn.',
            'Cảm ơn bạn đã ủng hộ MoonBay, chúc bạn có kỳ nghỉ tuyệt vời!',
            'MoonBay luôn cố gắng mang đến trải nghiệm tốt nhất, cảm ơn bạn!',
            'Cảm ơn phản hồi của bạn, MoonBay sẽ nâng cấp dịch vụ ngay.',
            'Chúng tôi rất vui khi bạn hài lòng, MoonBay luôn chào đón bạn!',
            'MoonBay xin lỗi vì trải nghiệm chưa tốt, chúng tôi sẽ khắc phục.',
            'Cảm ơn bạn đã chia sẻ, MoonBay sẽ cải thiện tốc độ phục vụ.',
            'MoonBay trân trọng ý kiến của bạn, chúng tôi sẽ kiểm tra wifi ngay.',
            'Cảm ơn bạn đã yêu mến MoonBay, chúng tôi sẽ nâng cấp tiện ích.',
            'MoonBay rất tiếc vì sự bất tiện, đội ngũ sẽ cải thiện check-out.',
            'Cảm ơn bạn đã đánh giá, MoonBay sẽ bổ sung thêm món ăn sáng.',
            'MoonBay luôn lắng nghe khách hàng, cảm ơn bạn đã góp ý!',
            'Chúng tôi sẽ kiểm tra điều hòa, cảm ơn bạn đã báo cáo!',
            'MoonBay cam kết mang đến dịch vụ tốt hơn, cảm ơn bạn đã ủng hộ.',
            'Cảm ơn bạn đã chọn MoonBay, chúng tôi sẽ cải thiện cơ sở vật chất.',
            'MoonBay xin lỗi vì thời gian chờ, chúng tôi sẽ tối ưu thang máy.',
            'Cảm ơn bạn đã chia sẻ, MoonBay sẽ đào tạo nhân viên tốt hơn.'
        ];

        return [
            'user_id' => null, // Đặt user_id là null như yêu cầu
            'email' => $this->faker->randomElement($vietnameseUsernames) . '@gmail.com', // Email mang phong cách tiếng Việt
            'rating' => $this->faker->numberBetween(4, 5), // Đánh giá từ 1 đến 5
            'comment' => $this->faker->randomElement($vietnameseComments), // Bình luận tiếng Việt về MoonBay
            'admin_reply' => $this->faker->optional(0.6, null)->randomElement($vietnameseAdminReplies), // Phản hồi admin, 60% có phản hồi
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}