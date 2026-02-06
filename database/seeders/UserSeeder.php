<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 一般ユーザー30人の作成 (Factoryを使用して氏名をランダム化)
        for ($i = 1; $i <= 30; $i++) {
            User::factory()->create([
                'email' => "test{$i}@example.com",
                'password' => Hash::make('usertest'),
                'is_admin' => false,
            ]);
        }

        // 管理者アカウントの作成
        User::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => Hash::make('adminpass'),
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);
    }
}