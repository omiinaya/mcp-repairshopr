# RepairShopr API Documentation - Schedule

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Schedule

#### Get Schedules

Returns a paginated list of Invoice Schedules

Required permission: Recurring Invoices - List

**Endpoint:** `GET /schedules`

**Required Permission:** Required permission: Recurring Invoices - List

**Query Parameters:**

| Parameter   | Type    | Required | Description                                                       |
| ----------- | ------- | -------- | ----------------------------------------------------------------- |
| customer_id | integer | No       | Returns a list of Schedules that belong to a Customer ID          |
| page        | integer | No       | Returns provided page of results, each 'page' contains 25 results |

**Response: 200**

successful

```json
{
  "schedules": [
    {
      "id": 1,
      "account_id": 1,
      "customer_id": 1,
      "email_customer": false,
      "frequency": "Daily",
      "name": "MyString",
      "next_run": "2016-01-01T00:00:00.000Z",
      "snail_mail": false,
      "charge_mop": false,
      "subtotal": 0,
      "invoice_unbilled_ticket_charges": false,
      "paused": false,
      "last_invoice_paid": null,
      "lines": []
    }
  ]
}
```

#### Create Schedule

Creates an Invoice Schedule

Required permission: Recurring Invoices - New

**Endpoint:** `POST /schedules`

**Required Permission:** Required permission: Recurring Invoices - New

**Request Body:**

**Response: 200**

successful

```json
{
  "schedule": {
    "id": 1,
    "account_id": 1,
    "customer_id": 1,
    "email_customer": false,
    "frequency": "Daily",
    "name": "MyString",
    "next_run": "2016-01-01T00:00:00.000Z",
    "snail_mail": false,
    "charge_mop": false,
    "subtotal": 0,
    "invoice_unbilled_ticket_charges": false,
    "paused": false,
    "last_invoice_paid": null,
    "lines": []
  }
}
```

**Response: 422**

Invalid request

```json
{
  "error": [
    "Frequency Must be a valid selection",
    "Frequency can't be blank",
    "Next run can't be blank",
    "Name can't be blank",
    "Customer can't be blank"
  ]
}
```

#### Get Schedule by ID

Retrieves a Schedule by ID

Required permission: Recurring Invoices - List

**Endpoint:** `GET /schedules/{id}`

**Required Permission:** Required permission: Recurring Invoices - List

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "schedule": {
    "id": 1,
    "account_id": 1,
    "customer_id": 1,
    "email_customer": false,
    "frequency": "Daily",
    "name": "MyString",
    "next_run": "2016-01-01T00:00:00.000Z",
    "snail_mail": false,
    "charge_mop": false,
    "subtotal": 0,
    "invoice_unbilled_ticket_charges": false,
    "paused": false,
    "last_invoice_paid": null,
    "lines": []
  }
}
```

**Response: 404**

Invalid request

#### Update Schedule

Updates an existing Invoice Schedule by ID

Required permission: Recurring Invoices - Edit

**Endpoint:** `PUT /schedules/{id}`

**Required Permission:** Required permission: Recurring Invoices - Edit

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

**Response: 200**

successful

```json
{
  "schedule": {
    "id": 1,
    "account_id": 1,
    "customer_id": 1,
    "email_customer": false,
    "frequency": "Daily",
    "name": "MyString",
    "next_run": "2016-01-01T00:00:00.000Z",
    "snail_mail": false,
    "charge_mop": false,
    "subtotal": 0,
    "invoice_unbilled_ticket_charges": false,
    "paused": false,
    "last_invoice_paid": null,
    "lines": []
  }
}
```

**Response: 422**

Invalid request

```json
{
  "error": ["Next run can't be blank"]
}
```

#### Delete Schedule

Deletes a Schedule by ID

Required permission: Recurring Invoices - Delete

**Endpoint:** `DELETE /schedules/{id}`

**Required Permission:** Required permission: Recurring Invoices - Delete

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

**Response: 404**

Invalid request

#### Create Schedule

Adds a Line Item to an Invoice Schedule

Required permission: Recurring Invoices - Edit

**Endpoint:** `POST /schedules/{id}/add_line_item`

**Required Permission:** Required permission: Recurring Invoices - Edit

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

**Response: 200**

successful

```json
{
  "schedule_line_item": {
    "id": 1,
    "cost_cents": 0,
    "description": "Description",
    "name": "Name",
    "position": 0,
    "product_id": null,
    "quantity": "0.0",
    "retail_cents": 0,
    "schedule_id": 11,
    "taxable": false,
    "user_id": 1,
    "price_cost": 0,
    "price_retail": 0,
    "product_category": null,
    "asset_type_id": null,
    "recurring_type_id": null,
    "device_ids": [],
    "one_time_charge": false
  }
}
```

**Response: 422**

Invalid request

```json
{
  "error": ["Name can't be blank"]
}
```

#### Create Schedule

Removes a Line Item from an Invoice Schedule

Required permission: Recurring Invoices - Edit

**Endpoint:** `POST /schedules/{id}/remove_line_item`

**Required Permission:** Required permission: Recurring Invoices - Edit

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

**Response: 200**

successful

**Response: 404**

Invalid request

#### Update Schedule

Updates a Line Item

Required permission: Recurring Invoices - Edit

**Endpoint:** `PUT /schedules/{id}/line_items/{schedule_line_item_id}`

**Required Permission:** Required permission: Recurring Invoices - Edit

**Path Parameters:**

| Parameter             | Type    | Required | Description               |
| --------------------- | ------- | -------- | ------------------------- |
| id                    | integer | Yes      |                           |
| schedule_line_item_id | integer | Yes      | ID of line item to update |

**Request Body:**

**Response: 200**

successful

```json
{
  "schedule_line_item": {
    "id": 3,
    "cost_cents": 1,
    "description": "MyText",
    "name": "Updated Name",
    "position": 1,
    "product_id": 1,
    "quantity": "9.99",
    "retail_cents": 1,
    "schedule_id": 15,
    "taxable": false,
    "user_id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "product_category": null,
    "asset_type_id": null,
    "recurring_type_id": null,
    "device_ids": [],
    "one_time_charge": false
  }
}
```

**Response: 422**

Invalid request

```json
{
  "error": ["Name can't be blank"]
}
```
