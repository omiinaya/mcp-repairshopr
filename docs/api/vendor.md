# RepairShopr API Documentation - Vendor

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Vendor

#### Get Vendors

Returns a paginated list of Vendors

Required permission: Vendors - List

**Endpoint:** `GET /vendors`

**Required Permission:** Required permission: Vendors - List

**Query Parameters:**

| Parameter | Type    | Required | Description                                                       |
| --------- | ------- | -------- | ----------------------------------------------------------------- |
| page      | integer | No       | Returns provided page of results, each 'page' contains 100 result |

**Response: 200**

successful

```json
{
  "vendors": [
    {
      "id": 1,
      "name": "Vendor Name",
      "rep_first_name": "Bill",
      "rep_last_name": "Sales",
      "email": "info@candswholes.com",
      "phone": "603-344-5555",
      "account_number": null,
      "created_at": "2019-11-05T16:11:12.409Z",
      "updated_at": "2019-11-05T16:11:12.409Z",
      "address": "44 Billings Circle",
      "city": "Keene",
      "state": "NH",
      "zip": "03455",
      "website": "www.candswholes.com",
      "notes": "White label trucks"
    }
  ]
}
```

#### Create Vendor

Creates a Vendor

Required permission: Vendors - New

**Endpoint:** `POST /vendors`

**Required Permission:** Required permission: Vendors - New

**Request Body:**

**Response: 200**

successful

```json
{
  "vendor": {
    "id": 1,
    "name": "Vendor Name",
    "rep_first_name": "Bill",
    "rep_last_name": "Sales",
    "email": "info@candswholes.com",
    "phone": "603-344-5555",
    "account_number": null,
    "created_at": "2019-11-05T16:11:12.409Z",
    "updated_at": "2019-11-05T16:11:12.409Z",
    "address": "44 Billings Circle",
    "city": "Keene",
    "state": "NH",
    "zip": "03455",
    "website": "www.candswholes.com",
    "notes": "White label trucks"
  }
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Email is not an email"],
  "params": {
    "name": "Vendor1",
    "email": "broken_emailmail.com"
  }
}
```

#### Get Vendor by ID

Retrieves a Vendor Page

Required permission: Vendors - View Details

**Endpoint:** `GET /vendors/{id}`

**Required Permission:** Required permission: Vendors - View Details

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "vendor": {
    "id": 0,
    "name": "string",
    "rep_first_name": "string",
    "rep_last_name": "string",
    "email": "string",
    "phone": "string",
    "account_number": "string",
    "created_at": "string",
    "updated_at": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "website": "string",
    "notes": "string"
  }
}
```

**Response: 404**

Invalid request

#### Update Vendor

Updates an existing Vendor page by ID

Required permission: Vendors - Edit

**Endpoint:** `PUT /vendors/{id}`

**Required Permission:** Required permission: Vendors - Edit

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

**Response: 200**

successful

```json
{
  "vendor": {
    "id": 7,
    "name": "New name",
    "rep_first_name": "Bill",
    "rep_last_name": "Sales",
    "email": "info@candswholes.com",
    "phone": "603-344-5555",
    "account_number": null,
    "created_at": "2019-11-06T08:52:42.139Z",
    "updated_at": "2019-11-06T08:52:42.169Z",
    "address": "44 Billings Circle",
    "city": "Keene",
    "state": "NH",
    "zip": "03455",
    "website": "www.candswholes.com",
    "notes": "White label trucks"
  }
}
```

**Response: 404**

Not found

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Email is not an email"]
}
```
