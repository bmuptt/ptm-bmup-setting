<?php

use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Mocks\AuthMock;

uses(RefreshDatabase::class, AuthMock::class);

beforeEach(function () {
    $this->mockAuthMiddleware();
});

test('can get list of members with pagination', function () {
    // Arrange - Create test members
    $member1 = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'member1@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    $member2 = Member::create([
        'user_id' => null,
        'name' => 'Jane Smith',
        'email' => 'member2@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act
    $response = $this->call('GET', '/api/setting/members', [], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'user_id',
                    'name',
                    'email',
                    'gender',
                    'birthdate',
                    'address',
                    'phone',
                    'photo',
                    'active',
                    'has_user_account',
                    'created_by',
                    'updated_by',
                    'created_at',
                    'updated_at',
                ]
            ],
            'pagination' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
                'from',
                'to',
            ]
        ])
        ->assertJson([
            'success' => true,
        ]);

    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(2);
    expect($responseData['pagination']['total'])->toBe(2);
});

test('can get list of members with custom per_page', function () {
    // Arrange - Create test members
    for ($i = 1; $i <= 5; $i++) {
        Member::create([
            'user_id' => null,
            'name' => "Member {$i}",
            'email' => "member{$i}@example.com",
            'gender' => 'Male',
            'birthdate' => '1990-01-01',
            'address' => 'Jakarta, Indonesia',
            'phone' => '08123456789',
            'active' => true,
            'created_by' => 1,
        ]);
    }

    // Act
    $response = $this->call('GET', '/api/setting/members', ['per_page' => 3], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(3);
    expect($responseData['pagination']['per_page'])->toBe(3);
    expect($responseData['pagination']['total'])->toBe(5);
});

test('can search members by name', function () {
    // Arrange - Create members with different names
    $member1 = Member::create([
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

    $member2 = Member::create([
        'user_id' => null,
        'name' => 'Alice Smith',
        'email' => 'alice@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Bob Wilson',
        'email' => 'bob@example.com',
        'gender' => 'Male',
        'birthdate' => '1985-01-01',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Search for "john"
    $response = $this->call('GET', '/api/setting/members', ['search' => 'john'], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(1);
    expect($responseData['data'][0]['id'])->toBe($member1->id);
    expect($responseData['data'][0]['name'])->toBe('John Doe');
});

test('can search members by partial name', function () {
    // Arrange - Create members with different names
    Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john.doe@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Johnny Walker',
        'email' => 'johnny.walker@example.com',
        'gender' => 'Male',
        'birthdate' => '1985-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Jane Smith',
        'email' => 'jane.smith@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Search for "john" (should match both John Doe and Johnny Walker)
    $response = $this->call('GET', '/api/setting/members', ['search' => 'john'], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(2);
    
    // Verify both members with "john" in name are returned
    $names = collect($responseData['data'])->pluck('name')->toArray();
    expect($names)->toContain('John Doe');
    expect($names)->toContain('Johnny Walker');
});

test('returns empty result when search does not match any names', function () {
    // Arrange - Create members
    Member::create([
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

    // Act - Search for non-existent name
    $response = $this->call('GET', '/api/setting/members', ['search' => 'nonexistent'], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(0);
    expect($responseData['pagination']['total'])->toBe(0);
});

test('members are sorted by id desc by default', function () {
    // Arrange - Create members with different IDs
    $member1 = Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'member1@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    $member2 = Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'member2@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    $member3 = Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'member3@example.com',
        'gender' => 'Male',
        'birthdate' => '1985-01-01',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act
    $response = $this->call('GET', '/api/setting/members', [], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(3);
    
    // Verify sorting by ID desc (latest first)
    $memberIds = collect($responseData['data'])->pluck('id')->toArray();
    expect($memberIds[0])->toBeGreaterThan($memberIds[1]);
    expect($memberIds[1])->toBeGreaterThan($memberIds[2]);
});

test('can combine search and pagination', function () {
    // Arrange - Create members with different names
    Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john.doe@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Johnny Walker',
        'email' => 'johnny.walker@example.com',
        'gender' => 'Male',
        'birthdate' => '1985-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'John Smith',
        'email' => 'john.smith@example.com',
        'gender' => 'Male',
        'birthdate' => '1992-01-01',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Jane Doe',
        'email' => 'jane.doe@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Medan, Indonesia',
        'phone' => '08123456786',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Search for "john" with per_page = 2
    $response = $this->call('GET', '/api/setting/members', [
        'search' => 'john',
        'per_page' => 2
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(2);
    expect($responseData['pagination']['per_page'])->toBe(2);
    expect($responseData['pagination']['total'])->toBe(3); // Only 3 members with "john" in name
});

test('can sort members by different fields', function () {
    // Arrange - Create members with different data
    $member1 = Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'charlie@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    $member2 = Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'alice@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    $member3 = Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'bob@example.com',
        'gender' => 'Male',
        'birthdate' => '1985-01-01',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => false,
        'created_by' => 1,
    ]);

    // Act - Sort by email ascending
    $response = $this->call('GET', '/api/setting/members', [
        'order_field' => 'email',
        'order_dir' => 'asc'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(3);
    
    // Verify sorting by email (alphabetical order)
    $emails = collect($responseData['data'])->pluck('email')->toArray();
    expect($emails[0])->toBe('alice@example.com');
    expect($emails[1])->toBe('bob@example.com');
    expect($emails[2])->toBe('charlie@example.com');
});

test('can filter members by active status', function () {
    // Arrange - Create members with different active status
    Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'active1@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'active2@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'inactive1@example.com',
        'gender' => 'Male',
        'birthdate' => '1985-01-01',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => false,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'inactive2@example.com',
        'gender' => 'Female',
        'birthdate' => '1992-01-01',
        'address' => 'Medan, Indonesia',
        'phone' => '08123456786',
        'active' => false,
        'created_by' => 1,
    ]);

    // Act - Filter by active
    $response = $this->call('GET', '/api/setting/members', [
        'active' => 'active'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(2);
    expect($responseData['pagination']['total'])->toBe(2);
    
    // Verify all returned members are active
    foreach ($responseData['data'] as $member) {
        expect($member['active'])->toBeTrue();
    }
});

test('can filter members by inactive status', function () {
    // Arrange - Create members with different active status
    Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'active1@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'inactive1@example.com',
        'gender' => 'Male',
        'birthdate' => '1985-01-01',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => false,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Test Member',
        'email' => 'inactive2@example.com',
        'gender' => 'Female',
        'birthdate' => '1992-01-01',
        'address' => 'Medan, Indonesia',
        'phone' => '08123456786',
        'active' => false,
        'created_by' => 1,
    ]);

    // Act - Filter by inactive
    $response = $this->call('GET', '/api/setting/members', [
        'active' => 'inactive'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(2);
    expect($responseData['pagination']['total'])->toBe(2);
    
    // Verify all returned members are inactive
    foreach ($responseData['data'] as $member) {
        expect($member['active'])->toBeFalse();
    }
});

test('can sort members by name field', function () {
    // Arrange - Create members with different names
    $member1 = Member::create([
        'user_id' => null,
        'name' => 'Ardiansyah Pratama',
        'email' => 'ardiansyah@example.com',
        'gender' => 'Male',
        'birthdate' => '1995-04-24',
        'address' => 'Bekasi',
        'phone' => '08121234567',
        'active' => true,
        'created_by' => 1,
    ]);

    $member2 = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john.doe@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    $member3 = Member::create([
        'user_id' => null,
        'name' => 'Zoe Smith',
        'email' => 'zoe.smith@example.com',
        'gender' => 'Female',
        'birthdate' => '1992-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Sort by name descending
    $response = $this->call('GET', '/api/setting/members', [
        'order_field' => 'name',
        'order_dir' => 'desc'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(3);
    
    // Verify sorting by name descending (Z to A)
    $names = collect($responseData['data'])->pluck('name')->toArray();
    expect($names[0])->toBe('Zoe Smith');
    expect($names[1])->toBe('John Doe');
    expect($names[2])->toBe('Ardiansyah Pratama');
});

test('can sort members by name field ascending', function () {
    // Arrange - Create members with different names
    $member1 = Member::create([
        'user_id' => null,
        'name' => 'Ardiansyah Pratama',
        'email' => 'ardiansyah@example.com',
        'gender' => 'Male',
        'birthdate' => '1995-04-24',
        'address' => 'Bekasi',
        'phone' => '08121234567',
        'active' => true,
        'created_by' => 1,
    ]);

    $member2 = Member::create([
        'user_id' => null,
        'name' => 'John Doe',
        'email' => 'john.doe@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    $member3 = Member::create([
        'user_id' => null,
        'name' => 'Zoe Smith',
        'email' => 'zoe.smith@example.com',
        'gender' => 'Female',
        'birthdate' => '1992-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Sort by name ascending
    $response = $this->call('GET', '/api/setting/members', [
        'order_field' => 'name',
        'order_dir' => 'asc'
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(3);
    
    // Verify sorting by name ascending (A to Z)
    $names = collect($responseData['data'])->pluck('name')->toArray();
    expect($names[0])->toBe('Ardiansyah Pratama');
    expect($names[1])->toBe('John Doe');
    expect($names[2])->toBe('Zoe Smith');
});

test('can combine search, sort, filter and pagination', function () {
    // Arrange - Create members with different active status and names
    Member::create([
        'user_id' => null,
        'name' => 'john Active',
        'email' => 'john.active@example.com',
        'gender' => 'Male',
        'birthdate' => '1990-01-01',
        'address' => 'Jakarta, Indonesia',
        'phone' => '08123456789',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'John Inactive',
        'email' => 'john.inactive@example.com',
        'gender' => 'Male',
        'birthdate' => '1985-01-01',
        'address' => 'Surabaya, Indonesia',
        'phone' => '08123456788',
        'active' => false,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'johnny Active',
        'email' => 'johnny.active@example.com',
        'gender' => 'Male',
        'birthdate' => '1992-01-01',
        'address' => 'Bandung, Indonesia',
        'phone' => '08123456787',
        'active' => true,
        'created_by' => 1,
    ]);

    Member::create([
        'user_id' => null,
        'name' => 'Jane Active',
        'email' => 'jane.active@example.com',
        'gender' => 'Female',
        'birthdate' => '1995-01-01',
        'address' => 'Medan, Indonesia',
        'phone' => '08123456786',
        'active' => true,
        'created_by' => 1,
    ]);

    // Act - Search for "john", filter by active, sort by email, with pagination
    $response = $this->call('GET', '/api/setting/members', [
        'search' => 'john',
        'active' => 'active',
        'order_field' => 'email',
        'order_dir' => 'asc',
        'per_page' => 2
    ], ['token' => 'test-token']);

    // Assert
    $response->assertStatus(200);
    
    $responseData = $response->json();
    expect($responseData['data'])->toHaveCount(2);
    expect($responseData['pagination']['per_page'])->toBe(2);
    expect($responseData['pagination']['total'])->toBe(2); // Only 2 active members with "john" in name
    
    // Verify all returned members are active and have "john" in name
    foreach ($responseData['data'] as $member) {
        expect($member['active'])->toBeTrue();
        expect($member['name'])->toContain('john');
    }
    
    // Verify sorting by email (alphabetical order) - data sorted by email asc
    $emails = collect($responseData['data'])->pluck('email')->toArray();
    expect($emails[0])->toBe('john.active@example.com');
    expect($emails[1])->toBe('johnny.active@example.com');
});
