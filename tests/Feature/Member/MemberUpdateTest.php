<?php

use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Mocks\AuthMock;

uses(RefreshDatabase::class, AuthMock::class);

beforeEach(function () {
    $this->mockAuthMiddleware();
});

test('can update member without photo changes (status_file = 0)', function () {
    // Arrange - Create a member with photo
    Storage::fake('public');
    $photo = UploadedFile::fake()->image('old-photo.jpg');
    $photoPath = $photo->store('members', 'public');
    
    $member = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'photo' => $photoPath,
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Update member with status_file = 0
    $response = $this->call('PUT', "/api/setting/members/{$member->id}", [
        'name' => 'John Updated',
        'email' => 'john.updated@example.com',
        'status_file' => '0'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['success'])->toBeTrue();
    expect($responseData['message'])->toBe('Member updated successfully');
    expect($responseData['data']['name'])->toBe('John Updated');
    expect($responseData['data']['email'])->toBe('john.updated@example.com');
    expect($responseData['data']['photo'])->not->toBeNull(); // Photo should remain unchanged
    
    // Verify old photo still exists
    expect(Storage::disk('public')->exists($photoPath))->toBeTrue();
    
    // Verify database
    $this->assertDatabaseHas('members', [
        'id' => $member->id,
        'name' => 'John Updated',
        'email' => 'john.updated@example.com',
        'photo' => $photoPath,
        'updated_by' => 1,
    ]);
});

test('can update member and replace photo (status_file = 1 with upload)', function () {
    // Arrange - Create a member with photo
    Storage::fake('public');
    $oldPhoto = UploadedFile::fake()->image('old-photo.jpg');
    $oldPhotoPath = $oldPhoto->store('members', 'public');
    
    $member = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'photo' => $oldPhotoPath,
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Update member with new photo
    $newPhoto = UploadedFile::fake()->image('new-photo.jpg');
    $response = $this->call('PUT', "/api/setting/members/{$member->id}", [
        'name' => 'John Updated',
        'email' => 'john.updated@example.com',
        'status_file' => '1'
    ], ['token' => 'test-token'], ['photo' => $newPhoto]);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['success'])->toBeTrue();
    expect($responseData['data']['name'])->toBe('John Updated');
    expect($responseData['data']['email'])->toBe('john.updated@example.com');
    expect($responseData['data']['photo'])->not->toBeNull(); // New photo should exist
    
    // Verify old photo is deleted
    expect(Storage::disk('public')->exists($oldPhotoPath))->toBeFalse();
    
    // Verify new photo exists
    $updatedMember = Member::find($member->id);
    expect(Storage::disk('public')->exists($updatedMember->photo))->toBeTrue();
    
    // Verify database
    $this->assertDatabaseHas('members', [
        'id' => $member->id,
        'name' => 'John Updated',
        'email' => 'john.updated@example.com',
        'updated_by' => 1,
    ]);
    expect($updatedMember->photo)->not->toBe($oldPhotoPath); // Photo path should be different
});

test('can update member and delete photo (status_file = 1 without upload)', function () {
    // Arrange - Create a member with photo
    Storage::fake('public');
    $photo = UploadedFile::fake()->image('old-photo.jpg');
    $photoPath = $photo->store('members', 'public');
    
    $member = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'photo' => $photoPath,
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Update member without photo (delete photo)
    $response = $this->call('PUT', "/api/setting/members/{$member->id}", [
        'name' => 'John Updated',
        'email' => 'john.updated@example.com',
        'status_file' => '1'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['success'])->toBeTrue();
    expect($responseData['data']['name'])->toBe('John Updated');
    expect($responseData['data']['email'])->toBe('john.updated@example.com');
    expect($responseData['data']['photo'])->toBeNull(); // Photo should be deleted
    
    // Verify old photo is deleted
    expect(Storage::disk('public')->exists($photoPath))->toBeFalse();
    
    // Verify database
    $this->assertDatabaseHas('members', [
        'id' => $member->id,
        'name' => 'John Updated',
        'email' => 'john.updated@example.com',
        'photo' => null,
        'updated_by' => 1,
    ]);
});

test('can update member without status_file parameter (no photo changes)', function () {
    // Arrange - Create a member with photo
    Storage::fake('public');
    $photo = UploadedFile::fake()->image('old-photo.jpg');
    $photoPath = $photo->store('members', 'public');
    
    $member = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'photo' => $photoPath,
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Update member without status_file parameter
    $response = $this->call('PUT', "/api/setting/members/{$member->id}", [
        'name' => 'John Updated',
        'email' => 'john.updated@example.com'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['success'])->toBeTrue();
    expect($responseData['data']['name'])->toBe('John Updated');
    expect($responseData['data']['email'])->toBe('john.updated@example.com');
    expect($responseData['data']['photo'])->not->toBeNull(); // Photo should remain unchanged
    
    // Verify old photo still exists
    expect(Storage::disk('public')->exists($photoPath))->toBeTrue();
    
    // Verify database
    $this->assertDatabaseHas('members', [
        'id' => $member->id,
        'name' => 'John Updated',
        'email' => 'john.updated@example.com',
        'photo' => $photoPath,
        'updated_by' => 1,
    ]);
});

test('returns 404 when member not found', function () {
    // Act - Try to update non-existent member
    $response = $this->call('PUT', '/api/setting/members/999', [
        'name' => 'John Updated',
        'status_file' => '0'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(404);
    
    $responseData = $response->json();
    expect($responseData['success'])->toBeFalse();
    expect($responseData['message'])->toBe('Member not found');
});

test('validates required fields for update', function () {
    // Arrange - Create a member
    $member = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Try to update with invalid data
    $response = $this->call('PUT', "/api/setting/members/{$member->id}", [
        'gender' => 'Invalid',
        'birthdate' => 'invalid-date',
        'status_file' => 'invalid'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(400);
    
    $responseData = $response->json();
    expect($responseData['errors'])->toBeArray();
    expect($responseData['errors'])->toContain('Gender must be Male or Female');
    expect($responseData['errors'])->toContain('Birthdate must be a valid date');
    expect($responseData['errors'])->toContain('Status file must be 0 or 1');
});

test('can update member with email as string null', function () {
    // Arrange - Create a member
    $member = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Update member with email as string "null"
    $response = $this->call('PUT', "/api/setting/members/{$member->id}", [
        'name' => 'John Updated',
        'email' => 'null', // String "null" from frontend
        'status_file' => '0'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['success'])->toBeTrue();
    expect($responseData['message'])->toBe('Member updated successfully');
    expect($responseData['data']['name'])->toBe('John Updated');
    expect($responseData['data']['email'])->toBeNull(); // Should be converted to null
    
    // Verify database
     $this->assertDatabaseHas('members', [
         'id' => $member->id,
         'name' => 'John Updated',
         'email' => null,
         'updated_by' => 1,
     ]);
});
