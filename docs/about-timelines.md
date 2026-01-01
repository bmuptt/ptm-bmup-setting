# About Timelines (Perjalanan Kami) - Curl Examples

## Base URL
```
http://localhost:3200/api/setting/about-timelines
```

## 1. List Timelines (Landing / Public)

Hanya menampilkan data `is_published=true`, urut `year` ascending.

```bash
curl --location 'http://localhost:3200/api/setting/about-timelines/landing' \
  -H 'Accept: application/json'
```
Response:
{
  "success": true,
  "data": [
    {
      "id": 2,
      "year": 2010,
      "title": "Tahun 2010",
      "description": "Desc 2010",
      "is_published": true,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": 1,
      "year": 2015,
      "title": "Tahun 2015",
      "description": "Desc 2015",
      "is_published": true,
      "created_by": 0,
      "updated_by": 0,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "message": "About timelines retrieved successfully",
  "count": 2
}

## 2. List Timelines (CMS / Auth)

Wajib login (cookie `token`). Default menampilkan semua data (published dan unpublished).
Jika butuh filter, gunakan query `is_published=true|false`.

```bash
curl --location 'http://localhost:3200/api/setting/about-timelines?is_published=false' \
  -H 'Accept: application/json'
```

## 3. Detail Timeline (Auth)

```bash
curl --location 'http://localhost:3200/api/setting/about-timelines/1' \
  -H 'Accept: application/json'
```

## 4. Create Timeline (Auth)

```bash
curl --location 'http://localhost:3200/api/setting/about-timelines' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{
    "year": 2015,
    "title": "Judul singkat",
    "description": "Deskripsi detail",
    "is_published": true
  }'
```

## 5. Update Timeline (Auth)

```bash
curl --location --request PUT 'http://localhost:3200/api/setting/about-timelines/1' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{
    "year": 2016,
    "title": "Judul update",
    "description": "Deskripsi update",
    "is_published": false
  }'
```

## 6. Delete Timeline (Auth)

```bash
curl --location --request DELETE 'http://localhost:3200/api/setting/about-timelines/1' \
  -H 'Accept: application/json'
```
