# RepairShopr API Documentation - Call

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Call

#### Get Callerids

Get Caller ID

**Endpoint:** `GET /callerid`

**Query Parameters:**

| Parameter | Type    | Required | Description  |
| --------- | ------- | -------- | ------------ |
| did       | string  | Yes      | Phone number |
| outbound  | boolean | No       |              |

**Response: 200**

successful

```json
{
  "data": {
    "name": "Walking Customer",
    "ticket_status": "Open"
  }
}
```
