# Icons API

## GET List Active Icons

Endpoint:
- GET `http://localhost:3200/api/setting/landing/icons`

Curl:
```bash
curl -X GET 'http://localhost:3200/api/setting/landing/icons' \
  -H 'Accept: application/json'
```

Response (200):
```json
{
  "success": true,
  "message": "Icons retrieved successfully",
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "mdi-table-tennis",
      "label": "Table Tennis",
      "is_active": true,
      "created_at": "2025-12-28T00:00:00.000Z",
      "updated_at": "2025-12-28T00:00:00.000Z"
    }
  ]
}
```

