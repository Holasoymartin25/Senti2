<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'read',
    ];

    protected $casts = [
        'read' => 'boolean',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * PostgreSQL/Neon: la columna "read" es reservada; where('read', false) enlaza 0
     * y provoca "operator does not exist: boolean = integer".
     */
    public function scopeUnread($query)
    {
        $column = $query->getModel()->qualifyColumn('read');

        return $query->whereRaw("{$column} IS FALSE");
    }
}
