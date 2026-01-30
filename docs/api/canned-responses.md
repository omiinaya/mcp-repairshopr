# RepairShopr API Documentation - Canned Responses

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

### Canned Responses

#### Get Canned Responses

Returns a list of Canned Responses with a query.

**Endpoint:** `GET /canned_responses`

**Required Permission:** Ticket Canned Responses - Manage

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query |

**Response: 200 OK**

```json
{
  "canned_responses": [
    {
      "id": 1,
      "title": "Test Canned Response",
      "body": "This is a test canned response",
      "subject": "Test Subject",
      "canned_response_category_id": 1,
      "category_name": "Test Category"
    }
  ]
}
```

#### Create Canned Response

Creates a new Canned Response.

**Endpoint:** `POST /canned_responses`

**Required Permission:** Ticket Canned Responses - Manage

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Canned response title |
| body | string | Yes | Canned response body |
| subject | string | No | Email subject |
| canned_response_category_id | integer | No | Category ID |

**Response: 201 Created**

#### Update Canned Response

Updates a Canned Response.

**Endpoint:** `PATCH /canned_responses/{id}`

**Required Permission:** Ticket Canned Responses - Manage

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Canned Response ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | No | Canned response title |
| body | string | No | Canned response body |
| subject | string | No | Email subject |
| canned_response_category_id | integer | No | Category ID |

**Response: 200 OK**

#### Delete Canned Response

Deletes a Canned Response.

**Endpoint:** `DELETE /canned_responses/{id}`

**Required Permission:** Ticket Canned Responses - Manage

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Canned Response ID |

**Response: 204 No Content**

#### Get Canned Response Settings

Returns the settings for Canned Responses.

**Endpoint:** `GET /canned_responses/settings`

**Required Permission:** Ticket Canned Responses - Manage  
Single-Customer Users can only access own canned responses.

**Response: 200 OK**

```json
{
  "canned_response_categories": [
    {
      "id": 1,
      "name": "Test Category"
    }
  ],
  "subjects": [
    "Test Subject",
    "Test Subject 2"
  ],
  "can_manage": true
}
```
