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

    /** PostgreSQL/Neon: no usar where('read', false) — Laravel enlaza 0 y falla boolean = integer. */
    public function scopeUnread($query)
    {
        return $query->whereRaw($query->getModel()->qualifyColumn('read') . ' = false');
    }
}