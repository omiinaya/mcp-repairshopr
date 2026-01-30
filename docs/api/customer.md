# RepairShopr API Documentation - Customer

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Customer

#### Get Customers


Returns a paginated list of customers


Required permission: Customers - List/Search
Single-Customer Users can only access own customer (self).



**Endpoint:** `GET /customers`


**Required Permission:** Required permission: Customers - List/Search


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sort | string | No | A customer field to order by. Examples "firstname ASC", "city DESC". |
| query | string | No | Search query |
| firstname | string | No | Any customers with a first name like the parameter |
| lastname | string | No | Any customers with a last name like the parameter |
| business_name | string | No | Any customers with a business name like the parameter |
| id | array | No | Any customers with ID included in the list |
| not_id | array | No | Any customers with ID not included in the list |
| email | string | No |  |
| include_disabled | string | No | Whether or not the returned list of customers includes disabled customers |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |


**Response: 200**


successful


```json
{
  "customers": [
    {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-10-21T08:33:21.053Z",
      "updated_at": "2019-10-21T08:33:21.053Z",
      "pdf_url": null,
      "address": null,
      "address_2": null,
      "city": null,
      "state": null,
      "zip": null,
      "latitude": null,
      "longitude": null,
      "notes": null,
      "get_sms": false,
      "opt_out": false,
      "disabled": false,
      "no_email": true,
      "location_name": null,
      "location_id": null,
      "properties": {},
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=81lcr4ua1parftzvbgk9",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    }
  ],
  "meta": {
    "total_pages": 1,
    "total_entries": 1,
    "per_page": 100,
    "page": 1
  }
}
```


#### Create Customer


Creates a Customer


Required permission: Customers - Create



**Endpoint:** `POST /customers`


**Required Permission:** Required permission: Customers - Create


**Request Body:**


**Response: 200**


successful


```json
{
  "customer": {
    "id": 1,
    "firstname": "Walkin",
    "lastname": "Customer",
    "fullname": "Walkin Customer",
    "business_name": null,
    "email": "walkin@somedomain.com",
    "phone": "123",
    "mobile": null,
    "created_at": "2019-10-21T08:33:21.053Z",
    "updated_at": "2019-10-21T08:33:21.053Z",
    "pdf_url": null,
    "address": null,
    "address_2": null,
    "city": null,
    "state": null,
    "zip": null,
    "latitude": null,
    "longitude": null,
    "notes": null,
    "get_sms": false,
    "opt_out": false,
    "disabled": false,
    "no_email": true,
    "location_name": null,
    "location_id": null,
    "properties": {},
    "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=81lcr4ua1parftzvbgk9",
    "tax_rate_id": null,
    "notification_email": null,
    "invoice_cc_emails": null,
    "invoice_term_id": null,
    "referred_by": null,
    "ref_customer_id": null,
    "business_and_full_name": "Walkin Customer",
    "business_then_name": "Walkin Customer",
    "contacts": []
  }
}
```


**Response: 422**


Invalid request


```json
{
  "success": false,
  "message": [
    "Email is not an email",
    "Email Only able to parse up to \"it is not an email\""
  ],
  "params": {
    "business_name": "Real Business",
    "firstname": "First",
    "lastname": "Last",
    "email": "it is not an email"
  }
}
```


#### Get Customer by ID


Retrieves a Customer by ID


Required permission: Customers - View Detail
Single-Customer Users can only access own customer (self).



**Endpoint:** `GET /customers/{id}`


