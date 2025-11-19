# Member API Documentation

## Overview
This document describes the Member API endpoints for managing member data in the PTM BMUP Setting system.

## Base URL
```
/api/setting/members
```

## Authentication
Most endpoints require authentication using the `verifyCoreToken` middleware.

## Endpoints

### 1. Get All Members
**GET** `/api/setting/members`

Get a paginated list of members with optional search functionality.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` or `per_page` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for name, username, or phone
- `order_field` or `orderField` (optional): Field to order by. Valid values: `id`, `name`, `username`, `gender`, `birthdate`, `address`, `phone`, `active`, `created_at`, `updated_at`
- `order_dir` or `orderDir` (optional): Order direction. Valid values: `asc`, `desc` (default: `asc` when `order_field` is provided)
- `active` (optional): Filter by active status. Valid values: `active`, `inactive`, `all` (default: `all`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "name": "John Doe",
      "username": "johndoe",
      "gender": "Male",
      "birthdate": "1990-01-01T00:00:00.000Z",
      "address": "Jl. Contoh No. 123, Jakarta",
      "phone": "081234567890",
      "photo": "http://localhost:3200/storage/images/members/photo-1234567890.jpg",
      "active": true,
      "created_by": 1,
      "updated_by": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  },
  "message": "Members retrieved successfully"
}
```

### 2. Get Member by ID
**GET** `/api/setting/members/:id`

Get a specific member by their ID.

**Path Parameters:**
- `id`: Member ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "name": "John Doe",
    "username": "johndoe",
    "gender": "Male",
    "birthdate": "1990-01-01T00:00:00.000Z",
    "address": "Jl. Contoh No. 123, Jakarta",
    "phone": "081234567890",
    "photo": "http://localhost:3200/storage/images/members/photo-1234567890.jpg",
    "active": true,
    "created_by": 1,
    "updated_by": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Member retrieved successfully"
}
```

### 3. Create Member
**POST** `/api/setting/members`

Create a new member. Requires authentication.

**Request Body:**
```json
{
  "user_id": 123,
  "name": "John Doe",
  "username": "johndoe",
  "gender": "Male",
  "birthdate": "1990-01-01",
  "address": "Jl. Contoh No. 123, Jakarta",
  "phone": "081234567890",
  "active": true
}
```

**Form Data (multipart/form-data):**
- `photo` (optional): Image file (JPEG, PNG, JPG, GIF, max 2MB)

**Field Validation:**
- `name`: Required, string, max 255 characters
- `username`: Required, string, min 3 characters, max 255 characters, unique, alphanumeric with underscores and hyphens only (regex: `^[a-zA-Z0-9_-]+$`)
- `gender`: Required, must be "Male" or "Female"
- `birthdate`: Required, valid date, must be before today
- `address`: Required, string, max 500 characters
- `phone`: Required, string, max 20 characters
- `photo`: Optional, image file (JPEG, PNG, JPG, GIF, max 2MB)
- `active`: Required, boolean or string ("true"/"false"/"1"/"0")

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "name": "John Doe",
    "username": "johndoe",
    "gender": "Male",
    "birthdate": "1990-01-01T00:00:00.000Z",
    "address": "Jl. Contoh No. 123, Jakarta",
    "phone": "081234567890",
    "photo": "http://localhost:3200/storage/images/members/photo-1234567890.jpg",
    "active": true,
    "created_by": 1,
    "updated_by": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Member created successfully"
}
```

### 4. Update Member
**PUT** `/api/setting/members/:id?_method=PUT`

Update an existing member. Requires authentication.

**Path Parameters:**
- `id`: Member ID

**Query Parameters:**
- `_method=PUT`: Required for method-override (use POST method with this parameter)

**Required Fields:**
- `name`: Required, string, max 255 characters
- `username`: Required, string, min 3 characters, max 255 characters, unique (but allowed if same as current member)
- `gender`: Required, must be "Male" or "Female"
- `birthdate`: Required, valid date, must be before today
- `address`: Required, string, max 500 characters
- `phone`: Required, string, max 20 characters
- `status_file`: Required, must be "0" (no photo change) or "1" (change photo)

**Optional Fields:**
- `photo`: Optional, image file (only used if status_file="1")
- `active`: Optional, boolean

**Form Data (multipart/form-data):**
- All required fields must be sent
- `photo` (optional): Image file (JPEG, PNG, JPG, GIF, max 2MB) - only used if status_file="1"

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "name": "John Doe Updated",
    "username": "johndoe_updated",
    "gender": "Male",
    "birthdate": "1990-01-01T00:00:00.000Z",
    "address": "Jl. Contoh No. 123 Updated, Jakarta",
    "phone": "081234567890",
    "photo": "http://localhost:3200/storage/images/members/photo-1234567890-updated.jpg",
    "active": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Member updated successfully"
}
```

### 5. Delete Member
**DELETE** `/api/setting/members/:id`

Delete a member. Requires authentication.

**Path Parameters:**
- `id`: Member ID

**Response:**
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "errors": [
    "Name is required",
    "Gender must be either Male or Female",
    "Birthdate must be before today"
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Member not found",
  "error": "Member not found"
}
```

