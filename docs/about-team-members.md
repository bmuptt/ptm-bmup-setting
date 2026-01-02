# About Team Members API (Pengurus & Pelatih)

Modul ini untuk management section "Pengurus & Pelatih" pada halaman About.

Sorting:
- `display_order` asc, lalu `id` desc

## GET List About Team Members (Landing)

Endpoint:
- GET `http://localhost:3200/api/setting/about-team-members/landing`

Catatan:
- Hanya mengembalikan data `is_published=true`.

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/about-team-members/landing' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "About team members retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 2,
      "member_id": 1002,
      "member": {
        "id": 1002,
        "name": "Member 1002",
        "username": "member1002",
        "photo": null,
        "active": true
      },
      "role": "Ketua Umum",
      "display_order": 1,
      "is_published": true,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2025-12-28T00:00:00.000Z",
      "updated_at": "2025-12-28T00:00:00.000Z"
    },
    {
      "id": 1,
      "member_id": 1001,
      "member": {
        "id": 1001,
        "name": "Member 1001",
        "username": "member1001",
        "photo": null,
        "active": true
      },
      "role": "Pelatih Kepala",
      "display_order": 2,
      "is_published": true,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2025-12-28T00:00:00.000Z",
      "updated_at": "2025-12-28T00:00:00.000Z"
    }
  ]
}
```

## GET List About Team Members (CMS)

Endpoint:
- GET `http://localhost:3200/api/setting/about-team-members`

Query:
- `is_published` (optional): `true|false|1|0`

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/about-team-members?is_published=false' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "About team members retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 3,
      "member_id": 1003,
      "member": {
        "id": 1003,
        "name": "Member 1003",
        "username": "member1003",
        "photo": null,
        "active": true
      },
      "role": "Sekretaris",
      "display_order": 3,
      "is_published": false,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2025-12-28T00:00:00.000Z",
      "updated_at": "2025-12-28T00:00:00.000Z"
    }
  ]
}
```

Response (400 Validation):
```json
{
  "errors": [
    "The is_published is invalid!"
  ]
}
```

## GET Detail About Team Member (CMS)

Endpoint:
- GET `http://localhost:3200/api/setting/about-team-members/{id}`

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/about-team-members/1' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "About team member retrieved successfully",
  "data": {
    "id": 1,
    "member_id": 1001,
    "member": {
      "id": 1001,
      "name": "Member 1001",
      "username": "member1001",
      "photo": null,
      "active": true
    },
    "role": "Pelatih Kepala",
    "display_order": 2,
    "is_published": true,
    "created_by": 0,
    "updated_by": 0,
    "created_at": "2025-12-28T00:00:00.000Z",
    "updated_at": "2025-12-28T00:00:00.000Z"
  }
}
```

Response (404):
```json
{
  "errors": [
    "About team member not found"
  ]
}
```

## POST Create About Team Member (CMS)

Endpoint:
- POST `http://localhost:3200/api/setting/about-team-members`

Body (JSON):
- `member_id` (required): id member (angka/string angka)
- `role` (required): jabatan/posisi (max 120)
- `is_published` (optional, default true)

Curl:
```bash
curl -X POST 'http://localhost:3200/api/setting/about-team-members' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "member_id": "2001",
    "role": "Ketua Umum",
    "is_published": true
  }'
```

Response (201):
```json
{
  "success": true,
  "message": "About team member created successfully",
  "data": {
    "id": 1,
    "member_id": 2001,
    "role": "Ketua Umum",
    "display_order": 1,
    "is_published": true,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2025-12-28T00:00:00.000Z",
    "updated_at": "2025-12-28T00:00:00.000Z"
  }
}
```

Response (400 Validation):
```json
{
  "errors": [
    "The role is required!"
  ]
}
```

Response (400 Duplicate):
```json
{
  "errors": [
    "The member_id and role is already exists!"
  ]
}
```

## PUT Update About Team Member (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/about-team-members/{id}`

Body (JSON):
- `member_id` (required): id member (angka/string angka)
- `role` (required): jabatan/posisi (max 120)
- `is_published` (optional, default tetap seperti sebelumnya)

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/about-team-members/1' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "member_id": "2001",
    "role": "Ketua Umum Updated",
    "is_published": false
  }'
```

Response (200):
```json
{
  "success": true,
  "message": "About team member updated successfully",
  "data": {
    "id": 1,
    "member_id": 2001,
    "role": "Ketua Umum Updated",
    "display_order": 1,
    "is_published": false,
    "created_by": 1,
    "updated_by": 1,
    "created_at": "2025-12-28T00:00:00.000Z",
    "updated_at": "2025-12-28T00:00:00.000Z"
  }
}
```

## DELETE Delete About Team Member (CMS)

Endpoint:
- DELETE `http://localhost:3200/api/setting/about-team-members/{id}`

Curl:
```bash
curl -X DELETE 'http://localhost:3200/api/setting/about-team-members/1' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "About team member deleted successfully"
}
```

## PUT Sort About Team Members (vue-draggable) (CMS)

Endpoint:
- PUT `http://localhost:3200/api/setting/about-team-members/sort`

Body (JSON):
- `ids` (required): array id about team member mengikuti urutan dari frontend

Curl:
```bash
curl -X PUT 'http://localhost:3200/api/setting/about-team-members/sort' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "ids": ["3", "1", "2"]
  }'
```

Response (200):
```json
{
  "success": true,
  "message": "About team members sorted successfully"
}
```

Response (400 Validation):
```json
{
  "errors": [
    "Some about team members were not found!"
  ]
}
```
