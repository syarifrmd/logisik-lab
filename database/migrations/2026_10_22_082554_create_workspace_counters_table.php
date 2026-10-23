<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspace_counters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('practice_workspaces')->cascadeOnDelete();
            $table->string('counter_type', 10); // SA, BM, BK, KRM
            $table->date('counter_date');
            $table->unsignedInteger('next_number')->default(1);
            $table->timestamps();

            $table->unique(['workspace_id', 'counter_type', 'counter_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_counters');
    }
};
