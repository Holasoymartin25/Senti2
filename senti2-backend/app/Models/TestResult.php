<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestResult extends Model
{
    protected $fillable = [
        'user_id',
        'test_id',
        'test_title',
        'score',
        'display_score',
        'display_max',
        'level',
    ];

    protected $casts = [
        'score' => 'integer',
        'display_score' => 'integer',
        'display_max' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
