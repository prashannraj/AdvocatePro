<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ip_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->nullable()->constrained('case_records')->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['Trademark', 'Patent', 'Copyright', 'Design']);
            $table->string('asset_name');
            $table->string('application_number')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('class')->nullable(); // NICE Class for trademarks, etc.
            $table->date('filing_date')->nullable();
            $table->enum('status', ['Filed', 'Examined', 'Registered', 'Opposed', 'Renewed', 'Expired'])->default('Filed');
            $table->date('renewal_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ip_assets');
    }
};
