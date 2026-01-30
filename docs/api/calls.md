# RepairShopr API Documentation - Calls

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

### Calls

#### Get Caller ID

Get Caller ID information.

**Endpoint:** `GET /callerid`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| did | string | Yes | Phone number |
| outbound | boolean | No | Outbound call |

**Response: 200 OK**

```json
{
  "data": {
    "name": "Walking Customer",
    "ticket_status": "Open"
  }
}
```

```json
"Walking Customer"
```
