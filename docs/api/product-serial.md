# RepairShopr API Documentation - Product Serial

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Product Serial

#### Get Products

Returns a paginated list of Product_serials

Required permission: Products - List/Search

**Endpoint:** `GET /products/{product_id}/product_serials`

**Required Permission:** Required permission: Products - List/Search

**Path Parameters:**

| Parameter  | Type    | Required | Description                                                                                   |
| ---------- | ------- | -------- | --------------------------------------------------------------------------------------------- |
| product_id | integer | Yes      |                                                                                               |
| status     | string  | No       | Possible values are reserved, sold, returned, in_transfer, breakage, used_in_refurb, in_stock |
| page       | integer | No       | Returns provided page of results, each 'page' contains 100 result                             |

**Response: 200**

successful

```json
{
  "product_serials": [
    {
      "id": 0,
      "created_at": "string",
      "updated_at": "string",
      "product_location_quantity_id": 0,
      "line_item_id": 0,
      "serial_number": "string",
      "status": "string",
      "instance_price_cost": 0.0,
      "instance_price_retail": 0.0,
      "location_id": 0
    }
  ]
}
```

#### Create Product

Creates a Product Serial

Required permission: Products - Edit

**Endpoint:** `POST /products/{product_id}/product_serials`

**Required Permission:** Required permission: Products - Edit

**Path Parameters:**

| Parameter  | Type    | Required | Description |
| ---------- | ------- | -------- | ----------- |
| product_id | integer | Yes      |             |

**Request Body:**

| Parameter          | Type    | Required | Description |
| ------------------ | ------- | -------- | ----------- |
| condition          | string  | No       |             |
| price_cost_cents   | integer | No       |             |
| price_retail_cents | integer | No       |             |
| serial_number      | string  | No       |             |

**Response: 200**

successful

```json
{
  "product_serial": {
    "id": 1,
    "created_at": "2019-10-24T07:32:07.656Z",
    "updated_at": "2019-10-24T07:32:07.656Z",
    "product_location_quantity_id": null,
    "line_item_id": null,
    "serial_number": "abcde345332z1",
    "status": "In Stock",
    "instance_price_cost": 0.01,
    "instance_price_retail": 0.01,
    "location_id": null
  }
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": [
    "Serial number scientific-notation not allowed, may have been introduced by a spreadsheet program inferring Numerical from a csv."
  ]
}
```

#### Update Product

Updates an existing Product Serial by ID

Required permission: Products - Edit

**Endpoint:** `PUT /products/{product_id}/product_serials/{id}`

**Required Permission:** Required permission: Products - Edit

**Path Parameters:**

| Parameter  | Type    | Required | Description |
| ---------- | ------- | -------- | ----------- |
| product_id | integer | Yes      |             |
| id         | integer | Yes      |             |

**Request Body:**

| Parameter          | Type    | Required | Description |
| ------------------ | ------- | -------- | ----------- |
| condition          | string  | No       |             |
| price_cost_cents   | integer | No       |             |
| price_retail_cents | integer | No       |             |
| serial_number      | string  | No       |             |
| notes              | string  | No       |             |

**Response: 200**

successful

```json
{
  "product_serial": {
    "id": 1,
    "created_at": "2019-10-24T07:32:07.656Z",
    "updated_at": "2019-10-24T07:32:07.656Z",
    "product_location_quantity_id": null,
    "line_item_id": null,
    "serial_number": "abcde345332z1",
    "status": "In Stock",
    "instance_price_cost": 0.01,
    "instance_price_retail": 0.01,
    "location_id": null
  }
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Serial number has already been taken"]
}
```

#### Create Product

Adds Product Serials to a Line Item

Required permission: Products - List/Search
Additional permissions required depending on "record_type":

- LineItem: "Invoices - Edit" or "Estimates - Edit"
- TicketLineItem: Tickets - Edit

**Endpoint:** `POST /products/{product_id}/product_serials/attach_to_line_item`

**Required Permission:** Required permission: Products - List/Search

**Path Parameters:**

| Parameter  | Type    | Required | Description |
| ---------- | ------- | -------- | ----------- |
| product_id | integer | Yes      |             |

**Request Body:**

| Parameter          | Type    | Required | Description |
| ------------------ | ------- | -------- | ----------- |
| record_type        | string  | No       |             |
| line_item_id       | integer | No       |             |
| product_serial_ids | array   | No       |             |

**Response: 200**

successful

```json
{
  "status": "attached"
}
```

**Response: 422**

Invalid request

```json
{
  "status": "attached",
  "errors": "One of the serial numbers has already been used. Please try again."
}
```
