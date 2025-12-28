<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>MoonBay</title>
    <link rel="icon" type="image/png" href="{{ asset('images/logo/moonbaylogo.png') }}">
    @viteReactRefresh
    @vite('resources/js/App.jsx')
</head>

<body>
    <div id="app"></div>
</body>

</html>
