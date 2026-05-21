# RepairShopr API Documentation - Appointment Type

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Appointment Type

#### Get Appointment Types

Returns a paginated list of Appointment Types

Required permission: Global Admin

**Endpoint:** `GET /appointment_types`

**Required Permission:** Required permission: Global Admin

**Response: 200**

successful

```json
{
  "appointment_types": [
    {
      "id": 1,
      "account_id": 1,
      "name": "Office Hours",
      "email_instructions": "string",
      "location_type": "manual_entry",
      "location_hard_code": null,
      "created_at": "2019-10-16T19:29:33.397Z",
      "updated_at": "2019-10-16T19:29:33.397Z",
      "buffer": null,
      "appointment_reminders_schedule_id": null
    }
  ]
}
```

#### Create Appointment Type

Creates an Appointment Type

Required permission: Global Admin

**Endpoint:** `POST /appointment_types`

**Required Permission:** Required permission: Global Admin

**Request Body:**

| Parameter          | Type    | Required | Description |
| ------------------ | ------- | -------- | ----------- |
| name               | string  | Yes      |             |
| email_instructions | string  | No       |             |
| location_type      | integer | No       |             |
| location_hard_code | string  | No       |             |

**Response: 200**

successful

```json
{
  "appointment_type": {
    "id": 1,
    "account_id": 1,
    "name": "Office Hours",
    "email_instructions": "string",
    "location_type": "manual_entry",
    "location_hard_code": null,
    "created_at": "2019-10-16T19:29:33.397Z",
    "updated_at": "2019-10-16T19:29:33.397Z",
    "buffer": null,
    "appointment_reminders_schedule_id": null
  }
}
```

**Response: 422**

Invalid request

```json
{
  "record": {
    "id": null,
    "account_id": 1,
    "name": "",
    "email_instructions": null,
    "location_type": null,
    "location_hard_code": null,
    "created_at": null,
    "updated_at": null,
    "buffer": null,
    "appointment_reminders_schedule_id": null
  },
  "errors": "Name can't be blank,Location type can't be blank"
}
```

#### Get Appointment Type by ID

Retrieves an Appointment Type by ID

Required permission: Global Admin

**Endpoint:** `GET /appointment_types/{id}`

**Required Permission:** Required permission: Global Admin

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "id": 1,
  "account_id": 1,
  "name": "Office Hours",
  "email_instructions": "string",
  "location_type": "manual_entry",
  "location_hard_code": null,
  "created_at": "2019-10-16T19:29:33.397Z",
  "updated_at": "2019-10-16T19:29:33.397Z",
  "buffer": null,
  "appointment_reminders_schedule_id": null
}
```

**Response: 404**

Invalid request

#### Update Appointment Type

Updates an existing Appointment Type by ID

Required permission: Global Admin

**Endpoint:** `PUT /appointment_types/{id}`

**Required Permission:** Required permission: Global Admin

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

| Parameter          | Type    | Required | Description |
| ------------------ | ------- | -------- | ----------- |
| name               | string  | No       |             |
| email_instructions | string  | No       |             |
| location_type      | integer | No       |             |
| location_hard_code | string  | No       |             |

**Response: 200**

successful

**Response: 422**

Invalid request

#### Delete Appointment Type

Deletes an Appointment Type by ID

Required permission: Global Admin

**Endpoint:** `DELETE /appointment_types/{id}`

**Required Permission:** Required permission: Global Admin

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

**Response: 404**

Invalid request
