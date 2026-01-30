# RepairShopr API Documentation - Purchase Order

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Purchase Order

#### Get Purchase Orders


Returns a paginated list of Purchase Orders


Required permission: Purchase Orders - List/Search



**Endpoint:** `GET /purchase_orders`


**Required Permission:** Required permission: Purchase Orders - List/Search


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 20 results |


**Response: 200**


successful


```json
{
  "purchase_orders": [
    {
      "id": 1,
      "account_subdomain": "testsubdomainwi1",
      "created_at": "2019-11-15T16:44:28.521Z",
      "updated_at": "2019-11-15T16:44:28.530Z",
      "expected_date": "2013-04-07T01:07:34.000Z",
      "number": "MyString",
      "other": 0.01,
      "shipping": 0.01,
      "shipping_notes": "MyText",
      "status": "MyString",
      "total": 0.02,
      "user_id": 0,
      "vendor_id": 1,
      "location_id": null,
      "due_date": "2019-11-22T00:00:00.000Z",
      "paid_date": "2019-11-15T00:00:00.000Z",
      "delivery_tracking": "yourdevivery.com/tracking/link/1",
      "vendor": {
        "id": 1,
        "name": "C & S Wholesalers",
        "rep_first_name": "Bill",
        "rep_last_name": "Sales",
        "email": "info@candswholes.com",
        "phone": "603-344-5555",
        "account_number": null,
        "created_at": "2019-11-15T16:44:28.494Z",
        "updated_at": "2019-11-15T16:44:28.494Z",
        "address": "44 Billings Circle",
        "city": "Keene",
        "state": "NH",
        "zip": "03455",
        "website": "www.candswholes.com",
        "notes": "Trucks"
      },
      "location": null,
      "line_items": []
    }
  ]
}
```


#### Create Purchase Order


Creates a Purchase Order


Required permission: Purchase Orders - Edit



**Endpoint:** `POST /purchase_orders`


**Required Permission:** Required permission: Purchase Orders - Edit


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| discount_percent | integer | No |  |
| expected_date | string | No |  |
| general_notes | string | No |  |
| other_cents | integer | No |  |
| shipping_cents | integer | No |  |
| shipping_notes | string | No |  |
| user_id | integer | No |  |
| vendor_id | integer | No |  |
| location_id | integer | No |  |
| due_date | string | No |  |
| paid_date | string | No |  |
| order_date | string | No |  |
| delivery_tracking | string | No |  |



**Response: 200**


successful


```json
{
  "purchase_order": {
    "id": 1,
    "account_subdomain": "testsubdomainwi1",
    "created_at": "2019-11-15T16:44:28.521Z",
    "updated_at": "2019-11-15T16:44:28.530Z",
    "expected_date": "2013-04-07T01:07:34.000Z",
    "number": "MyString",
    "other": 0.01,
    "shipping": 0.01,
    "shipping_notes": "MyText",
    "status": "MyString",
    "total": 0.02,
    "user_id": 0,
    "vendor_id": 1,
    "location_id": null,
    "due_date": "2019-11-22T00:00:00.000Z",
    "paid_date": "2019-11-15T00:00:00.000Z",
    "delivery_tracking": "yourdevivery.com/tracking/link/1",
    "vendor": {
      "id": 1,
      "name": "C & S Wholesalers",
      "rep_first_name": "Bill",
      "rep_last_name": "Sales",
      "email": "info@candswholes.com",
      "phone": "603-344-5555",
      "account_number": null,
      "created_at": "2019-11-15T16:44:28.494Z",
      "updated_at": "2019-11-15T16:44:28.494Z",
      "address": "44 Billings Circle",
      "city": "Keene",
      "state": "NH",
      "zip": "03455",
      "website": "www.candswholes.com",
      "notes": "Trucks"
    },
    "location": null,
    "line_items": []
  }
}
```


#### Get Purchase Order by ID


Retrieves a Purchase Order by ID


Required permission: Purchase Orders - View Details



**Endpoint:** `GET /purchase_orders/{id}`


