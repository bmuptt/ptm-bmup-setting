<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\MemberStoreRequest;
use App\Http\Requests\MemberUpdateRequest;
use App\Services\MemberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Exceptions\ValidationException;

/**
 * @OA\Tag(
 *     name="Members",
 *     description="Endpoints untuk mengelola members"
 * )
 */
class MemberController extends Controller
{
    public function __construct(
        private MemberService $memberService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/members",
     *     summary="Get List of Members",
     *     description="Mengambil daftar members dengan pagination, search, sort, dan filter",
     *     tags={"Members"},
     *     security={{"cookieAuth": {}}},
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Jumlah data per halaman",
     *         required=false,
     *         @OA\Schema(type="integer", example=15)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name",
     *         required=false,
     *         @OA\Schema(type="string", example="john")
     *     ),
     *     @OA\Parameter(
     *         name="order_field",
     *         in="query",
     *         description="Field untuk sorting (id, name, email, gender, birthdate, address, phone, active, created_at, updated_at)",
     *         required=false,
     *         @OA\Schema(type="string", example="name")
     *     ),
     *     @OA\Parameter(
     *         name="order_dir",
     *         in="query",
     *         description="Direction sorting (asc, desc)",
     *         required=false,
     *         @OA\Schema(type="string", example="asc")
     *     ),
     *     @OA\Parameter(
     *         name="active",
     *         in="query",
     *         description="Filter by active status (all, active, inactive)",
     *         required=false,
     *         @OA\Schema(type="string", example="active")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List members berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", nullable=true),
     *                     @OA\Property(property="name", type="string", example="John Doe"),
     *                     @OA\Property(property="email", type="string", example="john@example.com"),
     *                     @OA\Property(property="gender", type="string", example="Male"),
     *                     @OA\Property(property="birthdate", type="string", format="date", example="1990-01-01"),
     *                     @OA\Property(property="address", type="string", example="Jakarta, Indonesia"),
     *                     @OA\Property(property="phone", type="string", example="08123456789"),
     *                     @OA\Property(property="photo", type="string", nullable=true),
     *                     @OA\Property(property="active", type="boolean", example=true),
     *                     @OA\Property(property="has_user_account", type="boolean", example=false),
     *                     @OA\Property(property="created_by", type="integer", example=1),
     *                     @OA\Property(property="updated_by", type="integer", nullable=true),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
     *                 )
     *             ),
     *             @OA\Property(property="pagination", type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=15),
     *                 @OA\Property(property="total", type="integer", example=75),
     *                 @OA\Property(property="from", type="integer", example=1),
     *                 @OA\Property(property="to", type="integer", example=15)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized - Token tidak valid"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $orderField = $request->get('order_field');
            $orderDir = $request->get('order_dir');
            $active = $request->get('active');
            
            $data = $this->memberService->getAll($perPage, $search, $orderField, $orderDir, $active);
            
            return response()->json([
                'success' => true,
                'data' => $data['data'],
                'pagination' => $data['pagination']
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/members",
     *     summary="Create New Member",
     *     description="Membuat member baru dengan file upload support",
     *     tags={"Members"},
     *     security={{"cookieAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="user_id", type="integer", nullable=true, description="User ID jika sudah punya akun"),
     *                 @OA\Property(property="name", type="string", example="John Doe", description="Nama lengkap"),
     *                 @OA\Property(property="email", type="string", format="email", example="john@example.com", description="Email address"),
     *                 @OA\Property(property="gender", type="string", enum={"Male", "Female"}, example="Male", description="Jenis kelamin"),
     *                 @OA\Property(property="birthdate", type="string", format="date", example="1990-01-01", description="Tanggal lahir"),
     *                 @OA\Property(property="address", type="string", example="Jakarta, Indonesia", description="Alamat lengkap"),
     *                 @OA\Property(property="phone", type="string", example="08123456789", description="Nomor telepon"),
     *                 @OA\Property(property="photo", type="string", format="binary", description="Foto profil"),
     *                 @OA\Property(property="active", type="boolean", example=true, description="Status aktif")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Member berhasil dibuat",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member created successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", nullable=true),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john@example.com"),
     *                 @OA\Property(property="gender", type="string", example="Male"),
     *                 @OA\Property(property="birthdate", type="string", format="date", example="1990-01-01"),
     *                 @OA\Property(property="address", type="string", example="Jakarta, Indonesia"),
     *                 @OA\Property(property="phone", type="string", example="08123456789"),
     *                 @OA\Property(property="photo", type="string", nullable=true),
     *                 @OA\Property(property="active", type="boolean", example=true),
     *                 @OA\Property(property="created_by", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function store(MemberStoreRequest $request): JsonResponse
    {
        try {
            $data = $this->memberService->create(
                $request->validated(),
                $request->file('photo'),
                $request->user()->id ?? null
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Member created successfully',
                'data' => $data
            ], 201);
        } catch (\Exception $e) {
            $statusCode = $e->getCode();
            // Ensure status code is a valid HTTP status code
            if ($statusCode < 100 || $statusCode > 599) {
                $statusCode = 500;
            }
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $statusCode);
        }
    }

    /**
     * Display the specified member
     */
    public function show(int $id): JsonResponse
    {
        try {
            $data = $this->memberService->getById($id);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get member by user ID
     */
    public function showByUserId(int $userId): JsonResponse
    {
        try {
            $data = $this->memberService->getByUserId($userId);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * Get member by email
     */
    public function showByEmail(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            $data = $this->memberService->getByEmail($request->email);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/members/{id}",
     *     summary="Update Member",
     *     description="Update member data dengan file upload support",
     *     tags={"Members"},
     *     security={{"cookieAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="user_id", type="integer", nullable=true, description="User ID jika sudah punya akun"),
     *                 @OA\Property(property="name", type="string", example="John Doe Updated", description="Nama lengkap"),
     *                 @OA\Property(property="email", type="string", format="email", example="john.updated@example.com", description="Email address"),
     *                 @OA\Property(property="gender", type="string", enum={"Male", "Female"}, example="Male", description="Jenis kelamin"),
     *                 @OA\Property(property="birthdate", type="string", format="date", example="1990-01-01", description="Tanggal lahir"),
     *                 @OA\Property(property="address", type="string", example="Jakarta, Indonesia Updated", description="Alamat lengkap"),
     *                 @OA\Property(property="phone", type="string", example="08123456789", description="Nomor telepon"),
     *                 @OA\Property(property="photo", type="string", format="binary", description="Foto profil"),
     *                 @OA\Property(property="active", type="boolean", example=true, description="Status aktif"),
     *                 @OA\Property(property="status_file", type="integer", example=1, description="0: no change, 1: replace/delete file")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member berhasil diupdate",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member updated successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", nullable=true),
     *                 @OA\Property(property="name", type="string", example="John Doe Updated"),
     *                 @OA\Property(property="email", type="string", example="john.updated@example.com"),
     *                 @OA\Property(property="gender", type="string", example="Male"),
     *                 @OA\Property(property="birthdate", type="string", format="date", example="1990-01-01"),
     *                 @OA\Property(property="address", type="string", example="Jakarta, Indonesia Updated"),
     *                 @OA\Property(property="phone", type="string", example="08123456789"),
     *                 @OA\Property(property="photo", type="string", nullable=true),
     *                 @OA\Property(property="active", type="boolean", example=true),
     *                 @OA\Property(property="updated_by", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Member not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function update(MemberUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $this->memberService->update(
                $id,
                $request->validated(),
                $request->file('photo'),
                $request->user()->id ?? null,
                $request->get('status_file')
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Member updated successfully',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            $statusCode = $e->getCode();
            // Ensure status code is a valid HTTP status code
            if ($statusCode < 100 || $statusCode > 599) {
                $statusCode = 500;
            }
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $statusCode);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/members/{id}",
     *     summary="Delete Member",
     *     description="Menghapus member berdasarkan ID",
     *     tags={"Members"},
     *     security={{"cookieAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member berhasil dihapus",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Member not found")
     *         )
     *     )
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->memberService->delete($id);
            
            return response()->json([
                'success' => true,
                'message' => 'Member deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/members/create-user",
     *     summary="Create User for Member",
     *     description="Membuat user di be-app-management untuk member yang belum memiliki user",
     *     tags={"Members"},
     *     security={{"cookieAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"member_id", "email", "role_id"},
     *             @OA\Property(property="member_id", type="integer", example=1, description="ID member yang akan dibuatkan user"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="Email untuk user"),
     *             @OA\Property(property="role_id", type="integer", example=2, description="Role ID untuk user"),
     *             @OA\Property(property="name", type="string", example="John Doe", description="Nama user (optional)"),
     *             @OA\Property(property="gender", type="string", enum={"Male", "Female"}, example="Male", description="Gender user (optional)"),
     *             @OA\Property(property="birthdate", type="string", format="date", example="1990-01-01", description="Tanggal lahir user (optional)")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User berhasil dibuat",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User created successfully"),
     *             @OA\Property(property="data", type="object", description="Data user yang dibuat")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Member sudah memiliki user",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Member already has a user account")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function createUser(CreateUserRequest $request): JsonResponse
    {
        try {
            $userData = $request->validated();
            $result = $this->memberService->createUser($userData);
            
            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $result
            ], 201);
        } catch (ValidationException $e) {
            // Handle validation errors from UserRepository
            $errorData = $e->getErrorData();
            if (isset($errorData['errors'])) {
                $response = [
                    'success' => false,
                    'errors' => $errorData['errors']
                ];
                
                // Add source information if available
                if (isset($errorData['source'])) {
                    $response['source'] = $errorData['source'];
                }
                
                return response()->json($response, $e->getCode() ?: 400);
            }
            
            $response = [
                'success' => false,
                'message' => $e->getMessage()
            ];
            
            // Add source information if available
            if (isset($errorData['source'])) {
                $response['source'] = $errorData['source'];
            }
            
            return response()->json($response, $e->getCode() ?: 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 500);
        }
    }
}
