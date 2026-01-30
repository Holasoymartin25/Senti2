<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseService;
use Illuminate\Http\Request;

class AreaPersonalController extends Controller
{
    public function __construct(
        private SupabaseService $supabase
    ) {}

    public function storeTestResult(Request $request)
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;

        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $validated = $request->validate([
            'test_id' => 'required|string|max:64',
            'test_title' => 'required|string|max:255',
            'score' => 'required|integer|min:0',
            'display_score' => 'required|integer|min:0',
            'display_max' => 'required|integer|min:1',
            'level' => 'required|string|max:64',
        ]);

        $row = $this->supabase->insertTestResult($userId, $validated);

        if ($row === null) {
            return response()->json(['error' => 'Error al guardar el resultado'], 500);
        }

        return response()->json([
            'id' => $row['id'] ?? null,
            'date' => $row['created_at'] ?? now()->toIso8601String(),
        ], 201);
    }

    public function getTestResults(Request $request)
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;

        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $rows = $this->supabase->getTestResults($userId);

        $list = array_map(function ($r) {
            return [
                'testId' => $r['test_id'],
                'testTitle' => $r['test_title'],
                'score' => (int) $r['score'],
                'displayScore' => (int) $r['display_score'],
                'displayMax' => (int) $r['display_max'],
                'level' => $r['level'],
                'date' => $r['created_at'],
            ];
        }, $rows);

        return response()->json(['data' => $list]);
    }

    public function storeDiaryEntry(Request $request)
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;

        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'mood' => 'required|integer|min:1|max:10',
            'emotions' => 'nullable|array',
            'emotions.*' => 'string|max:64',
            'note' => 'nullable|string|max:5000',
        ]);

        $data = [
            'date' => \Carbon\Carbon::parse($validated['date'])->format('Y-m-d'),
            'mood' => $validated['mood'],
            'emotions' => $validated['emotions'] ?? [],
            'note' => $validated['note'] ?? '',
        ];

        $row = $this->supabase->insertDiaryEntry($userId, $data);

        if ($row === null) {
            return response()->json(['error' => 'Error al guardar la entrada'], 500);
        }

        return response()->json([
            'id' => $row['id'] ?? null,
            'createdAt' => $row['created_at'] ?? now()->toIso8601String(),
        ], 201);
    }

    public function getDiaryEntries(Request $request)
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;

        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $rows = $this->supabase->getDiaryEntries($userId);

        $list = array_map(function ($r) {
            return [
                'id' => $r['id'],
                'date' => $r['date'],
                'mood' => (int) $r['mood'],
                'emotions' => $r['emotions'] ?? [],
                'note' => $r['note'] ?? '',
                'createdAt' => $r['created_at'],
            ];
        }, $rows);

        return response()->json(['data' => $list]);
    }
}
