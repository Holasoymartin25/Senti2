<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Obtener mensajes entre el usuario autenticado y otro usuario
     */
    public function index(Request $request, $otherUserId)
    {
        $userId = Auth::id();

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
            'sender_id'   => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content'     => $request->content,
            'read'        => false,
        ]);

        $message->load('sender:id,name,email');

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }

    /**
     * Marcar como leídos los mensajes de un remitente hacia el usuario autenticado
     */
    public function markAsRead($senderId)
    {
        $userId = Auth::id();

        Message::where('sender_id', $senderId)
               ->where('receiver_id', $userId)
               ->where('read', false)
               ->update(['read' => true]);

        return response()->json(['message' => 'Mensajes marcados como leídos']);
    }
}