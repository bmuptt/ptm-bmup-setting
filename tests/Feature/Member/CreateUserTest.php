<?php

use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\Mocks\AuthMock;

uses(RefreshDatabase::class, AuthMock::class);

beforeEach(function () {
    $this->mockAuthMiddleware();
});

it('can create user for member without user id', function () {
        // Arrange
        $member = Member::create([
            'user_id' => null,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'gender' => 'Male',
            'birthdate' => '1990-01-01',
            'address' => 'Jakarta, Indonesia',
            'phone' => '08123456789',
            'active' => true,
            'created_by' => 1,
        ]);

        $userData = [
            'member_id' => $member->id,
            'role_id' => 2
        ];

        $expectedResponse = [
            'success' => true,
            'data' => [
                'id' => 123,
                'email' => 'test@example.com',
                'role_id' => 2
            ]
        ];

        // Mock HTTP response from be-app-management
        Http::fake([
            'http://localhost:3000/api/app-management/user' => Http::response($expectedResponse, 201)
        ]);

        // Act
        $response = $this->withCookie('token', 'test-token')
                         ->postJson('/api/setting/members/create-user', $userData);

        // Assert
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $expectedResponse
            ]);

        // Verify HTTP request was sent to be-app-management with correct data
        Http::assertSent(function ($request) {
            $isCorrectUrl = str_contains($request->url(), '/app-management/user');
            $requestData = $request->data();
            $hasRequiredFields = isset($requestData['role_id']) && 
                               isset($requestData['email']) && 
                               isset($requestData['name']) && 
                               isset($requestData['gender']) && 
                               isset($requestData['birthdate']);
            return $isCorrectUrl && $hasRequiredFields;
        });

        // Verify that member's user_id is updated with the ID from external service
        $member->refresh();
        expect($member->user_id)->toBe(123);
});

it('cannot create user when member already has user', function () {
        // Arrange
        $member = Member::create([
            'user_id' => 123, // Member already has user
            'name' => 'Test User',
            'email' => 'test@example.com',
            'gender' => 'Male',
            'birthdate' => '1990-01-01',
            'address' => 'Jakarta, Indonesia',
            'phone' => '08123456789',
            'active' => true,
            'created_by' => 1,
        ]);

        $userData = [
            'member_id' => $member->id,
            'role_id' => 2
        ];

        // No HTTP fake needed as validation should prevent request
        Http::fake();

        // Act
        $response = $this->withCookie('token', 'test-token')
                         ->postJson('/api/setting/members/create-user', $userData);

        // Assert
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'Member already has a user account'
                ]
            ]);

        // Verify no HTTP request was made
        Http::assertNothingSent();
});

it('validation fails when required fields missing', function () {
        // Act
        $response = $this->call('POST', '/api/setting/members/create-user', [], ['token' => 'test-token']);

        // Assert
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'Member ID is required',
                    'Role ID is required'
                ]
            ]);
});

it('validation fails when member not exists', function () {
        // Arrange
        $userData = [
            'member_id' => 999,
            'role_id' => 2
        ];

        // Act
        $response = $this->withCookie('token', 'test-token')
                         ->postJson('/api/setting/members/create-user', $userData);

        // Assert
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'Member not found'
                ]
            ]);
});

it('handles validation error from be app management', function () {
        // Arrange
        $member = Member::create([
            'user_id' => null,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'gender' => 'Male',
            'birthdate' => '1990-01-01',
            'address' => 'Jakarta, Indonesia',
            'phone' => '08123456789',
            'active' => true,
            'created_by' => 1,
        ]);

        $userData = [
            'member_id' => $member->id,
            'role_id' => 2
        ];

        $errorResponse = [
            'errors' => [
                'email' => 'Email must be a valid email address'
            ]
        ];

        // Mock HTTP error response from be-app-management
        Http::fake([
            'http://localhost:3000/api/app-management/user' => Http::response($errorResponse, 400)
        ]);

        // Act
        $response = $this->withCookie('token', 'test-token')
                         ->postJson('/api/setting/members/create-user', $userData);

        // Assert
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'errors' => ['Email must be a valid email address']
            ]);
});

it('cannot create user when member email is empty', function () {
        // Arrange
        $member = Member::create([
            'user_id' => null,
            'name' => 'Test User',
            'email' => null, // Email is null
            'gender' => 'Male',
            'birthdate' => '1990-01-01',
            'address' => 'Jakarta, Indonesia',
            'phone' => '08123456789',
            'active' => true,
            'created_by' => 1,
        ]);

        $userData = [
            'member_id' => $member->id,
            'role_id' => 2
        ];

        // No HTTP fake needed as validation should prevent request
        Http::fake();

        // Act
        $response = $this->withCookie('token', 'test-token')
                         ->postJson('/api/setting/members/create-user', $userData);

        // Assert
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'Member email is required to create user account'
                ]
            ]);

        // Verify no HTTP request was made
        Http::assertNothingSent();
});

it('handles server error from be app management', function () {
        // Arrange
        $member = Member::create([
            'user_id' => null,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'gender' => 'Male',
            'birthdate' => '1990-01-01',
            'address' => 'Jakarta, Indonesia',
            'phone' => '08123456789',
            'active' => true,
            'created_by' => 1,
        ]);

        $userData = [
            'member_id' => $member->id,
            'role_id' => 2
        ];

        // Mock HTTP server error response from be-app-management
        Http::fake([
            'http://localhost:3000/api/app-management/user' => Http::response([], 500)
        ]);

        // Act
        $response = $this->withCookie('token', 'test-token')
                         ->postJson('/api/setting/members/create-user', $userData);

        // Assert
        $response->assertStatus(500)
            ->assertJson([
                'success' => false,
                'message' => 'Server error occurred while creating user'
            ]);
});
