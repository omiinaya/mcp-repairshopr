# RepairShopr API Documentation - Canned Response

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Canned Response

#### Get Canned Responses


Returns a list of Canned Responses with a query


Required permission: Ticket Canned Responses - Manage



**Endpoint:** `GET /canned_responses`


**Required Permission:** Required permission: Ticket Canned Responses - Manage


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query |


**Response: 200**


successful


#### Create Canned Response


Creates a new Canned Response


Required permission: Ticket Canned Responses - Manage



**Endpoint:** `POST /canned_responses`


**Required Permission:** Required permission: Ticket Canned Responses - Manage


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes |  |
| body | string | Yes |  |
| subject | string | No |  |
| canned_response_category_id | integer | No |  |



**Response: 201**


successful


#### Update Canned Response


Updates a Canned Response


Required permission: Ticket Canned Responses - Manage



**Endpoint:** `PATCH /canned_responses/{id}`


**Required Permission:** Required permission: Ticket Canned Responses - Manage


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | No |  |
| body | string | No |  |
| subject | string | No |  |
| canned_response_category_id | integer | No |  |



**Response: 200**


successful


#### Delete Canned Response


Deletes a Canned Response


Required permission: Ticket Canned Responses - Manage



**Endpoint:** `DELETE /canned_responses/{id}`


**Required Permission:** Required permission: Ticket Canned Responses - Manage


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 204**


successful


#### Get Settings


Returns the settings for Canned Responses


Required permission: Ticket Canned Responses - Manage
Single-Customer Users can only access own canned responses.



**Endpoint:** `GET /canned_responses/settings`


**Required Permission:** Required permission: Ticket Canned Responses - Manage


**Response: 200**


successful

