<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientRequest extends Model
{
    protected $fillable = [
        'psicologo_id',
        'user_id',
        'message',
        'status',
    ];

    public function psicologo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psicologo_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
