# RepairShopr API Documentation - Contracts

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

### Contracts

#### Get Contracts

Returns a paginated list of Contracts.

**Endpoint:** `GET /contracts`

**Required Permission:** Contracts - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 50 results |

**Response: 200 OK**

```json
{
  "contracts": [
    {
      "id": 1,
      "account_id": 1,
      "customer_id": 1,
      "name": "Support Tier 1",
      "contract_amount": "30k",
      "start_date": "2019-10-23T00:00:00.000Z",
      "end_date": "2020-10-22T00:00:00.000Z",
      "primary_contact": null,
      "description": "Contract Description",
      "created_at": "2019-10-22T10:00:55.392Z",
      "updated_at": "2019-10-22T10:00:55.392Z",
      "status": "Opportunity",
      "likelihood": 30,
      "apply_to_all": false,
      "sla_id": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "total_entries": 1,
    "per_page": 50,
    "page": 1
  }
}
```

#### Create Contract

Creates a Contract.

**Endpoint:** `POST /contracts`

**Required Permission:** Contracts - Edit

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| contract_amount | string | No | Contract amount |
| description | string | No | Contract description |
| start_date | string (date-time) | No | Start date |
| end_date | string (date-time) | No | End date |
| name | string | No | Contract name |
| primary_contact | string | No | Primary contact |
| status | string | No | Contract status |
| likelihood | integer | No | Likelihood percentage |
| apply_to_all | boolean | No | Apply to all |
| sla_id | integer | No | SLA ID |

**Response: 200 OK**

```json
{
  "id": 1,
  "account_id": 1,
  "customer_id": 1,
  "name": "Support Tier 1",
  "contract_amount": "30k",
  "start_date": "2019-10-23T00:00:00.000Z",
  "end_date": "2020-10-22T00:00:00.000Z",
  "primary_contact": null,
  "description": "Contract Description",
  "created_at": "2019-10-22T10:00:55.392Z",
  "updated_at": "2019-10-22T10:00:55.392Z",
  "status": "Opportunity",
  "likelihood": 30,
  "apply_to_all": false,
  "sla_id": null
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "record": {
    "id": null,
    "account_id": 1,
    "customer_id": null,
    "name": "No Customer",
    "contract_amount": null,
    "start_date": null,
    "end_date": null,
    "primary_contact": null,
    "description": "No Customer",
    "created_at": null,
    "updated_at": null,
    "status": "Opportunity",
    "likelihood": 0,
    "apply_to_all": false,
    "sla_id": null
  },
  "errors": "Customer can't be blank"
}
```

#### Get Contract by ID

Retrieves a Contract by ID.

**Endpoint:** `GET /contracts/{id}`

**Required Permission:** Contracts - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contract ID |

**Response: 200 OK**

```json
{
  "id": 1,
  "account_id": 1,
  "customer_id": 1,
  "name": "Support Tier 1",
  "contract_amount": "30k",
  "start_date": "2019-10-23T00:00:00.000Z",
  "end_date": "2020-10-22T00:00:00.000Z",
  "primary_contact": null,
  "description": "Contract Description",
  "created_at": "2019-10-22T10:00:55.392Z",
  "updated_at": "2019-10-22T10:00:55.392Z",
  "status": "Opportunity",
  "likelihood": 30,
  "apply_to_all": false,
  "sla_id": null
}
```

#### Update Contract

Updates an existing Contract by ID.

**Endpoint:** `PUT /contracts/{id}`

**Required Permission:** Contracts - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contract ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| contract_amount | string | No | Contract amount |
| description | string | No | Contract description |
| start_date | string (date-time) | No | Start date |
| end_date | string (date-time) | No | End date |
| name | string | No | Contract name |
| primary_contact | string | No | Primary contact |
| status | string | No | Contract status |
| likelihood | integer | No | Likelihood percentage |
| apply_to_all | boolean | No | Apply to all |
| sla_id | integer | No | SLA ID |

**Response: 200 OK**

**Response: 422 Unprocessable Entity**

```json
{
  "record": {
    "id": 1,
    "account_id": 1,
    "customer_id": 1,
    "name": "Support Tier 1",
    "contract_amount": "30k",
    "start_date": "2019-10-23T00:00:00.000Z",
    "end_date": "2020-10-22T00:00:00.000Z",
    "primary_contact": null,
    "description": "Contract Description",
    "created_at": "2019-10-22T10:00:55.392Z",
    "updated_at": "2019-10-22T10:00:55.392Z",
    "status": "Opportunity",
    "likelihood": 30,
    "apply_to_all": false,
    "sla_id": null
  },
  "errors": "Customer can't be blank"
}
```

#### Delete Contract

Deletes a Contract by ID.

**Endpoint:** `DELETE /contracts/{id}`

**Required Permission:** Contracts - Delete

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contract ID |

**Response: 200 OK**

**Response: 404 Not Found**
