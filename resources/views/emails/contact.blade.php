<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        h2 {
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .info-item {
            margin-bottom: 15px;
        }
        .message-content {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h2>New Contact Form Submission</h2>
    
    <div class="info-item">
        <strong>Name:</strong> {{ $name }}
    </div>
    
    <div class="info-item">
        <strong>Email:</strong> {{ $email }}
    </div>
    
    <div class="info-item">
        <strong>Subject:</strong> {{ $subject }}
    </div>
    
    <div class="message-content">
        <h3>Message:</h3>
        <p>{{ $message }}</p>
    </div>
    
    <hr>
    <p>This email was sent from the contact form on Moon Bay Hotel website.</p>
</body>
</html> 