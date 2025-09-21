<?php

namespace App\Repositories;

use App\Models\Member;
use App\Repositories\Contracts\MemberRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class MemberRepository implements MemberRepositoryInterface
{
    public function create(array $data): Member
    {
        return Member::create($data);
    }

    public function findById(int $id): ?Member
    {
        return Member::find($id);
    }

    public function findByUserId(int $userId): ?Member
    {
        return Member::where('user_id', $userId)->first();
    }

    public function findByEmail(string $email): ?Member
    {
        return Member::where('email', $email)->first();
    }

    public function update(int $id, array $data): Member
    {
        $member = $this->findById($id);
        
        if (!$member) {
            throw new \Exception('Member not found', 404);
        }

        $member->update($data);
        return $member->fresh();
    }

    public function delete(int $id): bool
    {
        $member = $this->findById($id);
        
        if (!$member) {
            throw new \Exception('Member not found', 404);
        }

        // Delete photo if exists
        if ($member->photo && Storage::disk('public')->exists($member->photo)) {
            Storage::disk('public')->delete($member->photo);
        }

        return $member->delete();
    }

    public function getAll(int $perPage = 15, ?string $search = null, ?string $orderField = null, ?string $orderDir = null, ?string $active = null): LengthAwarePaginator
    {
        $query = Member::query();

        // Search by name
        if ($search) {
            $query->where('name', 'ilike', '%' . $search . '%');
        }

        // Filter by active status
        if ($active && $active !== 'all') {
            $isActive = $active === 'active';
            $query->where('active', $isActive);
        }

        // Apply custom ordering if provided
        if ($orderField && $orderDir) {
            $validOrderFields = ['id', 'name', 'email', 'gender', 'birthdate', 'address', 'phone', 'active', 'created_at', 'updated_at'];
            $validOrderDirs = ['asc', 'desc'];
            
            if (in_array($orderField, $validOrderFields) && in_array($orderDir, $validOrderDirs)) {
                $query->orderBy($orderField, $orderDir);
            }
        }

        // Always add id desc as secondary sort
        $query->orderBy('id', 'desc');

        return $query->paginate($perPage);
    }
}
