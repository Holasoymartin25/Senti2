<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SentiSeeder extends Seeder
{
    public function run(): void
    {
        // ── ADMINS ────────────────────────────────────────────
        $admins = [
            ['name' => 'Admin 1', 'email' => 'admin1@admin.com'],
            ['name' => 'Admin 2', 'email' => 'admin2@admin.com'],
        ];

        foreach ($admins as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => Hash::make('password'),
                    'role'     => 'admin',
                ]
            );
            Profile::firstOrCreate(['user_id' => $user->id]);
        }

        // ── PSICÓLOGOS ────────────────────────────────────────
        $psicologos = [];
        $psicologoData = [
            ['name' => 'Dra. Laura Gomez',   'email' => 'psicologo1@admin.com'],
            ['name' => 'Dr. Carlos Ruiz',    'email' => 'psicologo2@admin.com'],
            ['name' => 'Dra. Marta Perez',   'email' => 'psicologo3@admin.com'],
            ['name' => 'Dr. Javier Morales', 'email' => 'psicologo4@admin.com'],
        ];

        foreach ($psicologoData as $data) {
            $psi = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => Hash::make('password'),
                    'role'     => 'psicologo',
                ]
            );
            Profile::firstOrCreate(['user_id' => $psi->id]);
            $psicologos[] = $psi;
        }

        // ── USUARIOS ──────────────────────────────────────────
        // 3 asignados al psicólogo 1
        $usuarios1 = [
            ['name' => 'David Hormigo',  'email' => 'usuario1@admin.com'],
            ['name' => 'J Mayorga',      'email' => 'usuario2@admin.com'],
            ['name' => 'Antonio Sanchez','email' => 'usuario3@admin.com'],
        ];

        foreach ($usuarios1 as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'          => $data['name'],
                    'password'      => Hash::make('password'),
                    'role'          => 'user',
                    'psicologo_id'  => $psicologos[0]->id,
                ]
            );
            Profile::firstOrCreate(['user_id' => $user->id]);
        }

        // 3 asignados al psicólogo 2
        $usuarios2 = [
            ['name' => 'Eva Perales',    'email' => 'usuario4@admin.com'],
            ['name' => 'Pablo Diaz',     'email' => 'usuario5@admin.com'],
            ['name' => 'Elena Sanchez',  'email' => 'usuario6@admin.com'],
        ];

        foreach ($usuarios2 as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'          => $data['name'],
                    'password'      => Hash::make('password'),
                    'role'          => 'user',
                    'psicologo_id'  => $psicologos[1]->id,
                ]
            );
            Profile::firstOrCreate(['user_id' => $user->id]);
        }

        // 4 sin asignar
        $sinAsignar = [
            ['name' => 'David Lopez',    'email' => 'usuario7@admin.com'],
            ['name' => 'Carmen Vega',    'email' => 'usuario8@admin.com'],
            ['name' => 'Marcos Gil',     'email' => 'usuario9@admin.com'],
            ['name' => 'Irene Castro',   'email' => 'usuario10@admin.com'],
        ];

        foreach ($sinAsignar as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => Hash::make('password'),
                    'role'     => 'user',
                ]
            );
            Profile::firstOrCreate(['user_id' => $user->id]);
        }

        $this->command->info('✓ 2 admins, 4 psicólogos, 10 usuarios (3+3 asignados, 4 sin asignar)');
    }
}
