<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('infringement_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ip_asset_id')->constrained('ip_assets')->onDelete('cascade');
            $table->foreignId('case_id')->nullable()->constrained('case_records')->onDelete('cascade');
            $table->string('infringer_details'); // Can be JSON or string
            $table->enum('action_type', ['CeaseDesist', 'Litigation', 'Takedown', 'Opposition']);
            $table->string('status')->default('Ongoing');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('infringement_actions');
    }
};
