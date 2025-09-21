<?php

namespace App\Services;

use App\Constants\UserConstants;
use App\Models\Member;
use App\Repositories\Contracts\MemberRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class MemberService
{
    protected $memberRepository;
    protected $userRepository;

    public function __construct(
        MemberRepositoryInterface $memberRepository,
        UserRepositoryInterface $userRepository
    ) {
        $this->memberRepository = $memberRepository;
        $this->userRepository = $userRepository;
    }

    public function create(array $data, ?UploadedFile $photo = null, ?int $createdBy = null): array
    {
        $memberData = $data;

        // Add created_by (required field, default to anonymous user if no user)
        $memberData['created_by'] = $createdBy ?? UserConstants::ANONYMOUS_USER_ID;

        // Handle photo upload
        if ($photo) {
            $photoPath = $photo->store('members', 'public');
            $memberData['photo'] = $photoPath;
        }

        $member = $this->memberRepository->create($memberData);

        return $this->formatMemberData($member);
    }

    public function getById(int $id): array
    {
        $member = $this->memberRepository->findById($id);
        
        if (!$member) {
            throw new \Exception('Member not found', 404);
        }

        return $this->formatMemberData($member);
    }

    public function getByUserId(int $userId): array
    {
        $member = $this->memberRepository->findByUserId($userId);
        
        if (!$member) {
            throw new \Exception('Member not found', 404);
        }

        return $this->formatMemberData($member);
    }

    public function getByEmail(string $email): array
    {
        $member = $this->memberRepository->findByEmail($email);
        
        if (!$member) {
            throw new \Exception('Member not found', 404);
        }

        return $this->formatMemberData($member);
    }

    public function getAll(int $perPage = 15, ?string $search = null, ?string $orderField = null, ?string $orderDir = null, ?string $active = null): array
    {
        $members = $this->memberRepository->getAll($perPage, $search, $orderField, $orderDir, $active);
        
        return [
            'data' => $members->map(function ($member) {
                return $this->formatMemberData($member);
            }),
            'pagination' => [
                'current_page' => $members->currentPage(),
                'last_page' => $members->lastPage(),
                'per_page' => $members->perPage(),
                'total' => $members->total(),
                'from' => $members->firstItem(),
                'to' => $members->lastItem(),
            ]
        ];
    }

    public function update(int $id, array $data, ?UploadedFile $photo = null, ?int $updatedBy = null, ?int $statusFile = null): array
    {
        $member = $this->memberRepository->findById($id);
        
        if (!$member) {
            throw new \Exception('Member not found', 404);
        }

        $updateData = $data;

        // Remove status_file from updateData as it's not a database field
        unset($updateData['status_file']);

        // Add updated_by (use user ID or default to anonymous user)
        $updateData['updated_by'] = $updatedBy ?? UserConstants::ANONYMOUS_USER_ID;

        // Handle file upload based on status_file
        if ($statusFile !== null) {
            if ($statusFile === 1) {
                // status_file = 1: replace or delete file
                if ($photo) {
                    // Replace file: delete old photo and store new one
                    if ($member->photo && Storage::disk('public')->exists($member->photo)) {
                        Storage::disk('public')->delete($member->photo);
                    }
                    $photoPath = $photo->store('members', 'public');
                    $updateData['photo'] = $photoPath;
                } else {
                    // Delete file: remove photo without uploading new one
                    if ($member->photo && Storage::disk('public')->exists($member->photo)) {
                        Storage::disk('public')->delete($member->photo);
                    }
                    $updateData['photo'] = null;
                }
            }
            // status_file = 0: no file changes (do nothing with photo)
        }

        $updatedMember = $this->memberRepository->update($id, $updateData);

        return $this->formatMemberData($updatedMember);
    }

    public function delete(int $id): bool
    {
        return $this->memberRepository->delete($id);
    }

    /**
     * Format member data for API response
     */
    private function formatMemberData($member): array
    {
        return [
            'id' => $member->id,
            'user_id' => $member->user_id,
            'name' => $member->name,
            'email' => $member->email,
            'gender' => $member->gender,
            'birthdate' => $member->birthdate?->format('Y-m-d'),
            'address' => $member->address,
            'phone' => $member->phone,
            'photo' => $member->photo ? asset('storage/' . $member->photo) : null,
            'active' => $member->active,
            'has_user_account' => $member->hasUserAccount(),
            'created_by' => $member->created_by,
            'updated_by' => $member->updated_by,
            'created_at' => $member->created_at,
            'updated_at' => $member->updated_at,
        ];
    }

    /**
     * Create user in be-app-management
     * 
     * @param array $userData
     * @return array
     * @throws \Exception
     */
    public function createUser(array $userData): array
    {
        // Get member data (validation already done in request)
        $member = $this->memberRepository->findById($userData['member_id']);
        
        // Prepare user data from member
        $userDataToSend = [
            'role_id' => $userData['role_id'],
            'email' => $member->email,
            'name' => $member->name,
            'gender' => $member->gender,
            'birthdate' => $member->birthdate,
        ];

        // Create user in be-app-management
        $userResponse = $this->userRepository->createUser($userDataToSend);

        // Update member with user_id from external service response
        if (isset($userResponse['data']['id'])) {
            $this->memberRepository->update($member->id, [
                'user_id' => $userResponse['data']['id']
            ]);
        }

        return $userResponse;
    }
}
