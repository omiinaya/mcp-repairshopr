# RepairShopr API Documentation - Worksheet Result

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Worksheet Result

#### Get Tickets


Returns a paginated list of Worksheet Results


Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"
Single-Customer Users can only access own tickets.



**Endpoint:** `GET /tickets/{ticket_id}/worksheet_results`


**Required Permission:** Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |


**Response: 200**


successful


```json
{
  "worksheet_results": [
    {
      "id": 1,
      "worksheet_template_id": 1,
      "name": "Worksheet Result from a Template",
      "public": true,
      "complete": null,
      "required": false,
      "field_list": [
        {
          "name": "section",
          "slug": "section",
          "id": 1,
          "position": 0,
          "history": []
        },
        {
          "name": "check",
          "slug": "check",
          "id": 2,
          "position": 1,
          "history": []
        }
      ]
    }
  ]
}
```


#### Create Ticket


Creates Worksheet Result


Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"
Single-Customer Users can only access own tickets.



**Endpoint:** `POST /tickets/{ticket_id}/worksheet_results`


**Required Permission:** Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| worksheet_template_id | integer | No |  |
| title | string | No |  |



**Response: 200**


successful


```json
{
  "worksheet_result": {
    "id": 1,
    "worksheet_template_id": 1,
    "name": "Worksheet Result from a Template",
    "public": true,
    "complete": null,
    "required": false,
    "field_list": [
      {
        "name": "section",
        "slug": "section",
        "id": 1,
        "position": 0,
        "history": []
      },
      {
        "name": "check",
        "slug": "check",
        "id": 2,
        "position": 1,
        "history": []
      }
    ]
  }
}
```


#### Get Ticket by ID


Retrieves a Worksheet Result by ID


Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"
Single-Customer Users can only access own tickets.



**Endpoint:** `GET /tickets/{ticket_id}/worksheet_results/{id}`


**Required Permission:** Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "worksheet_result": {
    "id": 1,
    "worksheet_template_id": 1,
    "name": "Worksheet Result from a Template",
    "public": true,
    "complete": null,
    "required": false,
    "field_list": [
      {
        "name": "section",
        "slug": "section",
        "id": 1,
        "position": 0,
        "history": []
      },
      {
        "name": "check",
        "slug": "check",
        "id": 2,
        "position": 1,
        "history": []
      }
    ]
  }
}
```


#### Update Ticket


Updates a Worksheet Result


Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"
Single-Customer Users can only access own tickets.



**Endpoint:** `PUT /tickets/{ticket_id}/worksheet_results/{id}`


**Required Permission:** Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| worksheet_template_id | integer | No |  |
| user_id | integer | No |  |
| title | string | No |  |
| complete | boolean | No |  |
| public | boolean | No |  |
| required | boolean | No |  |
| answers | object | No |  |



**Response: 200**


successful


#### Delete Ticket


Deletes a Worksheet Result


Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"
Single-Customer Users can only access own tickets.



**Endpoint:** `DELETE /tickets/{ticket_id}/worksheet_results/{id}`


**Required Permission:** Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |
| id | integer | Yes |  |


**Response: 200**


successful

