<?php

use App\Models\Core;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Mocks\AuthMock;

uses(RefreshDatabase::class, AuthMock::class);

beforeEach(function () {
    $this->mockAuthMiddleware();
});

test('can get core detail', function () {
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

    // Act
    $response = $this->call('GET', '/api/setting/core', [], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                'id',
                'name',
                'logo',
                'description',
                'address',
                'maps',
                'primary_color',
                'secondary_color',
                'created_at',
                'updated_at',
            ]
        ])
        ->assertJson([
            'success' => true,
            'data' => [
                'id' => 0,
                'name' => 'Test Core',
                'logo' => null,
                'description' => 'Test Description',
                'address' => 'Test Address',
                'maps' => null,
                'primary_color' => '#3B82F6',
                'secondary_color' => '#1E40AF',
            ]
        ]);
});

test('returns 404 when core not exists', function () {
    // Act
    $response = $this->call('GET', '/api/setting/core', [], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(404)
        ->assertJson([
            'success' => false,
            'message' => 'Core not found'
        ]);
});

test('can get core detail with HTML description', function () {
    // Arrange
    $htmlDescription = '<p style="color: #FF0000;">This is a <strong>bold</strong> paragraph.</p>';
    
    Core::create([
        'id' => 0,
        'name' => 'Test Core',
        'logo' => null,
        'description' => $htmlDescription,
        'address' => 'Test Address',
        'maps' => null,
        'primary_color' => '#3B82F6',
        'secondary_color' => '#1E40AF',
        'created_by' => 0,
        'updated_by' => null,
    ]);

    // Act
    $response = $this->call('GET', '/api/setting/core', [], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'id' => 0,
                'name' => 'Test Core',
                'description' => $htmlDescription,
            ]
        ]);
});