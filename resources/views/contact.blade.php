<!DOCTYPE html>
<html>
<head>
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .content {
            padding: 15px;
        }
        .field {
            margin-bottom: 15px;
        }
        .label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div>{{ $data['name'] }}</div>
            </div>
            
            <div class="field">
                <div class="label">Email:</div>
                <div>{{ $data['email'] }}</div>
            </div>
            
            <div class="field">
                <div class="label">Subject:</div>
                <div>{{ $data['subject'] }}</div>
            </div>
            
            <div class="field">
                <div class="label">Message:</div>
                <div>{{ $data['message'] }}</div>
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent from the contact form on Moon Bay Resort website.</p>
        </div>
    </div>
</body>
</html>