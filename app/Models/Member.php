<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Member extends Model
{

    protected $guarded = [];

    protected $casts = [
        'birthdate' => 'date',
        'active' => 'boolean',
    ];

    /**
     * Get the user associated with this member (from be-app-management)
     * This is a one-to-one relationship where user_id can be null
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if member has an associated user account
     */
    public function hasUserAccount(): bool
    {
        return !is_null($this->user_id);
    }
}
