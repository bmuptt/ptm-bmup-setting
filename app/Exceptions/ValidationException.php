<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class ValidationException extends Exception
{
    public array $errorData;

    public function __construct(string $message = "", int $code = 0, array $errorData = [], ?Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->errorData = $errorData;
    }

    public function getErrorData(): array
    {
        return $this->errorData;
    }
}