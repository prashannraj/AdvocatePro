<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('corporate_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('case_records')->onDelete('cascade');
            $table->enum('type', ['FDI', 'JV', 'M&A', 'Loan', 'Other']);
            $table->decimal('amount', 15, 2)->nullable();
            $table->string('parties')->nullable();
            $table->string('status')->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('corporate_transactions');
    }
};
