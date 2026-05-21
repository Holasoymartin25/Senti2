<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {}

    public function broadcastOn(): array
    {
        $ids = collect([$this->message->sender_id, $this->message->receiver_id])->sort()->values();
        return [
            new PrivateChannel("chat.{$ids[0]}.{$ids[1]}"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'sender_id' => $this->message->sender_id,
            'receiver_id' => $this->message->receiver_id,
            'content' => $this->message->content,
            'read' => $this->message->read,
            'created_at' => $this->message->created_at,
            'sender' => $this->message->sender,
        ];
    }
}