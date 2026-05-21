# RepairShopr API Documentation - Portal User

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Portal User

#### Get Portal Users

Returns a paginated list of Portal Users

Required permission: Global Admin

**Endpoint:** `GET /portal_users`

**Required Permission:** Required permission: Global Admin

**Query Parameters:**

| Parameter   | Type    | Required | Description                                                        |
| ----------- | ------- | -------- | ------------------------------------------------------------------ |
| customer_id | integer | No       | Returns Portal Users that belong to a Customer ID                  |
| email       | string  | No       | Portal User email                                                  |
| page        | integer | No       | Returns provided page of results, each 'page' contains 100 results |

**Response: 200**

successful

```json
{
  "portal_users": [
    {
      "id": 1,
      "email": "katelyn@okuneva.name",
      "account_id": 1,
      "customer_id": 1,
      "contact_id": 1,
      "created_at": "2019-10-25T13:36:47.165Z",
      "updated_at": "2019-10-25T13:36:47.165Z",
      "portal_group_id": 4
    }
  ],
  "meta": {
    "total_pages": 1,
    "total_entries": 1,
    "per_page": 100,
    "page": 1
  }
}
```

#### Create Portal User

Creates a Portal User

Required permission: Global Admin

**Endpoint:** `POST /portal_users`

**Required Permission:** Required permission: Global Admin

**Request Body:**

**Response: 200**

successful

```json
{
  "id": 1,
  "email": "katelyn@okuneva.name",
  "account_id": 1,
  "customer_id": 1,
  "contact_id": 1,
  "created_at": "2019-10-25T13:36:47.165Z",
  "updated_at": "2019-10-25T13:36:47.165Z",
  "portal_group_id": 4
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": [
    "Email can't be blank",
    "Password confirmation doesn't match Password"
  ],
  "params": {
    "customer_id": 1,
    "password": "does not match",
    "password_confirmation": "confirmation"
  }
}
```

#### Update Portal User

Updates an existing Portal User by ID

Required permission: Global Admin

**Endpoint:** `PUT /portal_users/{id}`

**Required Permission:** Required permission: Global Admin

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

**Response: 200**

successful

```json
{
  "id": 1,
  "email": "katelyn@okuneva.name",
  "account_id": 1,
  "customer_id": 1,
  "contact_id": 1,
  "created_at": "2019-10-25T13:36:47.165Z",
  "updated_at": "2019-10-25T13:36:47.165Z",
  "portal_group_id": 4
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Password confirmation doesn't match Password"],
  "params": {
    "password": "does not match",
    "password_confirmation": "the confirmation"
  }
}
```

#### Delete Portal User

Deletes a Portal User by ID

Required permission: Global Admin

**Endpoint:** `DELETE /portal_users/{id}`

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
  "email": "katelyn@okuneva.name",
  "account_id": 1,
  "customer_id": 1,
  "contact_id": 1,
  "created_at": "2019-10-25T13:36:47.165Z",
  "updated_at": "2019-10-25T13:36:47.165Z",
  "portal_group_id": 4
}
```

**Response: 404**

Invalid request

#### Create Create Invitation

Creates an Invitation for a Portal User

Required permission: Global Admin

**Endpoint:** `POST /portal_users/create_invitation`

**Required Permission:** Required permission: Global Admin

**Request Body:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | No       |             |

**Response: 200**

successful

```json
{
  "success": true,
  "message": "All set, we BCC'd you on that invitation."
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": "Invalid email, correct the contact's email and try to resend."
}
```
