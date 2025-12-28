<?php

namespace App\Http\Controllers;

use App\Models\BookingManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChartController extends Controller
{
    // Theo tháng
    public function bookingsRatioMonthly($year)
    {
        // Tổng số ngày phòng đã đặt theo tháng
        $bookings = BookingManager::select(
            DB::raw('MONTH(checkin_date) as month'),
            DB::raw('SUM(DATEDIFF(checkout_date, checkin_date)) as room_days')
        )
            ->whereYear('checkin_date', $year)
            ->where('check_status', 'checked out')
            ->groupBy(DB::raw('MONTH(checkin_date)'))
            ->orderBy('month')
            ->get();

        // Tạo mảng dữ liệu cho 12 tháng
        $data = [];
        for ($month = 1; $month <= 12; $month++) {
            $booking = $bookings->firstWhere('month', $month) ?? ['room_days' => 0];
            $daysInMonth = Carbon::create($year, $month)->daysInMonth;
            $maxCapacity = $daysInMonth * 60; // 60 phòng mỗi tháng
            $ratio = $maxCapacity > 0 ? min(($booking['room_days'] / $maxCapacity) * 100, 100) : 0;
            $data[] = [
                'month' => $month,
                'ratio' => round($ratio, 2),
            ];
        }

        return response()->json($data);
    }

    // Theo quý
    public function bookingsRatioQuarterly($year)
    {
        $quarters = [
            1 => [1, 2, 3],
            2 => [4, 5, 6],
            3 => [7, 8, 9],
            4 => [10, 11, 12],
        ];

        // Tổng số ngày phòng đã đặt theo quý
        $bookings = BookingManager::select(
            DB::raw('QUARTER(checkin_date) as quarter'),
            DB::raw('SUM(DATEDIFF(checkout_date, checkin_date)) as room_days')
        )
            ->whereYear('checkin_date', $year)
            ->where('check_status', 'checked out')
            ->groupBy(DB::raw('QUARTER(checkin_date)'))
            ->orderBy('quarter')
            ->get();

        // Tạo mảng dữ liệu cho 4 quý
        $data = [];
        foreach ($quarters as $quarter => $months) {
            $booking = $bookings->firstWhere('quarter', $quarter) ?? ['room_days' => 0];
            $daysInQuarter = array_sum(array_map(fn($month) => Carbon::create($year, $month)->daysInMonth, $months));
            $maxCapacity = $daysInQuarter * 60; // 60 phòng mỗi quý
            $ratio = $maxCapacity > 0 ? min(($booking['room_days'] / $maxCapacity) * 100, 100) : 0;
            $data[] = [
                'quarter' => $quarter,
                'ratio' => round($ratio, 2),
            ];
        }

        return response()->json($data);
    }

    // Giữ nguyên API revenue
    public function revenue($year)
    {
        $revenue = BookingManager::select(
            DB::raw('MONTH(checkin_date) as month'),
            DB::raw('COALESCE(SUM(total_price), 0) as total_revenue')
        )
            ->whereYear('checkin_date', $year)
            ->where('check_status', 'checked out')
            ->groupBy(DB::raw('MONTH(checkin_date)'))
            ->orderBy('month')
            ->get();

        $data = [];
        for ($month = 1; $month <= 12; $month++) {
            $rev = $revenue->firstWhere('month', $month) ?? ['total_revenue' => 0];
            $data[] = [
                'month' => $month,
                'total_revenue' => round($rev['total_revenue'], 2),
            ];
        }

        return response()->json($data);
    }
}