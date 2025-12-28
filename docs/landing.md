# Upsert Landing Items (multipart/form-data)

Endpoint:
- POST `http://localhost:3200/api/setting/landing/items?_method=PUT`

**Metode Pengiriman Data (Dua Opsi):**

### Opsi 1: JSON Envelope (Legacy)
Mengirim JSON string dalam field `sections` dan file terpisah dengan format `image_<key>`.

### Opsi 2: Structured Form Data (Recommended)
Mengirim data dalam format field terstruktur per-row (nested keys).

**Format Field:**
- `sections[index][page_key]`: Key halaman (home/about)
- `sections[index][items][itemIndex][key]`: Key item (unik dalam section)
- `sections[index][items][itemIndex][type]`: Tipe item
- `sections[index][items][itemIndex][title]`: Judul
- `sections[index][items][itemIndex][content]`: Konten
- `sections[index][items][itemIndex][published]`: Status publish (true/false)
- `sections[index][items][itemIndex][status_image]`: Status gambar ("0" = tetap, "1" = update/hapus)
- `sections[index][items][itemIndex][image]`: File gambar (binary)

**Curl Example (Structured Form Data):**
```bash
curl -X POST 'http://localhost:3200/api/setting/landing/items?_method=PUT' \
  -H "Accept: application/json" \
  -F 'sections[0][page_key]=home' \
  -F 'sections[0][items][0][key]=hero' \
  -F 'sections[0][items][0][type]=text' \
  -F 'sections[0][items][0][title]=Selamat Datang' \
  -F 'sections[0][items][0][content]=BMUP Home' \
  -F 'sections[0][items][0][published]=true' \
  -F 'sections[0][items][1][key]=tentang_kami' \
  -F 'sections[0][items][1][content]=Tentang kami' \
  -F 'sections[0][items][1][published]=true' \
  -F 'sections[0][items][1][status_image]=1' \
  -F 'sections[0][items][1][image]=@"/C:/path/to/tentang-kami.jpg"'
```

**Notes:**
- `status_image="0"`: Tidak ada perubahan gambar.
- `status_image="1"` dengan file di field `image`: Ganti gambar dengan file baru.
- `status_image="1"` tanpa file di field `image`: Hapus gambar yang ada.
- File disimpan di `storage/images`.

Response (contoh):
```json
{
  "success": true,
  "data": [
    {
      "section": {
        "id": 1,
        "page_key": "home"
      },
      "items": [
        {
          "id": 1,
          "key": "hero",
          "type": "text",
          "title": "Selamat Datang",
          "content": "BMUP Home",
          "image_url": null,
          "button_label": null,
          "button_url": null,
          "published": true,
          "created_by": 1,
          "updated_by": 1
        },
        {
          "id": 2,
          "key": "contact_email",
          "type": "text",
          "title": null,
          "content": "support@example.com",
          "image_url": null,
          "button_label": null,
          "button_url": "mailto:support@example.com",
          "published": true,
          "created_by": 1,
          "updated_by": 1
        },
        {
          "id": 3,
          "key": "tentang_kami",
          "type": "text",
          "title": null,
          "content": "Tentang kami singkat di halaman Home",
          "image_url": "http://localhost:3200/storage/images/tentang-kami.jpg",
          "button_label": null,
          "button_url": null,
          "published": true,
          "created_by": 1,
          "updated_by": 1
        }
      ]
    },
    {
      "section": {
        "id": 2,
        "page_key": "about"
      },
      "items": [
        {
          "id": 4,
          "key": "visi",
          "type": "text",
          "title": null,
          "content": "Meningkatkan kualitas",
          "image_url": null,
          "button_label": null,
          "button_url": null,
          "published": true,
          "created_by": 2,
          "updated_by": 2
        },
        {
          "id": 5,
          "key": "misi",
          "type": "text",
          "title": null,
          "content": "Memberikan layanan terbaik",
          "image_url": null,
          "button_label": null,
          "button_url": null,
          "published": true,
          "created_by": 2,
          "updated_by": 2
        }
      ]
    }
  ],
  "message": "Landing items upserted successfully"
}
```

# GET Landing Sections (Public)

Endpoint:
- GET `http://localhost:3200/api/setting/landing/sections` — ambil semua section beserta items (Tidak perlu login)
- GET `http://localhost:3200/api/setting/landing/sections/{page_key}` — ambil satu section (`home` atau `about`) (Tidak perlu login)

Curl:
```bash
curl 'http://localhost:3200/api/setting/landing/sections'
```

```bash
curl 'http://localhost:3200/api/setting/landing/sections/home'
```

Response (contoh GET satu section):
```json
{
  "success": true,
  "data": {
    "section": {
      "id": 1,
      "page_key": "home"
    },
    "items": [
      {
        "id": 1,
        "key": "hero",
        "type": "text",
        "title": "Selamat Datang",
        "content": "BMUP Home",
        "image_url": null,
        "button_label": null,
        "button_url": null,
        "published": true,
        "created_by": 1,
        "updated_by": 1
      }
    ]
  },
  "message": "Landing section retrieved successfully"
}
```

Response (contoh GET semua section):
```json
{
  "success": true,
  "data": [
    {
      "section": { "id": 1, "page_key": "home" },
      "items": [
        { "id": 1, "key": "hero", "type": "text", "title": "Selamat Datang", "content": "BMUP Home", "image_url": null, "button_label": null, "button_url": null, "published": true, "created_by": 1, "updated_by": 1 }
      ]
    },
    {
      "section": { "id": 2, "page_key": "about" },
      "items": [
        { "id": 2, "key": "visi", "type": "text", "title": null, "content": "Meningkatkan kualitas", "image_url": null, "button_label": null, "button_url": null, "published": true, "created_by": 2, "updated_by": 2 }
      ]
    }
  ],
  "message": "Landing sections retrieved successfully"
}
```

