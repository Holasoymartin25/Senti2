<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psicologo_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            // Solo puede haber una solicitud pendiente por par psicólogo-usuario
            $table->unique(['psicologo_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_requests');
    }
};
