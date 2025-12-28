<!DOCTYPE html>
<html>
<head>
    <title>Special Offers - May 12, 2025</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
        }
        .offer-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .offer {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .offer h3 {
            color: #2980b9;
            margin-top: 0;
        }
        .offer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .offer-table td {
            padding: 8px;
            border: 1px solid #ddd;
        }
        .offer-table td:first-child {
            font-weight: bold;
            background-color: #ecf0f1;
        }
        hr {
            border: 0;
            height: 1px;
            background: #ddd;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="offer-container">
        <h1>Special Offers - May 12, 2025</h1>
        @forelse ($offers as $offer)
            <div class="offer">
                <h3>{{ $offer->season ?? 'Unknown Season' }} Offer</h3>
                <table class="offer-table">
                    <tr>
                        <td>Free Services</td>
                        <td>{{ $offer->free_services ?? 'Not specified' }}</td>
                    </tr>
                    <tr>
                        <td>Duration</td>
                        <td>{{ $offer->season_start ?? 'N/A' }} to {{ $offer->season_end ?? 'N/A' }}</td>
                    </tr>
                    
                    <tr>
                        <td>Total Bill Threshold</td>
                        <td>{{ isset($offer->total_bill_threshold) && !is_null($offer->total_bill_threshold) ? number_format($offer->total_bill_threshold, 2) : '0.00' }}VND</td>
                    </tr>
                    <tr>
                        <td>Discount</td>
                        <td>{{ $offer->discount_percent ?? '0' }}% ({{ $offer->discount_start ?? 'N/A' }} to {{ $offer->discount_end ?? 'N/A' }})</td>
                    </tr>
                    <tr>
                        <td>Stay Duration</td>
                        <td>{{ $offer->stay_duration_days ?? '0' }} days</td>
                    </tr>
                    <tr>
                        <td>Gift</td>
                        <td>
                            {{ $offer->gift_description ?? 'No gift' }}
                            @if(!empty($offer->gift_image_url))
                                (<a href="{{ $offer->gift_image_url }}">Image</a>)
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td>Gift Period</td>
                        <td>{{ $offer->gift_start ?? 'N/A' }} to {{ $offer->gift_end ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td>Other Package</td>
                        <td>{{ $offer->other_package_description ?? 'Not specified' }}</td>
                    </tr>
                    <tr>
                        <td>Other Type</td>
                        <td>{{ $offer->offer_type ?? 'Not specified' }}</td>
                    </tr>
                    <tr>
                        <td>Other Offer Period</td>
                        <td>{{ $offer->other_offer_start ?? 'N/A' }} to {{ $offer->other_offer_end ?? 'N/A' }}</td>
                    </tr>
                </table>
            </div>
            <hr>
        @empty
            <p style="text-align: center;">No offers available at this time.</p>
        @endforelse
    </div>
</body>
</html>