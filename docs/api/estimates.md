# RepairShopr API Documentation - Estimates

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

### Estimates

#### Get Estimates

Returns a paginated list of Estimates.

**Endpoint:** `GET /estimates`

**Required Permission:** Estimates - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mine | boolean | No | Returns estimates that belong to the current user |
| status | string | No | Returns estimates with a given status. Possible values are 'approved' and 'declined'. |
| page | integer | No | Returns provided page of results, each 'page' contains 50 results |

**Response: 200 OK**

```json
{
  "estimates": [
    {
      "id": 1,
      "customer_id": 1,
      "customer_business_then_name": "Walkin Customer",
      "name": "MyString",
      "number": "MyString",
      "status": "Fresh",
      "created_at": "2019-10-22T11:45:33.866Z",
      "updated_at": "2019-10-22T11:45:33.866Z",
      "date": "2013-10-08T14:16:10.000Z",
      "subtotal": "9.99",
      "total": "9.99",
      "tax": "9.99",
      "ticket_id": null,
      "pdf_url": null,
      "location_id": null,
      "invoice_id": null,
      "employee": "MyString"
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create Estimate

Creates an Estimate.

**Endpoint:** `POST /estimates`

**Required Permission:** Estimates - Create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No | Estimate number |
| name | string | No | Estimate name |
| date | string (date-time) | No | Estimate date |
| customer_id | integer | Yes | Customer ID |
| note | string | No | Estimate note |
| status | string | No | Valid values are Fresh, Draft, Approved, Declined. |
| ticket_id | integer | No | Ticket ID |
| location_id | integer | No | Location ID |
| line_items | array | No | Array of Line Items |
| created_at | string (date-time) | No | Created at timestamp |
| updated_at | string (date-time) | No | Updated at timestamp |

**Response: 200 OK**

```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "name": "MyString",
    "number": "MyString",
    "status": "Fresh",
    "created_at": "2019-10-22T11:45:33.866Z",
    "updated_at": "2019-10-22T11:45:33.866Z",
    "date": "2013-10-08T14:16:10.000Z",
    "subtotal": "9.99",
    "total": "9.99",
    "tax": "9.99",
    "ticket_id": null,
    "pdf_url": null,
    "location_id": null,
    "invoice_id": null,
    "employee": "MyString"
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "customer_id": [
    "can't be blank"
  ],
  "date": [
    "can't be blank"
  ]
}
```

#### Get Estimate by ID

Retrieves an Estimate by ID or number.

**Endpoint:** `GET /estimates/{id}`

**Required Permission:** Estimates - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No | Estimate number is used when the server cannot find an Estimate by ID |

**Response: 200 OK**

```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "name": "MyString",
    "number": "MyString",
    "status": "Fresh",
    "created_at": "2019-10-22T11:45:33.866Z",
    "updated_at": "2019-10-22T11:45:33.866Z",
    "date": "2013-10-08T14:16:10.000Z",
    "subtotal": "9.99",
    "total": "9.99",
    "tax": "9.99",
    "ticket_id": null,
    "pdf_url": null,
    "location_id": null,
    "invoice_id": null,
    "employee": "MyString"
  }
}
```

#### Update Estimate

Updates an existing Estimate by ID.

**Endpoint:** `PUT /estimates/{id}`

**Required Permission:** Estimates - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No | Estimate number |
| name | string | No | Estimate name |
| date | string (date-time) | No | Estimate date |
| customer_id | integer | No | Customer ID |
| note | string | No | Estimate note |
| status | string | No | Valid values are Fresh, Draft, Approved, Declined. |
| ticket_id | integer | No | Ticket ID |
| location_id | integer | No | Location ID |

**Response: 200 OK**

```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "name": "MyString",
    "number": "MyString",
    "status": "Fresh",
    "created_at": "2019-10-22T11:45:33.866Z",
    "updated_at": "2019-10-22T11:45:33.866Z",
    "date": "2013-10-08T14:16:10.000Z",
    "subtotal": "9.99",
    "total": "9.99",
    "tax": "9.99",
    "ticket_id": null,
    "pdf_url": null,
    "location_id": null,
    "invoice_id": null,
    "employee": "MyString"
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "date": [
    "can't be blank"
  ]
}
```

#### Delete Estimate

Deletes an Estimate by ID.

**Endpoint:** `DELETE /estimates/{id}`

**Required Permission:** Estimates - Delete

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Response: 200 OK**

```json
{
  "message": "1: We deleted # 123"
}
```

#### Print Estimate

Queues a print job for an Estimate.

**Endpoint:** `POST /estimates/{id}/print`

**Required Permission:** Estimates - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Response: 200 OK**

```json
{
  "message": "We queued up a print job"
}
```

#### Email Estimate

Sends an Estimate to a Customer.

**Endpoint:** `POST /estimates/{id}/email`

**Required Permission:** Estimates - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Response: 200 OK**

```json
{
  "message": "We queued up a print job"
}
```

#### Add Line Item to Estimate

Adds a Line Item to an Estimate.

**Endpoint:** `POST /estimates/{id}/line_items`

**Required Permission:** Estimates - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item | string | No | Item name |
| name | string | No | Name |
| product_id | integer | No | Product ID |
| quantity | integer | No | Quantity |

**Response: 200 OK**

```json
{
  "estimate": {
    "account_id": 1,
    "id": 11,
    "updated_at": "2019-10-25T11:31:02.793Z",
    "customer_id": 1,
    "employee": "MyString",
    "payment_type": "MyString",
    "number": "MyString",
    "labor": "9.99",
    "total": "0.0",
    "subtotal": "0.0",
    "tax": "0.0",
    "paid": false,
    "date": "2013-10-08T14:16:10.000Z",
    "status_date": "2013-10-08T14:16:10.000Z",
    "status_changed_by": null,
    "notax": false,
    "ticket_id": null,
    "note": "MyText",
    "category": "MyString",
    "hardwarecost": "0.0",
    "location_id": null,
    "pdf": {
      "url": null
    },
    "signature_data": "MyText",
    "signature_name": "MyString",
    "created_at": "2019-10-25T11:31:02.688Z",
    "invoice_id": null,
    "contact_id": null,
    "tax_rate_id": 1,
    "converted_at": null,
    "last_emailed": null,
    "status": "Fresh",
    "disabled": false,
    "signature_date": null,
    "multi_tax": null,
    "name": null
  },
  "line_item": {
    "id": 1,
    "created_at": "2019-10-25T11:31:02.763Z",
    "updated_at": "2019-10-25T11:31:02.763Z",
    "invoice_id": null,
    "item": "Manual Item",
    "name": "Item Name",
    "cost": "0.0",
    "price": "0.0",
    "quantity": "1.0",
    "product_id": null,
    "taxable": true,
    "discount_percent": null,
    "position": 1,
    "invoice_bundle_id": null,
    "discount_dollars": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "errors": "validation error: Item can't be blank"
}
```

#### Convert Estimate to Invoice

Convert an Estimate to an Invoice.

**Endpoint:** `POST /estimates/{id}/convert_to_invoice`

**Required permissions:** "Estimates - View Details" and "Invoices - Create"

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Response: 200 OK**

```json
{
  "invoice": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "number": "1001",
    "created_at": "2019-10-25T11:53:10.575Z",
    "updated_at": "2019-10-25T11:53:10.609Z",
    "date": "2019-10-25T00:00:00.000Z",
    "due_date": "2019-10-25T00:00:00.000Z",
    "subtotal": "0.0",
    "total": "0.0",
    "tax": "0.0",
    "verified_paid": false,
    "tech_marked_paid": false,
    "ticket_id": null,
    "pdf_url": null,
    "is_paid": false,
    "location_id": null,
    "po_number": null,
    "contact_id": null,
    "note": null,
    "hardwarecost": "0.0"
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "error": "Validation failed: Item can't be blank, Name can't be blank"
}
```

#### Update Estimate Line Item

Updates a Line Item.

**Endpoint:** `PUT /estimates/{id}/line_items/{line_item_id}`

**Required Permission:** Estimates - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |
| line_item_id | integer | Yes | Line Item ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item | string | No | Item name |
| name | string | No | Name |
| product_id | integer | No | Product ID |
| quantity | integer | No | Quantity |

**Response: 200 OK**

```json
{
  "line_item": {
    "id": 3,
    "created_at": "2019-10-25T12:43:19.817Z",
    "updated_at": "2019-10-25T12:43:19.839Z",
    "invoice_id": null,
    "item": "New Updated Item",
    "name": "Some big thingy",
    "cost": "10.0",
    "price": "64.99",
    "quantity": "1.0",
    "product_id": null,
    "taxable": true,
    "discount_percent": null,
    "position": 1,
    "invoice_bundle_id": null,
    "discount_dollars": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "item": [
    "can't be blank"
  ]
}
```

#### Delete Estimate Line Item

Deletes a Line Item.

**Endpoint:** `DELETE /estimates/{id}/line_items/{line_item_id}`

**Required Permission:** Estimates - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |
| line_item_id | integer | Yes | Line Item ID |

**Response: 200 OK**

```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "number": "MyString",
    "status": "Fresh",
    "created_at": "2019-10-22T11:45:33.866Z",
    "updated_at": "2019-10-22T11:45:33.866Z",
    "date": "2013-10-08T14:16:10.000Z",
    "subtotal": "9.99",
    "total": "9.99",
    "tax": "9.99",
    "ticket_id": null,
    "pdf_url": null,
    "location_id": null,
    "invoice_id": null,
    "employee": "MyString"
  }
}
```
