# RepairShopr API Documentation - Timelog

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Timelog

#### Get Timelogs

Returns a paginated list of Timelogs

Users with permission "Timelogs - Manage" may see timelogs for any/all users.
Otherwise, results scoped to current user.

**Endpoint:** `GET /timelogs`

**Required Permission:** Users with permission "Timelogs - Manage" may see timelogs for any/all users.

**Query Parameters:**

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| user_id   | integer | No       | Returns Timelogs that belong to a User |

**Response: 200**

successful

```json
{
  "timelogs": [
    {
      "id": 1,
      "in_at": "2019-11-01T12:50:26.882Z",
      "out_at": null,
      "account_id": 1,
      "user_id": 1,
      "in_note": null,
      "out_note": null,
      "created_at": "2019-11-01T12:50:26.934Z",
      "updated_at": "2019-11-01T12:50:26.934Z",
      "lunch": null,
      "manually_updated": null
    }
  ]
}
```

#### Update Timelog

Updates a Timelog

Users with permission "Timelogs - Manage" may see timelogs for any/all users.
Otherwise, results scoped to current user.

**Endpoint:** `PUT /timelogs`

**Required Permission:** Users with permission "Timelogs - Manage" may see timelogs for any/all users.

**Request Body:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| lunch     | boolean | No       |             |
| in_at     | string  | No       |             |
| out_at    | string  | No       |             |
| in_note   | string  | No       |             |
| out_note  | string  | No       |             |

**Response: 200**

successful

```json
{
  "id": 1,
  "in_at": "2019-11-01T12:50:26.882Z",
  "out_at": null,
  "account_id": 1,
  "user_id": 1,
  "in_note": null,
  "out_note": null,
  "created_at": "2019-11-01T12:50:26.934Z",
  "updated_at": "2019-11-01T12:50:26.934Z",
  "lunch": null,
  "manually_updated": null
}
```

#### Get Lasts

Returns last Timelog

Users with permission "Timelogs - Manage" may see timelogs for any/all users.
Otherwise, results scoped to current user.

**Endpoint:** `GET /timelogs/last`

**Required Permission:** Users with permission "Timelogs - Manage" may see timelogs for any/all users.

**Query Parameters:**

| Parameter | Type    | Required | Description                                                             |
| --------- | ------- | -------- | ----------------------------------------------------------------------- |
| user_id   | integer | No       | Returns Timelogs that belong to a User. The default is current user ID. |

**Response: 200**

successful

```json
{
  "id": 1,
  "in_at": "2019-11-01T12:50:26.882Z",
  "out_at": null,
  "account_id": 1,
  "user_id": 1,
  "in_note": null,
  "out_note": null,
  "created_at": "2019-11-01T12:50:26.934Z",
  "updated_at": "2019-11-01T12:50:26.934Z",
  "lunch": null,
  "manually_updated": null
}
```