**Required Permission:** Required permission: Purchase Orders - View Details


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "purchase_order": {
    "id": 1,
    "account_subdomain": "testsubdomainwi1",
    "created_at": "2019-11-15T16:44:28.521Z",
    "updated_at": "2019-11-15T16:44:28.530Z",
    "expected_date": "2013-04-07T01:07:34.000Z",
    "number": "MyString",
    "other": 0.01,
    "shipping": 0.01,
    "shipping_notes": "MyText",
    "status": "MyString",
    "total": 0.02,
    "user_id": 0,
    "vendor_id": 1,
    "location_id": null,
    "due_date": "2019-11-22T00:00:00.000Z",
    "paid_date": "2019-11-15T00:00:00.000Z",
    "delivery_tracking": "yourdevivery.com/tracking/link/1",
    "vendor": {
      "id": 1,
      "name": "C & S Wholesalers",
      "rep_first_name": "Bill",
      "rep_last_name": "Sales",
      "email": "info@candswholes.com",
      "phone": "603-344-5555",
      "account_number": null,
      "created_at": "2019-11-15T16:44:28.494Z",
      "updated_at": "2019-11-15T16:44:28.494Z",
      "address": "44 Billings Circle",
      "city": "Keene",
      "state": "NH",
      "zip": "03455",
      "website": "www.candswholes.com",
      "notes": "Trucks"
    },
    "location": null,
    "line_items": []
  }
}
```


**Response: 404**


Invalid request


#### Create Purchase Order


receive purchase_order


Required permission: Purchase Orders - Edit



**Endpoint:** `POST /purchase_orders/{id}/receive`


**Required Permission:** Required permission: Purchase Orders - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| line_item_id | integer | No |  |



**Response: 200**


successful


```json
{
  "purchase_order": {
    "id": 1,
    "account_subdomain": "testsubdomainwi1",
    "created_at": "2019-11-15T16:44:28.521Z",
    "updated_at": "2019-11-15T16:44:28.530Z",
    "expected_date": "2013-04-07T01:07:34.000Z",
    "number": "MyString",
    "other": 0.01,
    "shipping": 0.01,
    "shipping_notes": "MyText",
    "status": "MyString",
    "total": 0.02,
    "user_id": 0,
    "vendor_id": 1,
    "location_id": null,
    "due_date": "2019-11-22T00:00:00.000Z",
    "paid_date": "2019-11-15T00:00:00.000Z",
    "delivery_tracking": "yourdevivery.com/tracking/link/1",
    "vendor": {
      "id": 1,
      "name": "C & S Wholesalers",
      "rep_first_name": "Bill",
      "rep_last_name": "Sales",
      "email": "info@candswholes.com",
      "phone": "603-344-5555",
      "account_number": null,
      "created_at": "2019-11-15T16:44:28.494Z",
      "updated_at": "2019-11-15T16:44:28.494Z",
      "address": "44 Billings Circle",
      "city": "Keene",
      "state": "NH",
      "zip": "03455",
      "website": "www.candswholes.com",
      "notes": "Trucks"
    },
    "location": null,
    "line_items": []
  }
}
```


#### Create Purchase Order


Adds a Product to a Purchase Order


Required permission: Purchase Orders - Edit



**Endpoint:** `POST /purchase_orders/{id}/create_po_line_item`


**Required Permission:** Required permission: Purchase Orders - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | integer | No |  |
| quantity | integer | No |  |



**Response: 200**


successful


```json
{
  "po_line_item": {
    "id": 2,
    "purchase_order_id": 7,
    "product_id": 2,
    "quantity": 10,
    "cost_cents": 1,
    "total_cents": 10,
    "created_at": "2019-10-30T12:00:11.764Z",
    "updated_at": "2019-10-30T12:00:11.764Z",
    "received": false,
    "position": null,
    "received_quantity": 10,
    "parent_po_line_item_id": null,
    "old_cost_cents": null
  }
}
```


**Response: 422**


Invalid request


```json
{
  "errors": "Error adding that item  - please ensure that the item you are trying to add is set to \u2018Maintain Stock\u2019."
}
```

