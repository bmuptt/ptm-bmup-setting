<?php

namespace Tests\Mocks;

trait AuthMock
{
    public function dataAuth()
    {
        return [
            "message" => "Profile retrieved successfully",
            "profile" => [
                "id" => 1,
                "email" => "admin@arzhi.com",
                "name" => "Admin",
                "gender" => "Male",
                "birthdate" => "2001-01-01T00:00:00.000Z",
                "photo" => null,
                "active" => "Active",
                "role_id" => 1,
                "created_by" => 0,
                "created_at" => "2025-05-04T23:38:55.399Z",
                "updated_by" => null,
                "updated_at" => "2025-05-04T23:38:55.399Z",
                "iat" => 1753479368,
                "exp" => 1753480268
            ]
        ];
    }

    public function mockAuthMiddleware(array $profileOverride = []): void
    {
        $merged = array_merge($this->dataAuth(), $profileOverride);

        // Konversi array menjadi nested object sesuai JSON dari Express
        $userObject = json_decode(json_encode($merged)); // ← ini konversi array → stdClass

        app()->instance(\App\Http\Middleware\VerifyCoreToken::class, new class($userObject) {
            private $profile;

            public function __construct($profile)
            {
                $this->profile = $profile;
            }

            public function handle($request, $next)
            {
                // Set user resolver dengan struktur yang sesuai dengan middleware yang sudah diperbaiki
                $request->setUserResolver(function () {
                    return (object) [
                        'id' => $this->profile->profile->id,
                        'name' => $this->profile->profile->name,
                        'email' => $this->profile->profile->email
                    ];
                });
                return $next($request);
            }
        });
    }
}
