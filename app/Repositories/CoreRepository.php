<?php

namespace App\Repositories;

use App\Models\Core;
use App\Repositories\Contracts\CoreRepositoryInterface;

class CoreRepository implements CoreRepositoryInterface
{
    public function findCore(): ?Core
    {
        return Core::find(0);
    }

    public function update(array $data): Core
    {
        $core = $this->findCore();
        
        if (!$core) {
            throw new \Exception('Core not found');
        }

        $core->update($data);
        
        return $core->fresh();
    }
}
