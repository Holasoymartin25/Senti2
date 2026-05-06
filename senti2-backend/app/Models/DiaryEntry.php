<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiaryEntry extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'mood',
        'emotions',
        'note',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'mood' => 'integer',
        'emotions' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
