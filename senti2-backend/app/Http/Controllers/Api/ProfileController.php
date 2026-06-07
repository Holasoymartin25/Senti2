<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $profile = Profile::firstOrCreate(
            ['user_id' => $user->id],
            ['nombre' => null, 'apellidos' => null, 'telefono' => null, 'fecha_nacimiento' => null]
        );

        return response()->json($this->formatProfile($profile));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
        ]);

        $profile = Profile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($this->formatProfile($profile));
    }

    /** Foto de perfil en disco público (profile_photos). */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $user = $request->user();
        $profile = Profile::firstOrCreate(['user_id' => $user->id]);

        if ($profile->avatar_path) {
            Storage::disk('profile_photos')->delete($profile->avatar_path);
        }

        $path = $request->file('avatar')->store((string) $user->id, 'profile_photos');
        $profile->update(['avatar_path' => $path]);

        return response()->json([
            'message' => __('messages.avatar_uploaded'),
            'profile' => $this->formatProfile($profile->fresh()),
        ]);
    }

    /** Documento privado en disco private_documents. */
    public function uploadPrivateDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $user = $request->user();
        $profile = Profile::firstOrCreate(['user_id' => $user->id]);

        if ($profile->private_document_path) {
            Storage::disk('private_documents')->delete($profile->private_document_path);
        }

        $path = $request->file('document')->store((string) $user->id, 'private_documents');
        $profile->update(['private_document_path' => $path]);

        return response()->json([
            'message' => __('messages.document_uploaded'),
            'has_private_document' => true,
        ]);
    }

    public function downloadPrivateDocument(Request $request): StreamedResponse
    {
        $profile = Profile::where('user_id', $request->user()->id)->first();

        if (! $profile?->private_document_path || ! Storage::disk('private_documents')->exists($profile->private_document_path)) {
            abort(404, __('messages.document_not_found'));
        }

        return Storage::disk('private_documents')->download($profile->private_document_path);
    }

    private function formatProfile(Profile $profile): array
    {
        return [
            'id' => $profile->id,
            'user_id' => $profile->user_id,
            'nombre' => $profile->nombre,
            'apellidos' => $profile->apellidos,
            'telefono' => $profile->telefono,
            'fecha_nacimiento' => $profile->fecha_nacimiento?->format('Y-m-d'),
            'avatar_url' => $profile->avatar_path
                ? Storage::disk('profile_photos')->url($profile->avatar_path)
                : null,
            'has_private_document' => (bool) $profile->private_document_path,
        ];
    }
}
