<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva consulta de contacto</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #4a6741; font-size: 1.25rem; }
        .field { margin-bottom: 1rem; }
        .label { font-weight: 600; color: #555; }
        .value { margin-top: 4px; padding: 8px; background: #f5f5f5; border-radius: 6px; }
        .mensaje { white-space: pre-wrap; }
        hr { border: none; border-top: 1px solid #ddd; margin: 1.5rem 0; }
        small { color: #888; font-size: 0.85rem; }
    </style>
</head>
<body>
    <h1>Nueva consulta desde el formulario de contacto - Senti2</h1>
    <p>Se ha recibido una nueva consulta. Datos del remitente:</p>

    <div class="field">
        <div class="label">Nombre</div>
        <div class="value">{{ $nombre }}</div>
    </div>
    <div class="field">
        <div class="label">Apellidos</div>
        <div class="value">{{ $apellidos }}</div>
    </div>
    <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:{{ $email }}">{{ $email }}</a></div>
    </div>
    <div class="field">
        <div class="label">Motivo / Mensaje</div>
        <div class="value mensaje">{{ $mensaje }}</div>
    </div>
    @if($cvOriginalName)
    <div class="field">
        <div class="label">CV adjunto</div>
        <div class="value">{{ $cvOriginalName }}</div>
    </div>
    @endif

    <hr>
    <small>Este correo se ha enviado automáticamente desde el formulario de contacto de Senti2. Puedes responder directamente a {{ $email }}.</small>
</body>
</html>
