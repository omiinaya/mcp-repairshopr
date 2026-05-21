# RepairShopr API Documentation - Wiki Page

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Wiki Page

#### Get Wiki Pages

Returns a paginated list of Wiki Pages

Required permission: Documentation - Allow Usage

**Endpoint:** `GET /wiki_pages`

**Required Permission:** Required permission: Documentation - Allow Usage

**Query Parameters:**

| Parameter | Type    | Required | Description                                                       |
| --------- | ------- | -------- | ----------------------------------------------------------------- |
| page      | integer | No       | Returns provided page of results, each 'page' contains 100 result |

**Response: 200**

successful

```json
{
  "wiki_pages": [
    {
      "id": 1,
      "account_id": 1,
      "name": "API Doc",
      "slug": "api-doc",
      "body": "a sample body",
      "interpolated_body": "a sample body"
    }
  ]
}
```

#### Create Wiki Page

Creates a Wiki Page

Required permission: Documentation - Create

**Endpoint:** `POST /wiki_pages`

**Required Permission:** Required permission: Documentation - Create

**Request Body:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| name        | string  | No       |             |
| slug        | string  | No       |             |
| body        | string  | No       |             |
| customer_id | integer | No       |             |
| asset_id    | integer | No       |             |
| visibility  | string  | No       |             |

**Response: 200**

successful

```json
{
  "wiki_page": {
    "id": 1,
    "account_id": 1,
    "name": "API Doc",
    "slug": "api-doc",
    "body": "a sample body",
    "interpolated_body": "a sample body"
  }
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "errors": ["Body can't be blank", "Name can't be blank"],
  "params": {
    "name": ""
  }
}
```

#### Get Wiki Page by ID

Retrieves a Wiki Page

Required permission: Documentation - Allow Usage

**Endpoint:** `GET /wiki_pages/{id}`

**Required Permission:** Required permission: Documentation - Allow Usage

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "wiki_page": {
    "id": 0,
    "account_id": 0,
    "name": "string",
    "slug": "string",
    "body": "string",
    "interpolated_body": "string"
  }
}
```

**Response: 404**

Invalid request

#### Update Wiki Page

Updates an existing Wiki Page by ID

Required permission: Documentation - Edit

**Endpoint:** `PUT /wiki_pages/{id}`

**Required Permission:** Required permission: Documentation - Edit

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| name        | string  | No       |             |
| slug        | string  | No       |             |
| body        | string  | No       |             |
| customer_id | integer | No       |             |
| asset_id    | integer | No       |             |
| visibility  | string  | No       |             |

**Response: 200**

successful

```json
{
  "wiki_page": {
    "id": 1,
    "account_id": 1,
    "name": "API Doc",
    "slug": "api-doc",
    "body": "a sample body",
    "interpolated_body": "a sample body"
  }
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "errors": ["Name can't be blank"],
  "params": {
    "name": ""
  }
}
```

#### Delete Wiki Page

Deletes a Wiki Page by ID

Required permission: Documentation - Delete

**Endpoint:** `DELETE /wiki_pages/{id}`

**Required Permission:** Required permission: Documentation - Delete

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

**Response: 404**

Invalid request
