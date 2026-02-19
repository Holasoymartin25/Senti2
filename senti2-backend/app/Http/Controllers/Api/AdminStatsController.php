<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Services\SupabaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStatsController extends Controller
{
    public function __construct(
        private SupabaseService $supabase
    ) {}

    public function index(Request $request): JsonResponse
    {
        $testResults = $this->supabase->getAllTestResults();
        $diaryEntries = $this->supabase->getAllDiaryEntries();

        $userIds = array_unique(array_merge(
            array_column($testResults, 'user_id'),
            array_column($diaryEntries, 'user_id')
        ));

        $totalUsersWithData = count($userIds);
        $totalTestResults = count($testResults);
        $totalDiaryEntries = count($diaryEntries);

        $moodSum = 0;
        $moodCount = 0;
        foreach ($diaryEntries as $e) {
            $moodSum += (int) ($e['mood'] ?? 0);
            $moodCount++;
        }
        $avgMood = $moodCount > 0 ? round($moodSum / $moodCount, 1) : null;

        $testsByTitle = [];
        foreach ($testResults as $r) {
            $title = $r['test_title'] ?? 'Sin título';
            $testsByTitle[$title] = ($testsByTitle[$title] ?? 0) + 1;
        }

        $moodByDay = [];
        foreach ($diaryEntries as $e) {
            $date = $e['date'] ?? '';
            if ($date) {
                if (!isset($moodByDay[$date])) {
                    $moodByDay[$date] = ['sum' => 0, 'count' => 0];
                }
                $moodByDay[$date]['sum'] += (int) ($e['mood'] ?? 0);
                $moodByDay[$date]['count']++;
            }
        }
        $moodSeries = [];
        foreach ($moodByDay as $date => $data) {
            $moodSeries[] = [
                'date' => $date,
                'avg' => round($data['sum'] / $data['count'], 1),
                'count' => $data['count'],
            ];
        }
        usort($moodSeries, fn ($a, $b) => strcmp($a['date'], $b['date']));

        $roleCounts = Profile::selectRaw('role, count(*) as total')->groupBy('role')->pluck('total', 'role')->toArray();

        return response()->json([
            'summary' => [
                'totalUsersWithData' => $totalUsersWithData,
                'totalTestResults' => $totalTestResults,
                'totalDiaryEntries' => $totalDiaryEntries,
                'averageMood' => $avgMood,
            ],
            'testsByTitle' => $testsByTitle,
            'moodSeries' => array_slice($moodSeries, -30),
            'roleCounts' => $roleCounts,
        ]);
    }
}
