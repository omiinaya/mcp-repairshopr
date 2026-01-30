# RepairShopr API Documentation - Appointment Types

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

### Appointment Types

#### Get Appointment Types

Returns a paginated list of Appointment Types.

**Endpoint:** `GET /appointment_types`

**Required Permission:** Global Admin

**Response: 200 OK**

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

Creates an Appointment Type.

**Endpoint:** `POST /appointment_types`

**Required Permission:** Global Admin

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Appointment type name |
| email_instructions | string | No | Email instructions |
| location_type | integer | No | Location type |
| location_hard_code | string | No | Hard-coded location |

**Response: 200 OK**

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

**Response: 422 Unprocessable Entity**

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

Retrieves an Appointment Type by ID.

**Endpoint:** `GET /appointment_types/{id}`

**Required Permission:** Global Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment Type ID |

**Response: 200 OK**

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

**Response: 404 Not Found**

#### Update Appointment Type

Updates an existing Appointment Type by ID.

**Endpoint:** `PUT /appointment_types/{id}`

**Required Permission:** Global Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment Type ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Appointment type name |
| email_instructions | string | No | Email instructions |
| location_type | integer | No | Location type |
| location_hard_code | string | No | Hard-coded location |

**Response: 200 OK**

**Response: 422 Unprocessable Entity**

#### Delete Appointment Type

Deletes an Appointment Type by ID.

**Endpoint:** `DELETE /appointment_types/{id}`

**Required Permission:** Global Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment Type ID |

**Response: 200 OK**

**Response: 404 Not Found**
