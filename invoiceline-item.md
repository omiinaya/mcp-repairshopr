# RepairShopr API Documentation - Invoice/Line Item

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Invoice/Line Item

#### Update Invoice


Updates an a line item of an invoice by ID


This updates an existing Invoice's line item, all parameters overwrite existing params


**Endpoint:** `PUT /invoices/{id}/line_items/{line_item_id}`


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice to update |
| line_item_id | integer | Yes | ID of line item to update |


**Request Body:**


**Response: 200**


Invoice is already paid


**Response: 404**


Invalid request


#### Delete Invoice


Deletes an a line item of an invoice by ID


This deletes an existing Invoice's line item


**Endpoint:** `DELETE /invoices/{id}/line_items/{line_item_id}`


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice to delete |
| line_item_id | integer | Yes | ID of line item to update |


**Response: 200**


Line item deleted


**Response: 404**


Invalid request


#### Create Invoice


Creates a new line item


Required permission: Invoices - Edit



**Endpoint:** `POST /invoices/{id}/line_items`


**Required Permission:** Required permission: Invoices - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice to update |


**Request Body:**


**Response: 200**


Line item created


**Response: 422**


Invalid request

