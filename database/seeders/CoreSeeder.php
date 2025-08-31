<?php

namespace Database\Seeders;

use App\Models\Core;
use Illuminate\Database\Seeder;

class CoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Core::create([
            'id' => 0,
            'name' => 'PTM BMUP',
            'logo' => null,
            'description' => 'Sistem pengaturan BMUP',
            'address' => 'Jl. Contoh No. 123, Jakarta',
            'maps' => null,
            'primary_color' => '#f86f24',
            'secondary_color' => '#efbc37',
            'created_by' => 0,
            'updated_by' => null,
        ]);
    }
}
