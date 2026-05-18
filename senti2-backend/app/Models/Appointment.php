<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'psicologo_id',
        'paciente_id',
        'fecha_hora',
        'duracion',
        'modalidad',
        'estado',
        'notas',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
    ];

    public function psicologo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psicologo_id');
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paciente_id');
    }
}
