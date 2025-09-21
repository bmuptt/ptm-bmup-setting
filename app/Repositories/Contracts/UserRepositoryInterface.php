<?php

namespace App\Repositories\Contracts;

interface UserRepositoryInterface
{
    /**
     * Create a new user in be-app-management
     * 
     * @param array $userData
     * @return array
     * @throws \Exception
     */
    public function createUser(array $userData): array;
}