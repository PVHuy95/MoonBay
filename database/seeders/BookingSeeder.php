<?php

namespace Database\Seeders;

use App\Models\BookingManager;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run()
    {

        BookingManager::factory()->count(90)->create();
        // 1 => 150,  // Tháng 1: Cao điểm (Tết âm lịch) - 150 bản ghi
        // 2 => 140,  // Tháng 2: Cao điểm (Tết âm lịch) - 140 bản ghi
        // 3 => 50,   // Tháng 3: Thấp điểm - 50 bản ghi
        // 4 => 110,  // Tháng 4: Trung bình (nghỉ lễ 30/4-1/5) - 110 bản ghi
        // 5 => 100,  // Tháng 5: Trung bình - 100 bản ghi
        // 6 => 130,  // Tháng 6: Cao điểm (mùa hè) - 130 bản ghi
        // 7 => 140,  // Tháng 7: Cao điểm (mùa hè) - 140 bản ghi
        // 8 => 120,  // Tháng 8: Cao điểm (mùa hè) - 120 bản ghi
        // 9 => 90,   // Tháng 9: Trung bình - 90 bản ghi
        // 10 => 100, // Tháng 10: Trung bình - 100 bản ghi
        // 11 => 60,  // Tháng 11: Thấp điểm - 60 bản ghi
        // 12 => 150, // Tháng 12: Cao điểm (Giáng sinh, năm mới) - 150 bản ghi
    }
}

//         $totalRecords = 10000;
//         $batchSize = 1000;

//         for ($i = 0; $i < $totalRecords / $batchSize; $i++) {
//             BookingManager::factory()->count($batchSize)->create();
//         }

//         $this->command->info("Seeded $totalRecords booking records successfully!");
//     }
// }