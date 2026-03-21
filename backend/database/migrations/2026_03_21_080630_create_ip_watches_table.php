<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ip_watches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->string('monitored_term');
            $table->json('monitored_keywords')->nullable();
            $table->date('last_checked_date')->nullable();
            $table->integer('new_matches_count')->default(0);
            $table->json('alerts')->nullable(); // Store details of potential infringements found
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ip_watches');
    }
};
