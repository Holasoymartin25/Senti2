<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    /**
     * Obtener mensajes entre el usuario autenticado y otro usuario
     */
    public function index(Request $request, $otherUserId)
    {
        $userId = $request->user()->id;

        $messages = Message::where(function ($q) use ($userId, $otherUserId) {
                $q->where('sender_id', $userId)
                  ->where('receiver_id', $otherUserId);
            })
            ->orWhere(function ($q) use ($userId, $otherUserId) {
                $q->where('sender_id', $otherUserId)
                  ->where('receiver_id', $userId);
            })
            ->with('sender:id,name,email')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Enviar un mensaje y disparar el evento WebSocket
     */
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content'     => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $request->integer('receiver_id'),
            'content'     => $request->string('content')->toString(),
            'read'        => false,
        ]);

        $message->load('sender:id,name,email');

        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('Broadcast MessageSent failed', ['error' => $e->getMessage()]);
        }

        return response()->json($message, 201);
    }

    /**
     * Marcar como leídos los mensajes de un remitente hacia el usuario autenticado
     */
    public function markAsRead(Request $request, $senderId)
    {
        $userId = $request->user()->id;

        Message::where('sender_id', $senderId)
               ->where('receiver_id', $userId)
               ->unread()
               ->update(['read' => true]);

        return response()->json(['message' => 'Mensajes marcados como leídos']);
    }

    /**
     * Obtener el total de mensajes no leídos del usuario autenticado
     */
    public function getUnreadCount(Request $request)
    {
        $userId = $request->user()->id;
        $count = Message::where('receiver_id', $userId)
                        ->unread()
                        ->count();

        return response()->json(['unread_count' => $count]);
    }
}
