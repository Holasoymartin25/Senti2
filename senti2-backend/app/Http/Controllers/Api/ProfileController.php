<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user    = $request->user();
        $profile = Profile::firstOrCreate(
            ['user_id' => $user->id],
            ['nombre' => null, 'apellidos' => null, 'telefono' => null, 'fecha_nacimiento' => null]
        );

        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nombre'           => 'nullable|string|max:255',
            'apellidos'        => 'nullable|string|max:255',
            'telefono'         => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
        ]);

        $profile = Profile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($profile);
    }
}
