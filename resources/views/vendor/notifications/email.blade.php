<x-mail::message>
{{-- Greeting --}}
@if (! empty($greeting))
# {{ $greeting }}
@else
@if ($level === 'error')
# 😟 @lang('Oops...')
@else
# 👋 @lang('Hello there!')
@endif
@endif

{{-- Intro Lines --}}
@foreach ($introLines as $line)
<p style="font-size: 16px; line-height: 1.6; color: #333;">
    {{ $line }}
</p>
@endforeach

{{-- Action Button --}}
@isset($actionText)
<p style="text-align: center; margin: 30px 0;">
    <a href="{{ $actionUrl }}"
       style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
        {{ $actionText }}
    </a>
</p>
@endisset

{{-- Outro Lines --}}
@foreach ($outroLines as $line)
<p style="font-size: 16px; line-height: 1.6; color: #333;">
    {{ $line }}
</p>
@endforeach

{{-- Salutation --}}
@if (! empty($salutation))
{{ $salutation }}
@else
<p style="margin-top: 30px; font-size: 16px;">@lang('Best regards,')<br><strong>@lang('Moon Bay Hotel')</strong></p>
@endif

{{-- Subcopy --}}
@isset($actionText)
<x-slot:subcopy>
<p style="font-size: 14px; color: #666;">
@lang(
    "If you're having trouble clicking the \":actionText\" button, copy and paste the URL below\ninto your web browser:",
    ['actionText' => $actionText]
)<br>
<a href="{{ $actionUrl }}" style="color: #1d4ed8;">{{ $actionUrl }}</a>
</p>
</x-slot:subcopy>
@endisset
</x-mail::message>
