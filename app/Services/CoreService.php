<?php

namespace App\Services;

use App\Constants\UserConstants;
use App\Repositories\Contracts\CoreRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CoreService
{
    public function __construct(
        private CoreRepositoryInterface $coreRepository
    ) {}

    public function getDetail(): array
    {
        $core = $this->coreRepository->findCore();
        
        if (!$core) {
            throw new \Exception('Core not found', 404);
        }

        return [
            'id' => $core->id,
            'name' => $core->name,
            'logo' => $core->logo ? asset('storage/' . $core->logo) : null,
            'description' => $core->description,
            'address' => $core->address,
            'maps' => $core->maps,
            'primary_color' => $core->primary_color,
            'secondary_color' => $core->secondary_color,
            'created_at' => $core->created_at,
            'updated_at' => $core->updated_at,
        ];
    }

    public function update(array $data, ?UploadedFile $logo = null, ?int $userId = null): array
    {
        $core = $this->coreRepository->findCore();
        
        if (!$core) {
            throw new \Exception('Core not found', 404);
        }

        $updateData = $data;
        $statusLogo = 0; // Default: no change

        // Add updated_by (use user ID or default to anonymous user)
        $updateData['updated_by'] = $userId ?? UserConstants::ANONYMOUS_USER_ID;

        // Handle logo logic based on status_logo flag
        if (isset($data['status_logo'])) {
            $statusLogoValue = (int) $data['status_logo']; // Convert string to integer
            
            if ($statusLogoValue == 1) {
                // Status 1: Changed/Deleted
                if ($logo) {
                    // Delete old logo if exists
                    if ($core->logo && Storage::disk('public')->exists($core->logo)) {
                        Storage::disk('public')->delete($core->logo);
                    }

                    // Store new logo
                    $logoPath = $logo->store('logos', 'public');
                    $updateData['logo'] = $logoPath;
                } else {
                    // No logo file provided - delete existing logo
                    if ($core->logo && Storage::disk('public')->exists($core->logo)) {
                        Storage::disk('public')->delete($core->logo);
                    }
                    $updateData['logo'] = null;
                }
                $statusLogo = 1;
            }
            // Status 0: No change - do nothing with logo
        }

        // Remove status_logo from update data since it's not stored in database
        unset($updateData['status_logo']);

        $updatedCore = $this->coreRepository->update($updateData);

        return [
            'id' => $updatedCore->id,
            'name' => $updatedCore->name,
            'logo' => $updatedCore->logo ? asset('storage/' . $updatedCore->logo) : null,
            'description' => $updatedCore->description,
            'address' => $updatedCore->address,
            'maps' => $updatedCore->maps,
            'primary_color' => $updatedCore->primary_color,
            'secondary_color' => $updatedCore->secondary_color,
            'status_logo' => $statusLogo, // Return the status for reference
            'created_at' => $updatedCore->created_at,
            'updated_at' => $updatedCore->updated_at,
        ];
    }
}
