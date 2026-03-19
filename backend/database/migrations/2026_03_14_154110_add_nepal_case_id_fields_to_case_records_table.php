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
        Schema::table('case_records', function (Blueprint $table) {
            $table->string('bs_year')->nullable()->after('case_number');
            $table->string('case_type_code')->nullable()->after('bs_year');
            $table->integer('sequential_number')->nullable()->after('case_type_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_records', function (Blueprint $table) {
            $table->dropColumn(['bs_year', 'case_type_code', 'sequential_number']);
        });
    }
};
