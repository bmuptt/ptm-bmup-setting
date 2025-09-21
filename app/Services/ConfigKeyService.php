<?php

namespace App\Services;

class ConfigKeyService
{
    /**
     * Get TinyMCE API key from config
     * 
     * @return string|null
     */
    public function getApiKey(): ?string
    {
        return config('services.tinymce.api_key');
    }

    /**
     * Check if TinyMCE API key is configured
     * 
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->getApiKey());
    }

    /**
     * Get TinyMCE configuration array
     * 
     * @return array
     */
    public function getConfig(): array
    {
        return [
            'api_key' => $this->getApiKey(),
            'is_configured' => $this->isConfigured(),
        ];
    }
}