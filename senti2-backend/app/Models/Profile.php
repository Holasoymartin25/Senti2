<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    public const ROLE_USER = 'user';
    public const ROLE_PSICOLOGO = 'psicologo';
    public const ROLE_ADMIN = 'admin';

    protected $fillable = [
        'user_id',
        'nombre',
        'apellidos',
        'telefono',
        'fecha_nacimiento',
        'role',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];
}
