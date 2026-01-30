<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $nombre,
        public string $apellidos,
        public string $email,
        public string $mensaje,
        public ?string $cvPath = null,
        public ?string $cvOriginalName = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nueva consulta de contacto - Senti2',
            from: config('mail.from.address'),
            replyTo: [$this->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact',
        );
    }

    public function attachments(): array
    {
        if (!$this->cvPath || !is_file($this->cvPath)) {
            return [];
        }
        return [
            Attachment::fromPath($this->cvPath)
                ->as($this->cvOriginalName ?? 'cv_adjunto.pdf'),
        ];
    }
}
