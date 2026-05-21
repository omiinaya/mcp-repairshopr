# RepairShopr API Documentation - Sample

## Customer

### Get Customers

**Endpoint:** `GET /customers`

**Permission:** Customers - List/Search

Retrieve a list of all customers in the system.

#### Parameters

| Name  | Type    | Required | Description                         |
| ----- | ------- | -------- | ----------------------------------- |
| page  | integer | No       | Page number for pagination          |
| limit | integer | No       | Number of results per page          |
| sort  | string  | No       | Sort field (name, created_at, etc.) |
| query | string  | No       | Search query for filtering          |

#### Responses

**200** - Successful response

```json
{
  "customers": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20
  }
}
```

**401** - Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### Get Customer by ID

**Endpoint:** `GET /customers/{id}`

**Permission:** Customers - View

Retrieve a specific customer by ID.

#### Parameters

| Name | Type    | Required | Description |
| ---- | ------- | -------- | ----------- |
| id   | integer | Yes      | Customer ID |

#### Responses

**200** - Successful response

```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**404** - Not found

```json
{
  "error": "Not Found",
  "message": "The requested customer could not be found"
}
```

### Create Customer

**Endpoint:** `POST /customers`

**Permission:** Customers - Create

Create a new customer in the system.

#### Parameters

| Name  | Type   | Required | Description            |
| ----- | ------ | -------- | ---------------------- |
| name  | string | Yes      | Customer name          |
| email | string | Yes      | Customer email address |
| phone | string | No       | Customer phone number  |

#### Responses

**201** - Customer created successfully

```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**422** - Validation error

```json
{
  "error": "Validation Failed",
  "message": "The request could not be validated",
  "errors": {
    "name": ["Name is required"],
    "email": ["Invalid email format"]
  }
}
```

## Ticket

### Get Tickets

**Endpoint:** `GET /tickets`

**Permission:** Tickets - List/Search

Retrieve a list of all tickets.

#### Parameters

| Name        | Type    | Required | Description                |
| ----------- | ------- | -------- | -------------------------- |
| page        | integer | No       | Page number for pagination |
| limit       | integer | No       | Number of results per page |
| status      | string  | No       | Filter by ticket status    |
| customer_id | integer | No       | Filter by customer ID      |

#### Responses

**200** - Successful response

```json
{
  "tickets": [
    {
      "id": 1,
      "subject": "Support Request",
      "status": "open",
      "customer_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Ticket

**Endpoint:** `POST /tickets`

**Permission:** Tickets - Create

Create a new support ticket.

#### Parameters

| Name        | Type    | Required | Description           |
| ----------- | ------- | -------- | --------------------- |
| subject     | string  | Yes      | Ticket subject        |
| description | string  | Yes      | Ticket description    |
| customer_id | integer | Yes      | Customer ID           |
| status      | string  | No       | Initial ticket status |

#### Responses

**201** - Ticket created successfully

```json
{
  "ticket": {
    "id": 1,
    "subject": "Support Request",
    "status": "open",
    "customer_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Invoice

### Get Invoices

**Endpoint:** `GET /invoices`

**Permission:** Invoices - List/Search

Retrieve a list of all invoices.

#### Parameters

| Name        | Type    | Required | Description                |
| ----------- | ------- | -------- | -------------------------- |
| page        | integer | No       | Page number for pagination |
| limit       | integer | No       | Number of results per page |
| customer_id | integer | No       | Filter by customer ID      |
| status      | string  | No       | Filter by invoice status   |

#### Responses

**200** - Successful response

```json
{
  "invoices": [
    {
      "id": 1,
      "number": "INV-001",
      "customer_id": 1,
      "total": 100.0,
      "status": "paid",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```
