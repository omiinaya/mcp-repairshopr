# RepairShopr API Documentation - Payment Profile

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Payment Profile

#### Get Customers

Returns a paginated list of Payment Profiles

**Endpoint:** `GET /customers/{customer_id}/payment_profiles`

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "payment_profiles": [
    {
      "id": 1,
      "customer_id": 1,
      "expiration": "MyString",
      "customer_external_id": null,
      "used_gateway": "authorize_net",
      "payment_profile_id": 1,
      "last_four": "MyString",
      "created_at": "2019-10-25T07:11:31.903Z",
      "updated_at": "2019-10-25T07:11:31.903Z"
    }
  ]
}
```

#### Create Customer

Creates a Payment Profile

**Endpoint:** `POST /customers/{customer_id}/payment_profiles`

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |

**Request Body:**

| Parameter            | Type   | Required | Description                                    |
| -------------------- | ------ | -------- | ---------------------------------------------- |
| customer_external_id | string | No       | Payment Gateway's Customer token               |
| payment_profile_id   | string | No       | Payment Gateway's stored payment profile token |
| expiration           | string | No       |                                                |
| last_four            | string | No       |                                                |

**Response: 200**

successful

```json
{
  "payment_profile": {
    "id": 1,
    "customer_id": 1,
    "expiration": "MyString",
    "customer_external_id": null,
    "used_gateway": "authorize_net",
    "payment_profile_id": 1,
    "last_four": "MyString",
    "created_at": "2019-10-25T07:11:31.903Z",
    "updated_at": "2019-10-25T07:11:31.903Z"
  }
}
```

**Response: 422**

Invalid request

```json
{
  "message": "Account not configured to use integrated processing."
}
```

#### Get Customer by ID

Retrieves a Payment Profile by ID

**Endpoint:** `GET /customers/{customer_id}/payment_profiles/{id}`

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |
| id          | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "payment_profile": {
    "id": 1,
    "customer_id": 1,
    "expiration": "MyString",
    "customer_external_id": null,
    "used_gateway": "authorize_net",
    "payment_profile_id": 1,
    "last_four": "MyString",
    "created_at": "2019-10-25T07:11:31.903Z",
    "updated_at": "2019-10-25T07:11:31.903Z"
  }
}
```

**Response: 404**

Invalid request

#### Update Customer

Updates a Payment Profile

**Endpoint:** `PUT /customers/{customer_id}/payment_profiles/{id}`

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |
| id          | integer | Yes      |             |

**Request Body:**

| Parameter  | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| expiration | string | No       |             |
| last_four  | string | No       |             |

**Response: 200**

successful

```json
{
  "payment_profile": {
    "id": 1,
    "customer_id": 1,
    "expiration": "MyString",
    "customer_external_id": null,
    "used_gateway": "authorize_net",
    "payment_profile_id": 1,
    "last_four": "MyString",
    "created_at": "2019-10-25T07:11:31.903Z",
    "updated_at": "2019-10-25T07:11:31.903Z"
  }
}
```

#### Delete Customer

Deletes a Payment Profile

**Endpoint:** `DELETE /customers/{customer_id}/payment_profiles/{id}`

**Path Parameters:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | Yes      |             |
| id          | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "success": true
}
```

**Response: 404**

Invalid request
