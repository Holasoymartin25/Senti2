<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class MessageController extends Controller
{
    /**
     * Obtener mensajes entre el usuario autenticado y otro usuario
     */
    public function index(Request $request, $otherUserId)
    {
        $userId = $this->requireUser($request)->id;

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
        $user = $this->requireUser($request);

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content'     => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id'   => $user->id,
            'receiver_id' => (int) $validated['receiver_id'],
            'content'     => $validated['content'],
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
        $userId = $this->requireUser($request)->id;

        Message::where('sender_id', $senderId)
            ->where('receiver_id', $userId)
            ->unread()
            ->get()
            ->each(function (Message $message) {
                $message->read = true;
                $message->save();
            });

        return response()->json(['message' => 'Mensajes marcados como leídos']);
    }

    /**
     * Obtener el total de mensajes no leídos del usuario autenticado
     */
    public function getUnreadCount(Request $request)
    {
        $userId = $this->requireUser($request)->id;
        $count = Message::where('receiver_id', $userId)
            ->unread()
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    private function requireUser(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            abort(Response::HTTP_UNAUTHORIZED, 'No autenticado');
        }

        return $user;
    }
}
