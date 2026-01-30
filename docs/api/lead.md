# RepairShopr API Documentation - Lead

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Lead

#### Get Leads


Returns a paginated list of Leads


Required permission: Leads - List/Search



**Endpoint:** `GET /leads`


**Required Permission:** Required permission: Leads - List/Search


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| statuses | array | No | Array of statuses. Possible values are "New", "Lead", "First Contact", "Opportunity", "Prospect", "Waiting on Client", "In Negotiation", "Pending", "Won", "Lost". |
| status_list | string | No | Comma separated list of statuses. |
| users | array | No | Array of user IDs. |
| mailbox_ids | array | No | Array of Mailbox IDs |
| has_ticket | boolean | No |  |
| query | string | No | Search query |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |


**Response: 200**


successful


```json
{
  "leads": [
    {
      "id": 1,
      "first_name": "Susy",
      "last_name": "Ratke",
      "email": "walkin@somedomain.com",
      "phone": "",
      "mobile": "",
      "created_at": "2019-10-23T06:49:14.560Z",
      "updated_at": "2019-10-23T06:49:14.560Z",
      "address": "",
      "city": "",
      "state": "",
      "zip": "",
      "ticket_subject": null,
      "ticket_description": null,
      "ticket_problem_type": null,
      "ticket_id": null,
      "customer_id": 1,
      "contact_id": null,
      "mailbox_id": null,
      "mailbox_name": null,
      "business_then_name": "Klocko-Stracke",
      "has_attachments": false,
      "message_read": false,
      "status": "New",
      "user_id": null,
      "location_id": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "total_entries": 1,
    "per_page": 25,
    "page": 1
  }
}
```


#### Create Lead


Creates a Lead


Required permission: None



**Endpoint:** `POST /leads`


**Required Permission:** Required permission: None


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| address | string | No |  |
| business_name | string | No |  |
| city | string | No |  |
| zip | string | No |  |
| converted | boolean | No |  |
| message_read | boolean | No |  |
| disabled | boolean | No |  |
| email | string | No |  |
| first_name | string | No |  |
| last_name | string | No |  |
| mobile | string | No |  |
| phone | string | No |  |
| state | string | No |  |
| ticket_description | string | No |  |
| ticket_problem_type | string | No |  |
| ticket_subject | string | No |  |
| location_id | integer | No |  |
| from_check_in | boolean | No |  |
| customer_id | integer | No |  |
| ticket_id | integer | No |  |
| hidden_notes | string | No |  |
| contact_id | integer | No |  |
| appointment_time | string | No |  |
| status | string | No |  |
| user_id | integer | No |  |
| ticket_type_id | integer | No |  |
| mailbox_id | integer | No |  |
| opportunity_start_date | string | No |  |
| opportunity_amount_dollars | number | No |  |
| likelihood | integer | No |  |
| properties | object | No |  |
| ticket_properties | object | No |  |
| customer_purchase_id | integer | No |  |
| signature_date | string | No |  |
| signature_name | string | No |  |
| signature_data | string | No |  |
| appointment_type_id | integer | No |  |



**Response: 200**


successful


```json
{
  "lead": {
    "id": 1,
    "first_name": "Susy",
    "last_name": "Ratke",
    "email": "walkin@somedomain.com",
    "phone": "",
    "mobile": "",
    "created_at": "2019-10-23T06:49:14.560Z",
    "updated_at": "2019-10-23T06:49:14.560Z",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "ticket_subject": null,
    "ticket_description": null,
    "ticket_problem_type": null,
    "ticket_id": null,
    "customer_id": 1,
    "contact_id": null,
    "mailbox_id": null,
    "mailbox_name": null,
    "business_then_name": "Klocko-Stracke",
    "has_attachments": false,
    "message_read": false,
    "status": "New",
    "user_id": null,
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
    "Ticket description can't be blank"
  ],
  "params": {
    "from_check_in": true
  }
}
```


#### Get Lead by ID


Retrieves a Lead by ID


Required permission: Leads - List/Search



**Endpoint:** `GET /leads/{id}`


**Required Permission:** Required permission: Leads - List/Search


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "lead": {
    "id": 1,
    "first_name": "Susy",
    "last_name": "Ratke",
    "email": "walkin@somedomain.com",
    "phone": "",
    "mobile": "",
    "created_at": "2019-10-23T06:49:14.560Z",
    "updated_at": "2019-10-23T06:49:14.560Z",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "ticket_subject": null,
    "ticket_description": null,
    "ticket_problem_type": null,
    "ticket_id": null,
    "customer_id": 1,
    "contact_id": null,
    "mailbox_id": null,
    "mailbox_name": null,
    "business_then_name": "Klocko-Stracke",
    "has_attachments": false,
    "message_read": false,
    "status": "New",
    "user_id": null,
    "location_id": null
  }
}
```


**Response: 404**


Invalid request


#### Update Lead


Updates an existing Lead by ID


Required permission: None



**Endpoint:** `PUT /leads/{id}`


**Required Permission:** Required permission: None


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| address | string | No |  |
| business_name | string | No |  |
| city | string | No |  |
| zip | string | No |  |
| converted | boolean | No |  |
| message_read | boolean | No |  |
| disabled | boolean | No |  |
| email | string | No |  |
| first_name | string | No |  |
| last_name | string | No |  |
| mobile | string | No |  |
| phone | string | No |  |
| state | string | No |  |
| ticket_description | string | No |  |
| ticket_problem_type | string | No |  |
| ticket_subject | string | No |  |
| location_id | integer | No |  |
| from_check_in | boolean | No |  |
| customer_id | integer | No |  |
| ticket_id | integer | No |  |
| hidden_notes | string | No |  |
| contact_id | integer | No |  |
| appointment_time | string | No |  |
| status | string | No |  |
| user_id | integer | No |  |
| ticket_type_id | integer | No |  |
| mailbox_id | integer | No |  |
| opportunity_start_date | string | No |  |
| opportunity_amount_dollars | number | No |  |
| likelihood | integer | No |  |
| properties | object | No |  |
| ticket_properties | object | No |  |
| customer_purchase_id | integer | No |  |
| signature_date | string | No |  |
| signature_name | string | No |  |
| signature_data | string | No |  |
| appointment_type_id | integer | No |  |



**Response: 200**


successful


```json
{
  "lead": {
    "id": 1,
    "first_name": "Susy",
    "last_name": "Ratke",
    "email": "walkin@somedomain.com",
    "phone": "",
    "mobile": "",
    "created_at": "2019-10-23T06:49:14.560Z",
    "updated_at": "2019-10-23T06:49:14.560Z",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "ticket_subject": null,
    "ticket_description": null,
    "ticket_problem_type": null,
    "ticket_id": null,
    "customer_id": 1,
    "contact_id": null,
    "mailbox_id": null,
    "mailbox_name": null,
    "business_then_name": "Klocko-Stracke",
    "has_attachments": false,
    "message_read": false,
    "status": "New",
    "user_id": null,
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
    "Ticket description can't be blank"
  ],
  "params": {
    "ticket_description": ""
  }
}
```

