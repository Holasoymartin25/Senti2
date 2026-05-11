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
            ['name' => 'Admin Principal', 'email' => 'admin@senti2.com'],
            ['name' => 'Admin Secundario', 'email' => 'admin2@senti2.com'],
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
            ['name' => 'Dra. Laura Gómez',    'email' => 'laura.gomez@senti2.com'],
            ['name' => 'Dr. Carlos Ruiz',     'email' => 'carlos.ruiz@senti2.com'],
            ['name' => 'Dra. Marta Pérez',    'email' => 'marta.perez@senti2.com'],
            ['name' => 'Dr. Javier Morales',  'email' => 'javier.morales@senti2.com'],
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
            ['name' => 'Ana Martínez',   'email' => 'ana.martinez@mail.com'],
            ['name' => 'Luis Fernández', 'email' => 'luis.fernandez@mail.com'],
            ['name' => 'Sofía Torres',   'email' => 'sofia.torres@mail.com'],
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
            ['name' => 'Pablo Díaz',     'email' => 'pablo.diaz@mail.com'],
            ['name' => 'Elena Sánchez',  'email' => 'elena.sanchez@mail.com'],
            ['name' => 'David López',    'email' => 'david.lopez@mail.com'],
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
            ['name' => 'Carmen Vega',    'email' => 'carmen.vega@mail.com'],
            ['name' => 'Marcos Gil',     'email' => 'marcos.gil@mail.com'],
            ['name' => 'Irene Castro',   'email' => 'irene.castro@mail.com'],
            ['name' => 'Tomás Herrera',  'email' => 'tomas.herrera@mail.com'],
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
