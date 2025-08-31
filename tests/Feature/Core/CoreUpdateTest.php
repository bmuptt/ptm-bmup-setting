<?php

use App\Models\Core;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Mocks\AuthMock;

uses(RefreshDatabase::class, AuthMock::class);

beforeEach(function () {
    Storage::fake('public');
    $this->mockAuthMiddleware();
});

test('can update core', function () {
    // Arrange
    Core::create([
        'id' => 0,
        'name' => 'Old Name',
        'logo' => null,
        'description' => 'Old Description',
        'address' => 'Old Address',
        'maps' => null,
        'primary_color' => '#3B82F6',
        'secondary_color' => '#1E40AF',
        'created_by' => 0,
        'updated_by' => null,
    ]);

    $updateData = [
        'name' => 'New Name',
        'description' => 'New Description',
        'address' => 'New Address',
        'primary_color' => '#EF4444',
        'secondary_color' => '#DC2626',
        'status_logo' => '0', // No change - as string
    ];

    // Act
    $response = $this->call('PATCH', '/api/setting/core', $updateData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'name',
                'logo',
                'description',
                'address',
                'maps',
                'primary_color',
                'secondary_color',
                'status_logo',
                'created_at',
                'updated_at',
            ]
        ])
        ->assertJson([
            'success' => true,
            'message' => 'Core updated successfully',
            'data' => [
                'id' => 0,
                'name' => 'New Name',
                'logo' => null,
                'description' => 'New Description',
                'address' => 'New Address',
                'maps' => null,
                'primary_color' => '#EF4444',
                'secondary_color' => '#DC2626',
                'status_logo' => '0', // No change - as string
            ]
        ]);

    $this->assertDatabaseHas('cores', [
        'id' => 0,
        'name' => 'New Name',
        'description' => 'New Description',
        'address' => 'New Address',
        'primary_color' => '#EF4444',
        'secondary_color' => '#DC2626',
        'updated_by' => 1, // User ID from mock auth
    ]);
});

test('can update core with logo', function () {
    // Arrange
    Core::create([
        'id' => 0,
        'name' => 'Test Core',
        'logo' => null,
        'description' => 'Test Description',
        'address' => 'Test Address',
        'maps' => null,
        'primary_color' => '#3B82F6',
        'secondary_color' => '#1E40AF',
        'created_by' => 0,
        'updated_by' => null,
    ]);

    $logo = UploadedFile::fake()->image('logo.png', 100, 100);

    $updateData = [
        'name' => 'Updated Core',
        'logo' => $logo,
        'status_logo' => '1', // Changed
    ];

    // Act
    $response = $this->call('PATCH', '/api/setting/core', $updateData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Core updated successfully',
            'data' => [
                'id' => 0,
                'name' => 'Updated Core',
                'status_logo' => '1', // Changed
            ]
        ]);

    // Check if logo was stored
    $this->assertDatabaseHas('cores', [
        'id' => 0,
        'name' => 'Updated Core',
        'updated_by' => 1, // User ID from mock auth
    ]);

    $updatedCore = Core::find(0);
    $this->assertNotNull($updatedCore->logo);
    $this->assertStringStartsWith('logos/', $updatedCore->logo);
});

test('can update core with status_logo 0 (no change)', function () {
    // Arrange
    Core::create([
        'id' => 0,
        'name' => 'Test Core',
        'logo' => 'logos/existing-logo.jpg',
        'description' => 'Test Description',
        'address' => 'Test Address',
        'maps' => null,
        'primary_color' => '#3B82F6',
        'secondary_color' => '#1E40AF',
        'created_by' => 0,
        'updated_by' => null,
    ]);

    $updateData = [
        'name' => 'Updated Core',
        'status_logo' => '0', // No change
    ];

    // Act
    $response = $this->call('PATCH', '/api/setting/core', $updateData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Core updated successfully',
            'data' => [
                'id' => 0,
                'name' => 'Updated Core',
                'status_logo' => '0', // No change
            ]
        ]);

    // Check that logo remains unchanged
    $this->assertDatabaseHas('cores', [
        'id' => 0,
        'name' => 'Updated Core',
        'logo' => 'logos/existing-logo.jpg',
        'updated_by' => 1,
    ]);
});

test('can update core with status_logo 1 (changed) and logo file', function () {
    // Arrange
    Core::create([
        'id' => 0,
        'name' => 'Test Core',
        'logo' => 'logos/old-logo.jpg',
        'description' => 'Test Description',
        'address' => 'Test Address',
        'maps' => null,
        'primary_color' => '#3B82F6',
        'secondary_color' => '#1E40AF',
        'created_by' => 0,
        'updated_by' => null,
    ]);

    $logo = UploadedFile::fake()->image('new-logo.png', 100, 100);

    $updateData = [
        'name' => 'Updated Core',
        'status_logo' => '1', // Changed
        'logo' => $logo,
    ];

    // Act
    $response = $this->call('PATCH', '/api/setting/core', $updateData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Core updated successfully',
            'data' => [
                'id' => 0,
                'name' => 'Updated Core',
                'status_logo' => '1', // Changed
            ]
        ]);

    // Check that new logo was stored
    $this->assertDatabaseHas('cores', [
        'id' => 0,
        'name' => 'Updated Core',
        'updated_by' => 1,
    ]);

    $updatedCore = Core::find(0);
    $this->assertNotNull($updatedCore->logo);
    $this->assertStringStartsWith('logos/', $updatedCore->logo);
    $this->assertNotEquals('logos/old-logo.jpg', $updatedCore->logo);
});

test('can update core with status_logo 1 (changed) but no logo file - treats as deleted', function () {
    // Arrange
    Core::create([
        'id' => 0,
        'name' => 'Test Core',
        'logo' => 'logos/existing-logo.jpg',
        'description' => 'Test Description',
        'address' => 'Test Address',
        'maps' => null,
        'primary_color' => '#3B82F6',
        'secondary_color' => '#1E40AF',
        'created_by' => 0,
        'updated_by' => null,
    ]);

    $updateData = [
        'name' => 'Updated Core',
        'status_logo' => '1', // Changed but no file provided
    ];

    // Act
    $response = $this->call('PATCH', '/api/setting/core', $updateData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Core updated successfully',
            'data' => [
                'id' => 0,
                'name' => 'Updated Core',
                'status_logo' => '1', // Changed (deleted)
            ]
        ]);

    // Check that logo was deleted
    $this->assertDatabaseHas('cores', [
        'id' => 0,
        'name' => 'Updated Core',
        'logo' => null,
        'updated_by' => 1,
    ]);
});

test('returns 404 when core not exists', function () {
    // Act
    $response = $this->call('PATCH', '/api/setting/core', [
        'name' => 'Test',
        'status_logo' => '0'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(404)
        ->assertJson([
            'success' => false,
            'message' => 'Core not found'
        ]);
});

test('returns validation error when status_logo is missing', function () {
    // Arrange
    Core::create([
        'id' => 0,
        'name' => 'Test Core',
        'logo' => null,
        'description' => 'Test Description',
        'address' => 'Test Address',
        'maps' => null,
        'primary_color' => '#3B82F6',
        'secondary_color' => '#1E40AF',
        'created_by' => 0,
        'updated_by' => null,
    ]);

    $updateData = [
        'name' => 'Updated Core',
        // status_logo is missing
    ];

    // Act
    $response = $this->call('PATCH', '/api/setting/core', $updateData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => 'Validation failed'
        ])
        ->assertJsonStructure([
            'errors' => [
                'status_logo'
            ]
        ]);
});