**Required Permission:** Required permission: Customers - View Detail


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "customer": {
    "id": 1,
    "firstname": "Walkin",
    "lastname": "Customer",
    "fullname": "Walkin Customer",
    "business_name": null,
    "email": "walkin@somedomain.com",
    "phone": "123",
    "mobile": null,
    "created_at": "2019-10-21T08:33:21.053Z",
    "updated_at": "2019-10-21T08:33:21.053Z",
    "pdf_url": null,
    "address": null,
    "address_2": null,
    "city": null,
    "state": null,
    "zip": null,
    "latitude": null,
    "longitude": null,
    "notes": null,
    "get_sms": false,
    "opt_out": false,
    "disabled": false,
    "no_email": true,
    "location_name": null,
    "location_id": null,
    "properties": {},
    "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=81lcr4ua1parftzvbgk9",
    "tax_rate_id": null,
    "notification_email": null,
    "invoice_cc_emails": null,
    "invoice_term_id": null,
    "referred_by": null,
    "ref_customer_id": null,
    "business_and_full_name": "Walkin Customer",
    "business_then_name": "Walkin Customer",
    "contacts": []
  }
}
```


**Response: 404**


Invalid request


#### Update Customer


Updates an existing Customer by ID


Required permission: Customers - Edit
Single-Customer Users can only access own customer (self).



**Endpoint:** `PUT /customers/{id}`


**Required Permission:** Required permission: Customers - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


**Response: 200**


successful


```json
{
  "customer": {
    "id": 1,
    "firstname": "Walkin",
    "lastname": "Customer",
    "fullname": "Walkin Customer",
    "business_name": null,
    "email": "walkin@somedomain.com",
    "phone": "123",
    "mobile": null,
    "created_at": "2019-10-21T08:33:21.053Z",
    "updated_at": "2019-10-21T08:33:21.053Z",
    "pdf_url": null,
    "address": null,
    "address_2": null,
    "city": null,
    "state": null,
    "zip": null,
    "latitude": null,
    "longitude": null,
    "notes": null,
    "get_sms": false,
    "opt_out": false,
    "disabled": false,
    "no_email": true,
    "location_name": null,
    "location_id": null,
    "properties": {},
    "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=81lcr4ua1parftzvbgk9",
    "tax_rate_id": null,
    "notification_email": null,
    "invoice_cc_emails": null,
    "invoice_term_id": null,
    "referred_by": null,
    "ref_customer_id": null,
    "business_and_full_name": "Walkin Customer",
    "business_then_name": "Walkin Customer",
    "contacts": []
  }
}
```


**Response: 422**


Invalid request


```json
{
  "success": false,
  "message": [
    "Email is not an email",
    "Email Only able to parse up to \"not an email\""
  ]
}
```


#### Delete Customer


Deletes a Customer by ID


Required permission: Customers - Delete



**Endpoint:** `DELETE /customers/{id}`


**Required Permission:** Required permission: Customers - Delete


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "message": "Customer was deleted from the system."
}
```


**Response: 404**


Invalid request


#### Get Latests


Returns latest Customer


Required permission: Customers - Edit
Single-Customer Users can only access own customer (self).



**Endpoint:** `GET /customers/latest`


**Required Permission:** Required permission: Customers - Edit


**Response: 200**


successful


```json
{
  "customer": {
    "id": 1,
    "firstname": "Walkin",
    "lastname": "Customer",
    "fullname": "Walkin Customer",
    "business_name": null,
    "email": "walkin@somedomain.com",
    "phone": "123",
    "mobile": null,
    "created_at": "2019-10-21T08:33:21.053Z",
    "updated_at": "2019-10-21T08:33:21.053Z",
    "pdf_url": null,
    "address": null,
    "address_2": null,
    "city": null,
    "state": null,
    "zip": null,
    "latitude": null,
    "longitude": null,
    "notes": null,
    "get_sms": false,
    "opt_out": false,
    "disabled": false,
    "no_email": true,
    "location_name": null,
    "location_id": null,
    "properties": {},
    "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=81lcr4ua1parftzvbgk9",
    "tax_rate_id": null,
    "notification_email": null,
    "invoice_cc_emails": null,
    "invoice_term_id": null,
    "referred_by": null,
    "ref_customer_id": null,
    "business_and_full_name": "Walkin Customer",
    "business_then_name": "Walkin Customer",
    "contacts": []
  }
}
```


#### Get Autocompletes


Returns a paginated list of customers for autocomplete query


**Endpoint:** `GET /customers/autocomplete`


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query |


**Response: 200**


successful


```json
{
  "customers": [
    {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-10-21T08:33:21.053Z",
      "updated_at": "2019-10-21T08:33:21.053Z",
      "pdf_url": null,
      "address": null,
      "address_2": null,
      "city": null,
      "state": null,
      "zip": null,
      "latitude": null,
      "longitude": null,
      "notes": null,
      "get_sms": false,
      "opt_out": false,
      "disabled": false,
      "no_email": true,
      "location_name": null,
      "location_id": null,
      "properties": {},
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=81lcr4ua1parftzvbgk9",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    }
  ]
}
```