### 400 Bad Request (Duplicate Data)
```json
{
  "success": false,
  "errors": ["This username is already taken"]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create member",
  "error": "Database connection error"
}
```

## File Upload

### Photo Upload
- Supported formats: JPEG, PNG, JPG, GIF
- Maximum file size: 2MB
- Files are stored in `storage/images/members/` directory
- File names are generated with timestamp and random suffix for uniqueness
- Old photos are automatically deleted when updating or deleting members

## Database Schema

### Members Table
```sql
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  gender VARCHAR(255) NOT NULL,
  birthdate DATE NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(255) NOT NULL,
  photo VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Integration Tests

The API includes comprehensive integration tests covering:
- Successful member creation with valid data
- Validation error handling for all required fields
- Duplicate username and user_id prevention
- Username format validation (alphanumeric + underscores/hyphens)
- File upload functionality
- Boolean field conversion
- Pagination and search functionality
- Error response formats

Run tests with:
```bash
npm test tests/integration/member/create-member.test.ts
```

## Example Usage - cURL Commands

### 1. Get All Members
```bash
curl --location 'http://localhost:3200/api/setting/members'
```

### 2. Get All Members with Pagination
```bash
curl --location 'http://localhost:3200/api/setting/members?page=1&limit=10'
```

### 2a. Get All Members with Pagination using per_page
```bash
curl --location 'http://localhost:3200/api/setting/members?page=1&per_page=10'
```

### 3. Get All Members with Search
```bash
curl --location 'http://localhost:3200/api/setting/members?search=john'
```

### 3a. Get All Members with Sorting (camelCase)
```bash
curl --location 'http://localhost:3200/api/setting/members?orderField=name&orderDir=asc'
```

### 3b. Get All Members with Sorting (snake_case)
```bash
curl --location 'http://localhost:3200/api/setting/members?order_field=name&order_dir=asc'
```

### 3c. Get All Members with Search, Sorting, and Pagination
```bash
curl --location 'http://localhost:3200/api/setting/members?search=john&order_field=name&order_dir=asc&page=1&per_page=10&active=active'
```

### 4. Get Member by ID
```bash
curl --location 'http://localhost:3200/api/setting/members/1'
```

### 5. Create Member (JSON)
```bash
curl --location 'http://localhost:3200/api/setting/members' \
--header 'Content-Type: application/json' \
--data '{
  "name": "John Doe",
  "username": "johndoe",
  "gender": "Male",
  "birthdate": "1990-01-01",
  "address": "Jl. Contoh No. 123, Jakarta",
  "phone": "081234567890",
  "active": true
}'
```

### 6. Create Member with Photo Upload
```bash
curl --location 'http://localhost:3200/api/setting/members' \
--form 'name="John Doe"' \
--form 'username="johndoe"' \
--form 'gender="Male"' \
--form 'birthdate="1990-01-01"' \
--form 'address="Jl. Contoh No. 123, Jakarta"' \
--form 'phone="081234567890"' \
--form 'active="true"' \
--form 'photo=@"/path/to/photo.jpg"'
```

### 7. Create Member with Minimal Data
```bash
curl --location 'http://localhost:3200/api/setting/members' \
--header 'Content-Type: application/json' \
--data '{
  "name": "Jane Doe",
  "username": "janedoe",
  "gender": "Female",
  "birthdate": "1995-05-15",
  "address": "Jl. Test No. 456, Bandung",
  "phone": "081234567891",
  "active": false
}'
```

### 8. Update Member (Without Photo Upload)
**Required fields**: `name`, `username`, `gender`, `birthdate`, `address`, `phone`, `status_file`
**Required parameter**: `_method=PUT` in URL query

```bash
curl --location 'http://localhost:3200/api/setting/members/1?_method=PUT' \
--header 'Content-Type: application/json' \
--data '{
  "name": "John Doe Updated",
  "username": "johndoe_updated",
  "gender": "Male",
  "birthdate": "1990-01-01",
  "address": "Jl. Updated Address No. 789, Jakarta",
  "phone": "081234567890",
  "status_file": "0",
  "active": true
}'
```

### 9. Update Member with Photo Upload
**Required fields**: `name`, `username`, `gender`, `birthdate`, `address`, `phone`, `status_file`
**Required parameter**: `_method=PUT` in URL query

```bash
curl --location 'http://localhost:3200/api/setting/members/1?_method=PUT' \
--form 'name="John Doe with New Photo"' \
--form 'username="johnphoto"' \
--form 'gender="Male"' \
--form 'birthdate="1990-01-01"' \
--form 'address="Jl. Updated Address No. 789, Jakarta"' \
--form 'phone="081234567890"' \
--form 'status_file="1"' \
--form 'photo=@"/path/to/new-photo.jpg"'
```

### 10. Update Member (Remove Photo)
**Required fields**: `name`, `username`, `gender`, `birthdate`, `address`, `phone`, `status_file`
**Required parameter**: `_method=PUT` in URL query

```bash
curl --location 'http://localhost:3200/api/setting/members/1?_method=PUT' \
--form 'name="John Doe Without Photo"' \
--form 'username="johndoe_no_photo"' \
--form 'gender="Male"' \
--form 'birthdate="1990-01-01"' \
--form 'address="Jl. Updated Address No. 789, Jakarta"' \
--form 'phone="081234567890"' \
--form 'status_file="1"'
```

### 11. Update Member (JSON with All Fields)
```bash
curl --location 'http://localhost:3200/api/setting/members/1?_method=PUT' \
--header 'Content-Type: application/json' \
--data '{
  "name": "John Doe Complete Update",
  "username": "johndoe_updated",
  "gender": "Male",
  "birthdate": "1990-01-01",
  "address": "Jl. Complete Address No. 999, Jakarta",
  "phone": "081234567890",
  "status_file": "0",
  "active": true
}'
```

## Why PUT instead of PATCH?

This API uses **PUT** instead of **PATCH** because:

### PUT (Full Update/Replace)
- ✅ **Replaces the entire resource** with the provided data
- ✅ All required fields must be sent (name, gender, birthdate, address, phone, status_file)
- ✅ More strict and predictable behavior
- ✅ Idempotent (multiple identical requests have same effect)
- ✅ Better for forms where all fields are available

### PATCH (Partial Update)
- ❌ Only updates provided fields
- ❌ Some fields might not be sent
- ❌ Less predictable (might miss required fields)
- ❌ Not fully idempotent

**In this API**: Update requires all core fields (name, username, gender, birthdate, address, phone, status_file) to be sent, making PUT more appropriate for data consistency and validation.

### Username Uniqueness Rule
- Username must be **unique** across all members
- However, **using the same username as the current member being updated is allowed** (no change)
- Example: Updating member ID 1 with username "johndoe" is OK if member ID 1 already has username "johndoe"

### Status File Parameter
- `status_file="0"`: No photo change (keep existing photo)
- `status_file="1"`: Change photo (upload new file or remove if no file provided)

## External Core User Service

Member list enriches each entry with email data fetched from the Core service (`API_URL_CORE`).  
Use the following cURL in Postman to reproduce the external request:

```bash
curl --location 'http://localhost:3200/api/app-management/user/get-email?ids=1,2,3' \
--header 'Accept: application/json'
```

### Example Responses from Core Service

The repository layer supports multiple response shapes; any of these are accepted:

```json
{
  "success": true,
  "data": [
    { "id": 1, "email": "john@example.com" },
    { "id": 2, "email": "jane@example.com" }
  ]
}
```

```json
{
  "users": [
    { "id": 1, "email": "john@example.com" },
    { "id": 2, "email": "jane@example.com" }
  ]
}
```

```json
[
  { "id": 1, "email": "john@example.com" },
  { "id": 2, "email": "jane@example.com" }
]
```

- `ids` can contain up to as many user IDs as needed (comma-separated).
- `fields` is optional; use it to limit payload (e.g., `id,email`).
- Authorization/header requirements depend on Core service configuration.

### 12. Create External User for Member
**POST** `/api/setting/members/create-user/:id`

Create or sync a user in the external Core service for the specified member.

**URL Parameter**
- `id`: Member ID in this service.

**Request Body**
```json
{
  "email": "user@example.com",
  "role_id": 1
}
```

**Flow**
- Requires authentication (`verifyCoreToken`).
- Validates payload (`email`, `role_id`) and ensures the member exists and is not already linked to a user.
- Uses member data (`name`, `gender`, `birthdate`) to complete the payload sent to Core.
- On success, updates `user_id` on the member when the Core response contains an ID.
- Returns validation errors from Core (HTTP 400) directly in the response.

**cURL**
```bash
curl --location --request POST 'http://localhost:3200/api/setting/members/create-user/1' \
--header 'Content-Type: application/json' \
--data '{
  "email": "user@example.com",
  "role_id": 1
}'
```

**Success Response Example**
```json
{
  "success": true,
  "message": "Success to add data user.",
  "data": {
    "id": 42,
    "email": "user@example.com",
    "name": "John Doe",
    "gender": "Male",
    "birthdate": "1990-01-01T00:00:00.000Z",
    "photo": null,
    "active": "Active",
    "role_id": 1,
    "created_by": 7,
    "created_at": "2025-11-09T07:15:12.123Z",
    "updated_by": null,
    "updated_at": "2025-11-09T07:15:12.123Z"
  }
}
```

**Error Scenarios**
- `400`: invalid member ID, invalid payload, member already linked, missing required member fields, or validation errors from Core.
- `404`: member not found.
- Other status codes bubble up errors from the Core service.

### 13. Delete Member
```bash
curl --location --request DELETE 'http://localhost:3200/api/setting/members/1'
```
