# RepairShopr API Documentation - Estimate

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Estimate

#### Get Estimates


Returns a paginated list of Estimates


Required permission: Estimates - List/Search



**Endpoint:** `GET /estimates`


**Required Permission:** Required permission: Estimates - List/Search


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mine | boolean | No | Returns estimates that belong to the current user |
| status | string | No | Returns estimates with a given status. Possible values are 'approved' and 'declined'. |
| page | integer | No | Returns provided page of results, each 'page' contains 50 results |


**Response: 200**


successful


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


Creates an Estimate


Required permission: Estimates - Create



**Endpoint:** `POST /estimates`


**Required Permission:** Required permission: Estimates - Create


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No |  |
| name | string | No |  |
| date | string | No |  |
| customer_id | integer | No |  |
| note | string | No |  |
| status | string | No | Valid values are Fresh, Draft, Approved, Declined. |
| ticket_id | integer | No |  |
| location_id | integer | No |  |
| line_items | array | No | Array of Line Items. |
| created_at | string | No |  |
| updated_at | string | No |  |



**Response: 200**


successful


```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "name": "MyString",
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


**Response: 422**


Invalid request


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


Retrieves an Estimate by ID or number


Required permission: Estimates - View Details



**Endpoint:** `GET /estimates/{id}`


**Required Permission:** Required permission: Estimates - View Details


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |
| number | string | No | Estimate number is used when the server cannot find an Estimate by ID |


**Response: 200**


successful


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


Updates an existing Estimate by ID


Required permission: Estimates - Edit



**Endpoint:** `PUT /estimates/{id}`


**Required Permission:** Required permission: Estimates - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No |  |
| name | string | No |  |
| date | string | No |  |
| customer_id | integer | No |  |
| note | string | No |  |
| status | string | No | Valid values are Fresh, Draft, Approved, Declined. |
| ticket_id | integer | No |  |
| location_id | integer | No |  |



**Response: 200**


successful


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


**Response: 422**


Invalid request


```json
{
  "date": [
    "can't be blank"
  ]
}
```


#### Delete Estimate


Deletes an Estimate by ID


Required permission: Estimates - Delete



**Endpoint:** `DELETE /estimates/{id}`


**Required Permission:** Required permission: Estimates - Delete


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "message": "1: We deleted # 123"
}
```


#### Create Estimate


Queues a print job for an Estimate


Required permission: Estimates - View Details



**Endpoint:** `POST /estimates/{id}/print`


**Required Permission:** Required permission: Estimates - View Details


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "message": "We queued up a print job"
}
```


#### Create Estimate


Sends an Estimate to a Customer


Required permission: Estimates - View Details



**Endpoint:** `POST /estimates/{id}/email`


**Required Permission:** Required permission: Estimates - View Details


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "message": "We queued up a print job"
}
```


#### Create Estimate


Adds a Line Item to an Estimate


Required permission: Estimates - Edit



**Endpoint:** `POST /estimates/{id}/line_items`


**Required Permission:** Required permission: Estimates - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


**Response: 200**


successful


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


**Response: 422**


Invalid request


```json
{
  "errors": "validation error: Item can't be blank"
}
```


#### Create Estimate


Convert an Estimate to an Invoice


Required permissions: "Estimates - View Details" and "Invoices - Create"



**Endpoint:** `POST /estimates/{id}/convert_to_invoice`


**Required Permission:** Required permissions: "Estimates - View Details" and "Invoices - Create"


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


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


**Response: 422**


Invalid request


```json
{
  "error": "Validation failed: Item can't be blank, Name can't be blank"
}
```


#### Update Estimate


Updates a Line Item


Required permission: Estimates - Edit



**Endpoint:** `PUT /estimates/{id}/line_items/{line_item_id}`


**Required Permission:** Required permission: Estimates - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
| line_item_id | integer | Yes |  |


**Request Body:**


**Response: 200**


successful


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


**Response: 422**


Invalid request


```json
{
  "item": [
    "can't be blank"
  ]
}
```


#### Delete Estimate


Deletes a Line Item


Required permission: Estimates - Edit



**Endpoint:** `DELETE /estimates/{id}/line_items/{line_item_id}`


**Required Permission:** Required permission: Estimates - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
| line_item_id | integer | Yes |  |


**Response: 200**


successful


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

