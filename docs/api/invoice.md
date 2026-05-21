# RepairShopr API Documentation - Invoice

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Invoice

#### Get Invoices

Returns a paginated list of Invoices

Required permission: Invoices - List/Search

**Endpoint:** `GET /invoices`

**Required Permission:** Required permission: Invoices - List/Search

**Query Parameters:**

| Parameter        | Type    | Required | Description                                                            |
| ---------------- | ------- | -------- | ---------------------------------------------------------------------- |
| paid             | boolean | No       | Whether or not the returned list of invoices has been marked as paid   |
| unpaid           | boolean | No       | Whether or not the returned list of invoices has been marked as unpaid |
| ticket_id        | integer | No       | Any invoices attached to a Ticket ID                                   |
| since_updated_at | string  | No       | Any invoices updated since a date                                      |
| page             | integer | No       | Returns provided page of results, each 'page' contains 25 results      |

**Response: 200**

Invoices found

```json
{
  "invoices": [
    {
      "id": 6,
      "customer_id": 2,
      "customer_business_then_name": "Wonk Donk",
      "number": "4444",
      "created_at": "2019-11-06T08:24:20.821Z",
      "updated_at": "2019-11-06T08:24:20.821Z",
      "date": "2019-11-06T00:00:00.000Z",
      "due_date": "2019-11-06T00:00:00.000Z",
      "subtotal": "0.0",
      "total": "0.0",
      "tax": "0.0",
      "verified_paid": false,
      "tech_marked_paid": false,
      "ticket_id": 1,
      "pdf_url": null,
      "is_paid": false,
      "location_id": null,
      "po_number": null,
      "contact_id": null,
      "note": null,
      "hardwarecost": null,
      "user_id": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create Invoice

Creates an Invoice

Required permission: Invoices - Create

**Endpoint:** `POST /invoices`

**Required Permission:** Required permission: Invoices - Create

**Request Body:**

| Parameter                   | Type    | Required | Description |
| --------------------------- | ------- | -------- | ----------- |
| id                          | integer | No       |             |
| balance_due                 | integer | No       |             |
| customer_id                 | integer | Yes      |             |
| number                      | string  | Yes      |             |
| date                        | string  | Yes      |             |
| customer_business_then_name | string  | No       |             |
| created_at                  | string  | No       |             |
| updated_at                  | string  | No       |             |
| due_date                    | string  | No       |             |
| subtotal                    | string  | No       |             |
| total                       | string  | No       |             |
| tax                         | string  | No       |             |
| verified_paid               | boolean | No       |             |
| tech_marked_paid            | boolean | No       |             |
| ticket_id                   | integer | No       |             |
| pdf_url                     | string  | No       |             |
| is_paid                     | boolean | No       |             |
| location_id                 | integer | No       |             |
| po_number                   | string  | No       |             |
| contact_id                  | integer | No       |             |
| note                        | string  | No       |             |
| hardwarecost                | number  | No       |             |
| line_items                  | array   | No       |             |

**Response: 200**

Invoice created

```json
{
  "invoice": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "number": "9999",
    "created_at": "2019-06-19T07:45:43.345Z",
    "updated_at": "2019-06-19T07:45:43.345Z",
    "date": "2019-06-19T00:00:00.000Z",
    "due_date": "2019-06-19T00:00:00.000Z",
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
    "hardwarecost": null,
    "user_id": 1
  }
}
```

**Response: 422**

Invalid request

#### Get Invoice by ID

Retrieves an Invoice by ID or Number

Required permission: Invoices - View Details

**Endpoint:** `GET /invoices/{id}`

**Required Permission:** Required permission: Invoices - View Details

**Path Parameters:**

| Parameter | Type    | Required | Description                         |
| --------- | ------- | -------- | ----------------------------------- |
| id        | integer | Yes      | ID or Number of Invoice to retrieve |

**Response: 200**

Invoice found

```json
{
  "id": 0,
  "number": "string",
  "date": "string",
  "date_received": "string",
  "customer_business_then_name": "string",
  "created_at": "string",
  "updated_at": "string",
  "due_date": "string",
  "subtotal": "string",
  "total": "string",
  "tax": "string",
  "verified_paid": true,
  "tech_marked_paid": true,
  "ticket_id": 0,
  "pdf_url": "string",
  "is_paid": true,
  "location_id": 0,
  "po_number": "string",
  "contact_id": 0,
  "note": "string",
  "hardwarecost": 0.0,
  "user_id": 0,
  "customer": {
    "id": 0,
    "firstname": "string",
    "lastname": "string",
    "fullname": "string",
    "business_name": "string",
    "email": "string",
    "phone": "string",
    "mobile": "string",
    "created_at": "string",
    "updated_at": "string",
    "pdf_url": "string",
    "address": "string",
    "address_2": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "latitude": "string",
    "longitude": "string",
    "notes": "string",
    "get_sms": true,
    "opt_out": true,
    "disabled": true,
    "no_email": true,
    "location_name": "string",
    "location_id": 0,
    "properties": {},
    "online_profile_url": "string",
    "tax_rate_id": 0,
    "notification_email": "string",
    "invoice_cc_emails": "string",
    "invoice_term_id": 0,
    "referred_by": "string",
    "ref_customer_id": 0,
    "business_and_full_name": "string",
    "business_then_name": "string",
    "contacts": [
      {
        "email": "string"
      }
    ]
  },
  "line_items": [
    {
      "item": "string",
      "name": "string"
    }
  ],
  "payments": [
    {
      "id": 0
    }
  ]
}
```

**Response: 404**

Invalid request

#### Update Invoice

Updates an existing invoice by ID

This updates an existing Invoice, all parameters overwrite existing params

**Endpoint:** `PUT /invoices/{id}`

**Path Parameters:**

| Parameter | Type    | Required | Description             |
| --------- | ------- | -------- | ----------------------- |
| id        | integer | Yes      | ID of Invoice to update |

**Request Body:**

| Parameter                   | Type    | Required | Description |
| --------------------------- | ------- | -------- | ----------- |
| customer_id                 | integer | No       |             |
| number                      | string  | No       |             |
| date                        | string  | No       |             |
| customer_business_then_name | string  | No       |             |
| created_at                  | string  | No       |             |
| updated_at                  | string  | No       |             |
| due_date                    | string  | No       |             |
| subtotal                    | string  | No       |             |
| total                       | string  | No       |             |
| tax                         | string  | No       |             |
| ticket_id                   | integer | No       |             |
| pdf_url                     | string  | No       |             |
| location_id                 | integer | No       |             |
| po_number                   | string  | No       |             |
| contact_id                  | integer | No       |             |
| note                        | string  | No       |             |
| hardwarecost                | number  | No       |             |

**Response: 200**

Invoice Updated

```json
{
  "invoice": {
    "id": 3,
    "customer_id": 2,
    "customer_business_then_name": "Wonk Donk",
    "number": "1233",
    "created_at": "2019-07-01T21:37:26.051Z",
    "updated_at": "2019-07-01T21:37:26.204Z",
    "date": "2019-07-01T00:00:00.000Z",
    "due_date": "2019-07-01T00:00:00.000Z",
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

**Response: 404**

Invalid request

#### Delete Invoice

Deletes an invoice by ID

Returns 200 even if the delete fails

**Endpoint:** `DELETE /invoices/{id}`

**Path Parameters:**

| Parameter | Type    | Required | Description             |
| --------- | ------- | -------- | ----------------------- |
| id        | integer | Yes      | ID of Invoice to delete |

**Response: 200**

Invalid request

#### Get Invoice by ID

Returns the associated ticket for an invoice

Required permissions: "Invoices - View Details" and "Tickets - View Details"

**Endpoint:** `GET /invoices/{id}/ticket`

**Required Permission:** Required permissions: "Invoices - View Details" and "Tickets - View Details"

**Path Parameters:**

| Parameter | Type    | Required | Description                                 |
| --------- | ------- | -------- | ------------------------------------------- |
| id        | integer | Yes      | ID of Invoice whose Ticket will be returned |

**Response: 200**

Invoice's ticket found

**Response: 404**

Invalid request

#### Create Invoice

Queues a print job for an invoice

Required permission: Invoices - View Details

**Endpoint:** `POST /invoices/{id}/print`

**Required Permission:** Required permission: Invoices - View Details

**Path Parameters:**

| Parameter | Type    | Required | Description                    |
| --------- | ------- | -------- | ------------------------------ |
| id        | integer | Yes      | The ID of the Invoice to print |

**Response: 200**

Invoice print job queued

**Response: 404**

Invalid request

#### Create Invoice

Sends invoice to customer

Required permission: Invoices - View Details

**Endpoint:** `POST /invoices/{id}/email`

**Required Permission:** Required permission: Invoices - View Details

**Path Parameters:**

| Parameter | Type    | Required | Description                         |
| --------- | ------- | -------- | ----------------------------------- |
| id        | integer | Yes      | ID of Invoice which will be emailed |

**Response: 200**

Invoice email sent

**Response: 404**

Invalid request
