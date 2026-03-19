<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Setting;

class GeneralNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $content;
    public $subject;
    public $officeName;
    public $address;
    public $mobile;
    public $email;
    public $logo;

    /**
     * Create a new message instance.
     */
    public function __construct($content, $subject = 'Notification')
    {
        $this->content = $content;
        $this->subject = $subject;

        $settings = Setting::all()->pluck('value', 'key');
        
        $this->officeName = $settings->get('office_name', 'Advocate Pro');
        $this->address = $settings->get('address');
        $this->mobile = $settings->get('mobile');
        $this->email = $settings->get('email');
        
        // If logo is a URL, use it. If it's a relative path, make it full URL.
        $logoPath = $settings->get('logo');
        if ($logoPath) {
            $this->logo = str_starts_with($logoPath, 'http') ? $logoPath : asset($logoPath);
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.general',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
