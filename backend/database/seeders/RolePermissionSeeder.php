<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use updateOrCreate to prevent unique constraint errors
        $adminRole = Role::updateOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $lawyerRole = Role::updateOrCreate(['slug' => 'lawyer'], ['name' => 'Lawyer']);
        $staffRole = Role::updateOrCreate(['slug' => 'staff'], ['name' => 'Staff']);

        // Permissions
        $permissions = [
            'manage-users', 'manage-lawyers', 'manage-clients', 'manage-cases',
            'view-cases', 'create-cases', 'edit-cases', 'delete-cases',
            'manage-appointments', 'manage-payroll', 'manage-attendance',
            'view-reports', 'manage-settings'
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(
                ['slug' => $perm],
                ['name' => ucwords(str_replace('-', ' ', $perm))]
            );
        }

        // Assign all permissions to Admin
        $adminRole->permissions()->sync(Permission::all());

        // Create or update Admin User
        User::updateOrCreate(
            ['email' => 'admin@advocate.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'status' => 'active',
            ]
        );
    }
}
