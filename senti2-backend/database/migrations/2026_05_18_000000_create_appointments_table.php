<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psicologo_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('paciente_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('fecha_hora');
            $table->unsignedSmallInteger('duracion')->default(60); // minutos
            $table->enum('modalidad', ['presencial', 'online'])->default('presencial');
            $table->enum('estado', ['pendiente', 'confirmada', 'cancelada', 'completada'])->default('pendiente');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
