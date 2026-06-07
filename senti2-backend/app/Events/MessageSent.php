<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn(): array
    {
        $ids = collect([$this->message->sender_id, $this->message->receiver_id])->sort()->values();

        return [
            new PrivateChannel("chat.{$ids[0]}.{$ids[1]}"),
            new PrivateChannel("App.Models.User.{$this->message->receiver_id}"),
        ];
    }

    public function broadcastWith(): array
    {
        $sender = $this->message->relationLoaded('sender') ? $this->message->sender : null;

        return [
            'id' => $this->message->id,
            'sender_id' => $this->message->sender_id,
            'receiver_id' => $this->message->receiver_id,
            'content' => $this->message->content,
            'read' => (bool) $this->message->read,
            'created_at' => $this->message->created_at?->toIso8601String(),
            'sender' => $sender ? [
                'id' => $sender->id,
                'name' => $sender->name,
                'email' => $sender->email,
            ] : null,
        ];
    }
}
