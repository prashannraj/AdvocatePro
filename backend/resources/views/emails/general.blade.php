<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .header { background-color: #4f46e5; padding: 30px; text-align: center; }
        .header img { max-height: 60px; }
        .content { padding: 40px; background-color: #ffffff; }
        .footer { padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        .regards { margin-top: 20px; font-weight: bold; color: #1e293b; }
        .office-details { margin-top: 5px; font-style: normal; line-height: 1.4; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            @if($logo)
                <img src="{{ $logo }}" alt="{{ $officeName }}">
            @else
                <h2 style="color: white; margin: 0;">Advocate Pro</h2>
            @endif
        </div>
        
        <div class="content">
            {!! $content !!}
            
            <div class="regards">
                Regards,<br>
                {{ $officeName }}
            </div>
            <div class="office-details">
                @if($address) {{ $address }}<br> @endif
                @if($mobile) Mobile: {{ $mobile }}<br> @endif
                @if($email) Email: {{ $email }} @endif
            </div>
        </div>
        
        <div class="footer">
            &copy; {{ date('Y') }} {{ $officeName }}. All rights reserved.<br>
            Powered by Advocate Pro Management System.
        </div>
    </div>
</body>
</html>
