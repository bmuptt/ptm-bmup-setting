<?php

namespace App\Repositories\Contracts;

use App\Models\Member;
use Illuminate\Http\UploadedFile;

interface MemberRepositoryInterface
{
    /**
     * Create a new member
     */
    public function create(array $data): Member;

    /**
     * Find member by ID
     */
    public function findById(int $id): ?Member;

    /**
     * Find member by user_id
     */
    public function findByUserId(int $userId): ?Member;

    /**
     * Find member by email
     */
    public function findByEmail(string $email): ?Member;

    /**
     * Update member
     */
    public function update(int $id, array $data): Member;

    /**
     * Delete member
     */
    public function delete(int $id): bool;

    /**
     * Get all members with pagination
     */
    public function getAll(int $perPage = 15, ?string $search = null, ?string $orderField = null, ?string $orderDir = null, ?string $active = null): \Illuminate\Pagination\LengthAwarePaginator;
}
