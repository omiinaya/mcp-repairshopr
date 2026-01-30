# RepairShopr API Documentation - Customers

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

### Customers

#### Get Customers

Returns a paginated list of customers.

**Endpoint:** `GET /customers`

**Required Permission:** Customers - List/Search  
Single-Customer Users can only access own customer (self).

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sort | string | No | A customer field to order by. Examples "firstname ASC", "city DESC". |
| query | string | No | Search query |
| firstname | string | No | Any customers with a first name like the parameter |
| lastname | string | No | Any customers with a last name like the parameter |
| business_name | string | No | Any customers with a business name like the parameter |
| id | array[integer] | No | Any customers with ID included in the list |
| not_id | array[integer] | No | Any customers with ID not included in the list |
| email | string | No | Email address |
| include_disabled | string | No | Whether or not the returned list of customers includes disabled customers |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

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

Creates a Customer.

**Endpoint:** `POST /customers`

**Required Permission:** Customers - Create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_name | string | No | Business name |
| firstname | string | No | First name |
| lastname | string | No | Last name |
| email | string | No | Email address |
| phone | string | No | Phone number |
| mobile | string | No | Mobile number |
| address | string | No | Address |
| address_2 | string | No | Address line 2 |
| city | string | No | City |
| state | string | No | State |
| zip | string | No | ZIP code |
| notes | string | No | Notes |
| get_sms | boolean | No | Receive SMS |
| opt_out | boolean | No | Opt out of marketing |
| no_email | boolean | No | No email |
| get_billing | boolean | No | Receive billing |
| get_marketing | boolean | No | Receive marketing |
| get_reports | boolean | No | Receive reports |
| ref_customer_id | integer | No | Referred by customer ID |
| referred_by | string | No | Referred by |
| tax_rate_id | integer | No | Tax rate ID |
| notification_email | string | No | Notification email |
| invoice_cc_emails | string | No | Invoice CC emails |
| invoice_term_id | integer | No | Invoice term ID |
| properties | object | No | Custom properties |
| consent | object | No | Consent settings |

**Response: 200 OK**

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

**Response: 422 Unprocessable Entity**

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

Retrieves a Customer by ID.

**Endpoint:** `GET /customers/{id}`

**Required Permission:** Customers - View Detail  
Single-Customer Users can only access own customer (self).

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Customer ID |

**Response: 200 OK**

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

**Response: 404 Not Found**

#### Update Customer

Updates an existing Customer by ID.

**Endpoint:** `PUT /customers/{id}`

**Required Permission:** Customers - Edit  
Single-Customer Users can only access own customer (self).

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Customer ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_name | string | No | Business name |
| firstname | string | No | First name |
| lastname | string | No | Last name |
| email | string | No | Email address |
| phone | string | No | Phone number |
| mobile | string | No | Mobile number |
| address | string | No | Address |
| address_2 | string | No | Address line 2 |
| city | string | No | City |
| state | string | No | State |
| zip | string | No | ZIP code |
| notes | string | No | Notes |
| get_sms | boolean | No | Receive SMS |
| opt_out | boolean | No | Opt out of marketing |
| no_email | boolean | No | No email |
| get_billing | boolean | No | Receive billing |
| get_marketing | boolean | No | Receive marketing |
| get_reports | boolean | No | Receive reports |
| ref_customer_id | integer | No | Referred by customer ID |
| referred_by | string | No | Referred by |
| tax_rate_id | integer | No | Tax rate ID |
| notification_email | string | No | Notification email |
| invoice_cc_emails | string | No | Invoice CC emails |
| invoice_term_id | integer | No | Invoice term ID |
| properties | object | No | Custom properties |
| consent | object | No | Consent settings |

**Response: 200 OK**

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

**Response: 422 Unprocessable Entity**

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

Deletes a Customer by ID.

**Endpoint:** `DELETE /customers/{id}`

**Required Permission:** Customers - Delete

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Customer ID |

**Response: 200 OK**

```json
{
  "message": "Customer was deleted from the system."
}
```

**Response: 404 Not Found**

#### Get Latest Customer

Returns latest Customer.

**Endpoint:** `GET /customers/latest`

**Required Permission:** Customers - Edit  
Single-Customer Users can only access own customer (self).

**Response: 200 OK**

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

#### Customer Autocomplete

Returns a paginated list of customers for autocomplete query.

**Endpoint:** `GET /customers/autocomplete`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query |

**Response: 200 OK**

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
