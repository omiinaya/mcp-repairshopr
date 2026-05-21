# RepairShopr API Documentation - Phone

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Phone

#### Get Customers

Returns a paginated list of Phones

Required permission: Customers - View Detail
Single-Customer Users can only access own.

**Endpoint:** `GET /customers/{customer_id}/phones`

**Required Permission:** Required permission: Customers - View Detail

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "phones": [
    {
      "id": 2,
      "label": "Mobile",
      "number": "111222333",
      "customer_id": 1,
      "created_at": "2019-10-28T15:07:49.764Z",
      "updated_at": "2019-10-28T15:07:49.764Z",
      "extension": null
    },
    {
      "id": 1,
      "label": "Phone",
      "number": "123",
      "customer_id": 1,
      "created_at": "2019-10-28T15:07:32.225Z",
      "updated_at": "2019-10-28T15:07:32.225Z",
      "extension": null
    }
  ]
}
```

#### Create Customer

Creates a Phone

Required permission: Customers - Edit
Single-Customer Users can only access own.

**Endpoint:** `POST /customers/{customer_id}/phones`

**Required Permission:** Required permission: Customers - Edit

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |

**Request Body:**

**Response: 200**

successful

```json
{
  "id": 4,
  "label": null,
  "number": "222000222",
  "customer_id": 1,
  "created_at": "2019-10-28T15:07:50.138Z",
  "updated_at": "2019-10-28T15:07:50.138Z",
  "extension": null
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Number can't be blank"],
  "params": {
    "customer_id": "1",
    "number": ""
  }
}
```

#### Update Customer

Updates an existing Phone by ID

Required permission: Customers - Edit
Single-Customer Users can only access own.

**Endpoint:** `PUT /customers/{customer_id}/phones/{id}`

**Required Permission:** Required permission: Customers - Edit

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |
| id          | integer | Yes      |             |

**Request Body:**

**Response: 200**

successful

```json
{
  "id": 4,
  "label": null,
  "number": "222000222",
  "customer_id": 1,
  "created_at": "2019-10-28T15:07:50.138Z",
  "updated_at": "2019-10-28T15:07:50.138Z",
  "extension": null
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Number can't be blank"],
  "params": {
    "customer_id": "1",
    "id": "9",
    "number": ""
  }
}
```

#### Delete Customer

Deletes a Phone by ID

Required permission: Customers - Edit
Single-Customer Users can only access own.

**Endpoint:** `DELETE /customers/{customer_id}/phones/{id}`

**Required Permission:** Required permission: Customers - Edit

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |
| id          | integer | Yes      |             |

**Response: 200**

successful

**Response: 404**

Invalid request
