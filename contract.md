# RepairShopr API Documentation - Contract

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Contract

#### Get Contracts


Returns a paginated list of Contracts


Required permission: Contracts - List/Search



**Endpoint:** `GET /contracts`


**Required Permission:** Required permission: Contracts - List/Search


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 50 results |


**Response: 200**


successful


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


Creates a Contract


Required permission: Contracts - Edit



**Endpoint:** `POST /contracts`


**Required Permission:** Required permission: Contracts - Edit


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| contract_amount | string | No |  |
| customer_id | integer | Yes |  |
| description | string | No |  |
| start_date | string | No |  |
| end_date | string | No |  |
| name | string | No |  |
| primary_contact | string | No |  |
| status | string | No |  |
| likelihood | integer | No |  |
| apply_to_all | boolean | No |  |
| sla_id | integer | No |  |



**Response: 200**


successful


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


**Response: 422**


Invalid request


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


Retrieves a Contract by ID


Required permission: Contracts - Edit



**Endpoint:** `GET /contracts/{id}`


**Required Permission:** Required permission: Contracts - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


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


Updates an existing Contract by ID


Required permission: Contracts - Edit



**Endpoint:** `PUT /contracts/{id}`


**Required Permission:** Required permission: Contracts - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| contract_amount | string | No |  |
| customer_id | integer | Yes |  |
| description | string | No |  |
| start_date | string | No |  |
| end_date | string | No |  |
| name | string | No |  |
| primary_contact | string | No |  |
| status | string | No |  |
| likelihood | integer | No |  |
| apply_to_all | boolean | No |  |
| sla_id | integer | No |  |



**Response: 200**


successful


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


**Response: 422**


Invalid request


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


Deletes a Contract by ID


Required permission: Contracts - Delete



**Endpoint:** `DELETE /contracts/{id}`


**Required Permission:** Required permission: Contracts - Delete


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


**Response: 404**


Invalid request

