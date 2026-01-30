# RepairShopr API Documentation - Contact

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Contact

#### Get Contacts


Returns a paginated list of Contacts


Required permission: Customers - View Detail
Single-Customer Users can only access own contacts.



**Endpoint:** `GET /contacts`


**Required Permission:** Required permission: Customers - View Detail


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Any contacts attached to a Customer ID |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |


**Response: 200**


successful


```json
{
  "contacts": [
    {
      "id": 1,
      "name": "Boba Fett",
      "address1": "8653 Ivan Flat",
      "address2": "Apt. 436",
      "city": "Tuanside",
      "state": "Delaware",
      "zip": "02293",
      "email": "jarviscorwin@hanefeeney.io",
      "phone": "657.325.3258 x330",
      "mobile": "(133) 358-5295",
      "latitude": 67.92905002829,
      "longitude": 91.6028665875294,
      "customer_id": 1,
      "account_id": 1,
      "notes": "Talk Jabba. (Tell that to Jabba.)",
      "created_at": "2019-10-22T08:47:09.723Z",
      "updated_at": "2019-10-22T08:47:09.723Z",
      "vendor_id": null,
      "properties": {},
      "opt_out": false,
      "extension": null
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


**Response: 401**


Requires permission: Customers - View Detail


```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```


#### Create Contact


Creates a Contact


Required permission: Customers - Edit
Single-Customer Users can only access own contacts.



**Endpoint:** `POST /contacts`


**Required Permission:** Required permission: Customers - Edit


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes |  |
| name | string | No |  |
| address1 | string | No |  |
| address2 | string | No |  |
| city | string | No |  |
| state | string | No |  |
| zip | string | No |  |
| email | string | No |  |
| phone | string | No |  |
| mobile | string | No |  |
| notes | string | No |  |



**Response: 200**


successful


```json
{
  "id": 1,
  "name": "Boba Fett",
  "address1": "8653 Ivan Flat",
  "address2": "Apt. 436",
  "city": "Tuanside",
  "state": "Delaware",
  "zip": "02293",
  "email": "jarviscorwin@hanefeeney.io",
  "phone": "657.325.3258 x330",
  "mobile": "(133) 358-5295",
  "latitude": 67.92905002829,
  "longitude": 91.6028665875294,
  "customer_id": 1,
  "account_id": 1,
  "notes": "Talk Jabba. (Tell that to Jabba.)",
  "created_at": "2019-10-22T08:47:09.723Z",
  "updated_at": "2019-10-22T08:47:09.723Z",
  "vendor_id": null,
  "properties": {},
  "opt_out": false,
  "extension": null
}
```


**Response: 401**


Requires permission: Customers - Edit


```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```


**Response: 404**


Customer not found


```json
{
  "message": "Not found"
}
```


**Response: 422**


Invalid request


```json
{
  "record": {
    "id": null,
    "name": "Bad Email",
    "address1": null,
    "address2": null,
    "city": null,
    "state": null,
    "zip": null,
    "email": "xxx",
    "phone": null,
    "mobile": null,
    "latitude": null,
    "longitude": null,
    "customer_id": 1,
    "account_id": 1,
    "notes": null,
    "created_at": null,
    "updated_at": null,
    "vendor_id": null,
    "properties": {},
    "opt_out": false,
    "extension": null,
    "processed_phone": null,
    "processed_mobile": null
  },
  "errors": "Email is not an email"
}
```


#### Get Contact by ID


Retrieves a Contact by ID


Required permission: Customers - View Detail
Single-Customer Users can only access own contacts.



**Endpoint:** `GET /contacts/{id}`


**Required Permission:** Required permission: Customers - View Detail


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "id": 0,
  "name": "string",
  "address1": "string",
  "address2": "string",
  "city": "string",
  "state": "string",
  "zip": "string",
  "email": "string",
  "phone": "string",
  "mobile": "string",
  "latitude": 0.0,
  "longitud": 0.0,
  "customer_id": 0,
  "account_id": 0,
  "notes": "string",
  "created_at": "string",
  "updated_at": "string",
  "vendor_id": 0.0,
  "properties": {},
  "opt_out": true,
  "extension": "string"
}
```


**Response: 401**


Requires permission: Customers - View Detail


```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```


**Response: 404**


Single-Customer User cannot view other customers' contacts


```json
{
  "message": "Not found"
}
```


#### Update Contact


Updates an existing Contact


Required permission: Customers - Edit
Single-Customer Users can only access own contacts.



**Endpoint:** `PUT /contacts/{id}`


**Required Permission:** Required permission: Customers - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No |  |
| name | string | Yes |  |
| address1 | string | No |  |
| address2 | string | No |  |
| city | string | No |  |
| state | string | No |  |
| zip | string | No |  |
| email | string | No |  |
| phone | string | No |  |
| title | string | No |  |
| mobile | string | No |  |
| notes | string | No |  |



**Response: 200**


successful


```json
{
  "id": 1,
  "name": "Boba Fett",
  "address1": "8653 Ivan Flat",
  "address2": "Apt. 436",
  "city": "Tuanside",
  "state": "Delaware",
  "zip": "02293",
  "email": "jarviscorwin@hanefeeney.io",
  "phone": "657.325.3258 x330",
  "mobile": "(133) 358-5295",
  "latitude": 67.92905002829,
  "longitude": 91.6028665875294,
  "customer_id": 1,
  "account_id": 1,
  "notes": "Talk Jabba. (Tell that to Jabba.)",
  "created_at": "2019-10-22T08:47:09.723Z",
  "updated_at": "2019-10-22T08:47:09.723Z",
  "vendor_id": null,
  "properties": {},
  "opt_out": false,
  "extension": null
}
```


**Response: 401**


Requires permission: Customers - Edit


```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```


**Response: 404**


Single-Customer User cannot view other customers' contacts


```json
{
  "message": "Not found"
}
```


**Response: 422**


Invalid request


```json
{
  "record": {
    "id": 1,
    "name": "Boba Fett",
    "address1": "8653 Ivan Flat",
    "address2": "Apt. 436",
    "city": "Tuanside",
    "state": "Delaware",
    "zip": "02293",
    "email": "jarviscorwin@hanefeeney.io",
    "phone": "657.325.3258 x330",
    "mobile": "(133) 358-5295",
    "latitude": 67.92905002829,
    "longitude": 91.6028665875294,
    "customer_id": 1,
    "account_id": 1,
    "notes": "Talk Jabba. (Tell that to Jabba.)",
    "created_at": "2019-10-22T08:47:09.723Z",
    "updated_at": "2019-10-22T08:47:09.723Z",
    "vendor_id": null,
    "properties": {},
    "opt_out": false,
    "extension": null
  },
  "errors": "Customer can't be blank"
}
```


#### Delete Contact


Deletes a Contact


Required permission: Customers - Edit
Single-Customer Users can only access own contacts.



**Endpoint:** `DELETE /contacts/{id}`


**Required Permission:** Required permission: Customers - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


**Response: 401**


Requires permission: Customers - Edit


```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```


**Response: 404**


Invalid request

