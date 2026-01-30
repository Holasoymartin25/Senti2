<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $nombre,
        public string $apellidos,
        public string $email,
        public string $mensaje,
        public ?string $cvPath = null
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
            view: 'emails.contact-form',
        );
    }

    public function attachments(): array
    {
        $attachments = [];
        if ($this->cvPath && file_exists($this->cvPath)) {
            $attachments[] = Attachment::fromPath($this->cvPath)
                ->as('CV-' . basename($this->cvPath));
        }
        return $attachments;
    }
}
