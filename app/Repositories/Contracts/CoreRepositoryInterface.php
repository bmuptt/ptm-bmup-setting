<?php

namespace App\Repositories\Contracts;

use App\Models\Core;

interface CoreRepositoryInterface
{
    public function findCore(): ?Core;
    public function update(array $data): Core;
}
