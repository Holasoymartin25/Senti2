<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'psicologo_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function testResults()
    {
        return $this->hasMany(TestResult::class);
    }

    public function diaryEntries()
    {
        return $this->hasMany(DiaryEntry::class);
    }

    public function psicologo()
    {
        return $this->belongsTo(User::class, 'psicologo_id');
    }

    public function pacientes()
    {
        return $this->hasMany(User::class, 'psicologo_id');
    }
}
