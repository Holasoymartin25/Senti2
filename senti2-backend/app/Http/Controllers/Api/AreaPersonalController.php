<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiaryEntry;
use App\Models\TestResult;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AreaPersonalController extends Controller
{
    public function storeTestResult(Request $request)
    {
        $validated = $request->validate([
            'test_id'       => 'required|string|max:64',
            'test_title'    => 'required|string|max:255',
            'score'         => 'required|integer|min:0',
            'display_score' => 'required|integer|min:0',
            'display_max'   => 'required|integer|min:1',
            'level'         => 'required|string|max:64',
        ]);

        $result = TestResult::create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return response()->json([
            'id'   => $result->id,
            'date' => $result->created_at->toIso8601String(),
        ], 201);
    }

    public function getTestResults(Request $request)
    {
        $results = TestResult::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($r) => [
                'testId'       => $r->test_id,
                'testTitle'    => $r->test_title,
                'score'        => $r->score,
                'displayScore' => $r->display_score,
                'displayMax'   => $r->display_max,
                'level'        => $r->level,
                'date'         => $r->created_at->toIso8601String(),
            ]);

        return response()->json(['data' => $results]);
    }

    public function storeDiaryEntry(Request $request)
    {
        $validated = $request->validate([
            'date'       => 'required|date',
            'mood'       => 'required|integer|min:1|max:10',
            'emotions'   => 'nullable|array',
            'emotions.*' => 'string|max:64',
            'note'       => 'nullable|string|max:5000',
        ]);

        $entry = DiaryEntry::create([
            'user_id'  => $request->user()->id,
            'date'     => Carbon::parse($validated['date'])->format('Y-m-d'),
            'mood'     => $validated['mood'],
            'emotions' => $validated['emotions'] ?? [],
            'note'     => $validated['note'] ?? '',
        ]);

        return response()->json([
            'id'        => $entry->id,
            'createdAt' => $entry->created_at->toIso8601String(),
        ], 201);
    }

    public function getDiaryEntries(Request $request)
    {
        $entries = DiaryEntry::where('user_id', $request->user()->id)
            ->orderByDesc('date')
            ->get()
            ->map(fn($e) => [
                'id'        => $e->id,
                'date'      => $e->date->format('Y-m-d'),
                'mood'      => $e->mood,
                'emotions'  => $e->emotions ?? [],
                'note'      => $e->note ?? '',
                'createdAt' => $e->created_at->toIso8601String(),
            ]);

        return response()->json(['data' => $entries]);
    }
}
