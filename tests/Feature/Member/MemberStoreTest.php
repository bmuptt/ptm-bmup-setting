<?php

use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Mocks\AuthMock;

uses(RefreshDatabase::class, AuthMock::class);

beforeEach(function () {
    Storage::fake('public');
    $this->mockAuthMiddleware();
});

test('can create member', function () {
    // Arrange
    $memberData = [
        'name' => 'Test User',
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
    ];

    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(201);
    $this->assertDatabaseHas('members', [
        'name' => 'Test User',
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => 1,
    ]);
    
    $response->assertJsonPath('data.email', 'john@example.com')
        ->assertJsonPath('data.gender', 'Male')
        ->assertJsonPath('data.birthdate', '1990-01-01')
        ->assertJsonPath('data.address', 'Jakarta, Indonesia')
        ->assertJsonPath('data.phone', '08123456789')
        ->assertJsonPath('data.active', true);

    $this->assertDatabaseHas('members', [
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'user_id' => null,
        'created_by' => 1,
    ]);
});

test('can create member with photo', function () {
    // Arrange
    $photo = UploadedFile::fake()->image('member.jpg', 100, 100);
    
    $memberData = [
        'email' => 'jane@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-05-15',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'photo' => $photo,
    ];

    // Add name field to fix the error
    $memberData['name'] = 'Jane Doe';
    
    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(201)
        ->assertJson([
            'data' => [
                'name' => 'Jane Doe',
                'email' => 'jane@example.com',
                'gender' => 'Female',
                'birthdate' => '1995-05-15',
                'address' => 'Surabaya, Indonesia',
                'phone' => '08123456788',
                'active' => true,
            ]
        ]);

    // Check if photo was stored
    $this->assertDatabaseHas('members', [
        'email' => 'jane@example.com',
        'gender' => 'Female',
        'created_by' => 1,
    ]);

    $member = Member::where('email', 'jane@example.com')->first();
    $this->assertNotNull($member->photo);
    $this->assertStringStartsWith('members/', $member->photo);
});

test('can create member without email', function () {
    // Arrange
    $memberData = [
        'gender' => 'Male',
        'birthdate' => '1985-12-25',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => false,
    ];

    // Add name field to fix the error
    $memberData['name'] = 'John Doe';
    
    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(201)
        ->assertJson([
            'data' => [
                'name' => 'John Doe',
                'email' => null,
                'gender' => 'Male',
                'birthdate' => '1985-12-25',
                'address' => 'Bandung, Indonesia',
                'phone' => '08123456787',
                'active' => false,
            ]
        ]);

    $this->assertDatabaseHas('members', [
        'email' => null,
        'gender' => 'Male',
        'birthdate' => '1985-12-25',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => false,
        'created_by' => 1,
    ]);
});

test('returns validation error when required fields are missing', function () {
    // Arrange
    $memberData = [
        'email' => 'test@example.com',
        // Missing required fields: gender, birthdate, address, phone, active
    ];

    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(400)
        ->assertJson([
            'errors' => [
                'Name is required',
                'Gender is required',
                'Birthdate is required',
                'Address is required',
                'Phone is required',
                'Active status is required'
            ]
        ]);
});

test('returns validation error when email is invalid', function () {
    // Arrange
    $memberData = [
        'email' => 'invalid-email',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
    ];

    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(400)
        ->assertJson([
            'errors' => [
                'Name is required',
                'Email must be a valid email address'
            ]
        ]);
});

test('returns validation error when gender is invalid', function () {
    // Arrange
    $memberData = [
        'email' => 'test@example.com',
        'gender' => 'Other', // Invalid gender
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
    ];

    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(400)
        ->assertJson([
            'errors' => [
                'Name is required',
                'Gender must be either Male or Female'
            ]
        ]);
});

test('returns validation error when birthdate is in the future', function () {
    // Arrange
    $memberData = [
        'email' => 'test@example.com',
        'gender' => 'Male',
        'birthdate' => '2030-01-01', // Future date
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
    ];

    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(400)
        ->assertJson([
            'errors' => [
                'Name is required',
                'Birthdate must be before today'
            ]
        ]);
});

test('returns validation error when email already exists', function () {
    // Arrange
    Member::create([
        'name' => 'Existing User',
        'email' => 'existing@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    $memberData = [
        'name' => 'Test Name',
        'email' => 'existing@example.com', // Duplicate email
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
    ];

    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(400)
        ->assertJson([
            'errors' => [
                'This email is already registered'
            ]
        ]);
});

test('stores plain text address without HTML sanitization', function () {
    // Arrange
    $plainAddress = 'Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190';
    
    $memberData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => $plainAddress,
        'phone' => '08123456789',
        'active' => true,
    ];

    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(201);

    // Check that plain text address was stored as-is
    $member = Member::where('email', 'test@example.com')->first();
    expect($member->address)->toBe($plainAddress);
});

test('can create member with email as string null', function () {
    // Arrange
    $memberData = [
        'name' => 'John Doe',
        'email' => 'null', // String "null" from frontend
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
    ];

    // Act
    $response = $this->call('POST', '/api/setting/members', $memberData, ['token' => 'test-token']);

    // Assert
    $response->assertStatus(201);
    
    $responseData = $response->json();
    expect($responseData['success'])->toBeTrue();
    expect($responseData['message'])->toBe('Member created successfully');
    expect($responseData['data']['name'])->toBe('John Doe');
    expect($responseData['data']['email'])->toBeNull(); // Should be converted to null
    
    // Verify database
    $this->assertDatabaseHas('members', [
        'name' => 'John Doe',
        'email' => null,
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);
});
