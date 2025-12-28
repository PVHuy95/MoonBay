<?php

return [
    'amenities' => [
        ['name' => 'Air Conditioning', 'icon' => '❄️'],
        ['name' => 'Elevator', 'icon' => '🛗'],
        ['name' => 'Fine Dining Restaurant', 'icon' => '🍴'],
        ['name' => 'Free Wifi', 'icon' => '📶'],
        ['name' => 'Infinity Pool', 'icon' => '🏊'],
        ['name' => 'Modern Gym', 'icon' => '🏋️'],
        ['name' => 'Parking Car', 'icon' => '🅿'],
        ['name' => 'Smart TV', 'icon' => '📺'],
        ['name' => 'Tea & Cafe', 'icon' => '☕'],
    ],

    'room_amenities' => [
        'Standard' => [
            ['name' => 'Air Conditioning', 'icon' => '❄️'],
            ['name' => 'Free Wifi', 'icon' => '📶'],
            ['name' => 'Smart TV', 'icon' => '📺'],
        ],
        'Superior' => [
            ['name' => 'Air Conditioning', 'icon' => '❄️'],
            ['name' => 'Free Wifi', 'icon' => '📶'],
            ['name' => 'Smart TV', 'icon' => '📺'],
            ['name' => 'Tea & Cafe', 'icon' => '☕'],
        ],
        'Deluxe' => [
            ['name' => 'Air Conditioning', 'icon' => '❄️'],
            ['name' => 'Free Wifi', 'icon' => '📶'],
            ['name' => 'Smart TV', 'icon' => '📺'],
            ['name' => 'Tea & Cafe', 'icon' => '☕'],
        ],
        'Suite' => [
            ['name' => 'Air Conditioning', 'icon' => '❄️'],
            ['name' => 'Free Wifi', 'icon' => '📶'],
            ['name' => 'Smart TV', 'icon' => '📺'],
            ['name' => 'Tea & Cafe', 'icon' => '☕'],
            ['name' => 'Infinity Pool', 'icon' => '🏊'],
        ],
        'Family' => [
            ['name' => 'Air Conditioning', 'icon' => '❄️'],
            ['name' => 'Free Wifi', 'icon' => '📶'],
            ['name' => 'Smart TV', 'icon' => '📺'],
            ['name' => 'Tea & Cafe', 'icon' => '☕'],
        ],
    ],

    'room_details' => [
        'Standard' => [
            'description' => 'Phòng tiêu chuẩn với thiết kế tối giản, phù hợp cho khách du lịch cá nhân hoặc cặp đôi.',
            'suitable_for' => '1-2 người, du lịch ngắn ngày',
            'size' => '20 m²',
        ],
        'Superior' => [
            'description' => 'Phòng rộng rãi với nội thất hiện đại, lý tưởng cho khách muốn thoải mái hơn.',
            'suitable_for' => '2 người, nghỉ dưỡng',
            'size' => '25 m²',
        ],
        'Deluxe' => [
            'description' => 'Là phiên bản nâng cấp của phòng Superior, phòng Deluxe cung cấp không gian rộng rãi hơn, nội thất tinh tế hơn và tiện nghi vượt trội hơn.',
            'suitable_for' => '2-4 người, kỳ nghỉ dài ngày',
            'size' => '30 m²',
        ],
        'Suite' => [
            'description' => 'Phòng thượng hạng với không gian rộng, hồ bơi riêng và dịch vụ cao cấp.',
            'suitable_for' => 'Cặp đôi hoặc khách VIP',
            'size' => '50 m²',
        ],
        'Family' => [
            'description' => 'Phòng gia đình với không gian lớn, phù hợp cho nhóm hoặc gia đình.',
            'suitable_for' => '2-4 người, kỳ nghỉ gia đình',
            'size' => '40 m²',
        ],
    ],

    'policies' => [
        'pet_policy' => 'Khách sạn không cho phép mang thú cưng.',
        'airport_shuttle' => 'Khách sạn có dịch vụ đưa đón sân bay với phụ phí 400.000 VNĐ/chuyến.',
        'smoking_policy' => 'Khách sạn cấm hút thuốc trong tất cả các khu vực.',
        'child_policy' => 'Trẻ em từ 11 tuổi trở xuống được miễn phí khi ở cùng bố mẹ.',
        'privacy_policy' => 'Khách sạn cam kết bảo mật thông tin cá nhân của khách hàng. Mọi thông tin cá nhân được thu thập chỉ phục vụ cho mục đích đặt phòng và không được tiết lộ cho bên thứ ba, trừ khi có yêu cầu từ cơ quan pháp luật.',
    ],

    'nearby_attractions' => [
        [
            'name' => 'Bãi biển Bãi Cây Mến',
            'distance' => '500 m',
            'description' => 'Bãi biển nổi tiếng với cát trắng và nước trong xanh.',
        ],
        [
            'name' => 'Ngọn hải đăng Nam Du',
            'distance' => '2 km',
            'description' => ' Nằm trên đỉnh núi Hòn Ngang, đảo Nam Du, tỉnh Kiên Giang, là ngọn hải đăng cao 113 mét, kiến trúc phương Tây độc đáo, điểm đến lý tưởng để ngắm cảnh đảo, biển và trời.',
        ],
        [
            'name' => 'Đảo Hòn Mấu',
            'distance' => '3 km',
            'description' => 'Đảo nhỏ xinh đẹp với bãi biển hoang sơ, nước xanh trong vắt, là điểm đến lý tưởng cho những ai muốn khám phá và tận hưởng không gian biển đảo tuyệt vời.',
        ],
    ],
];
?>