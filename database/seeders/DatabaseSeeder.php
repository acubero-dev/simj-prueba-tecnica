<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuario admin fijo
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin'), // contraseña: admin
            'is_admin' => true,
        ]);

        // Usuario normal fijo
        User::create([
            'name' => 'User',
            'email' => 'user@example.com',
            'password' => Hash::make('user'), // contraseña: user
            'is_admin' => false,
        ]);

        User::factory(5)->create()->each(function ($user) {
            Project::factory(2)->create(['user_id' => $user->id])->each(function ($project) use ($user) {
                Task::factory(3)->create([
                    'project_id' => $project->id,
                    'user_id' => $user->id,
                ]);
            });
        });
    }
}
