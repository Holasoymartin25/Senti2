<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de contacto - Senti2</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #1b1b18; font-size: 1.25rem; margin-bottom: 1rem; }
        .field { margin-bottom: 1rem; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 0.25rem; }
        .mensaje { white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 6px; }
        hr { border: none; border-top: 1px solid #eee; margin: 1.5rem 0; }
        .footer { font-size: 0.875rem; color: #666; }
    </style>
</head>
<body>
    <h1>Nueva consulta desde el formulario de contacto</h1>
    <p>Se ha recibido el siguiente mensaje en la web de Senti2:</p>

    <div class="field">
        <div class="label">Nombre:</div>
        <div class="value">{{ $nombre }}</div>
    </div>
    <div class="field">
        <div class="label">Apellidos:</div>
        <div class="value">{{ $apellidos }}</div>
    </div>
    <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:{{ $email }}">{{ $email }}</a></div>
    </div>
    <div class="field">
        <div class="label">Motivo / Mensaje:</div>
        <div class="value mensaje">{{ $mensaje }}</div>
    </div>

    @if($cvPath && file_exists($cvPath))
    <hr>
    <div class="field">
        <div class="label">CV adjunto:</div>
        <div class="value">El remitente ha adjuntado un archivo (ver adjuntos del correo).</div>
    </div>
    @endif

    <hr>
    <p class="footer">Puedes responder directamente a este correo para contactar con {{ $nombre }} {{ $apellidos }}.</p>
</body>
</html>
