<!DOCTYPE html>
<html>
<head>
    <title>Booking Confirmation - Moon Bay Hotel</title>
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
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .table crc {
            padding: 8px;
            border: 1px solid #ddd;
        }
        .table td:first-child {
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
    <div class="container">
        <h1>Booking Confirmation</h1>
        <p>Dear {{ $data['user_name'] }},</p>
        <p>Thank you for booking with Moon Bay Hotel. Below are the details of your reservation:</p>
        <table class="table">
            <tr>
                <td><b>Room Type</b></td>
                <td>{{ $data['room_type'] }}</td>
            </tr>
            <tr>
                <td><b>Number of Rooms</b></td>
                <td>{{ $data['number_of_rooms'] }}</td>
            </tr>
            <tr>
                <td><b>Check-in</b></td>
                <td>{{ $data['checkin_date'] }}</td>
            </tr>
            <tr>
                <td><b>Check-out</b></td>
                <td>{{ $data['checkout_date'] }}</td>
            </tr>
            <tr>
                <td><b>Number of Adults</b></td>
                <td>{{ $data['member'] }}</td>
            </tr>
            <tr>
                <td><b>Number of Children</b></td>
                <td>{{ $data['children'] }}</td>
            </tr>
            <tr>
                <td><b>Total Price</b></td>
                <td>{{ number_format($data['total_price'], 0, '.', ',') }} VND</td>
            </tr>
            <tr>
                <td><b>Amount Paid</b></td>
                <td>{{ number_format($data['deposit_paid'], 0, '.', ',') }} VND</td>
            </tr>
            <tr>
                <td><b>Remaining Balance</b></td>
                <td>{{ number_format($data['remaining_amount'], 0, '.', ',') }} VND</td>
            </tr>
            <tr>
                <td><b>Payment Status</b></td>
                <td>{{ $data['payment_status'] }}</td>
            </tr>
        </table>
        <hr>
        <p>We look forward to welcoming you!</p>
        <p>Best regards,<br>Moon Bay Hotel</p>
    </div>
</body>
</html>