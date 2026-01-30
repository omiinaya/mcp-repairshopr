# RepairShopr API Documentation - Contacts

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

### Contacts

#### Get Contacts

Returns a paginated list of Contacts.

**Endpoint:** `GET /contacts`

**Required Permission:** Customers - View Detail  
Single-Customer Users can only access own contacts.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Any contacts attached to a Customer ID |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

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

**Response: 401 Unauthorized**

```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```

#### Create Contact

Creates a Contact.

**Endpoint:** `POST /contacts`

**Required Permission:** Customers - Edit  
Single-Customer Users can only access own contacts.

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| name | string | No | Contact name |
| address1 | string | No | Address line 1 |
| address2 | string | No | Address line 2 |
| city | string | No | City |
| state | string | No | State |
| zip | string | No | ZIP code |
| email | string | No | Email address |
| phone | string | No | Phone number |
| mobile | string | No | Mobile number |
| notes | string | No | Notes |

**Response: 200 OK**

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

**Response: 401 Unauthorized**

```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```

**Response: 404 Not Found**

```json
{
  "message": "Not found"
}
```

**Response: 422 Unprocessable Entity**

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

Retrieves a Contact by ID.

**Endpoint:** `GET /contacts/{id}`

**Required Permission:** Customers - View Detail  
Single-Customer Users can only access own contacts.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contact ID |

**Response: 200 OK**

**Response: 401 Unauthorized**

```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```

**Response: 404 Not Found**

```json
{
  "message": "Not found"
}
```

#### Update Contact

Updates an existing Contact.

**Endpoint:** `PUT /contacts/{id}`

**Required Permission:** Customers - Edit  
Single-Customer Users can only access own contacts.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contact ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Customer ID |
| name | string | Yes | Contact name |
| address1 | string | No | Address line 1 |
| address2 | string | No | Address line 2 |
| city | string | No | City |
| state | string | No | State |
| zip | string | No | ZIP code |
| email | string | No | Email address |
| phone | string | No | Phone number |
| title | string | No | Title |
| mobile | string | No | Mobile number |
| notes | string | No | Notes |

**Response: 200 OK**

**Response: 401 Unauthorized**

```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```

**Response: 404 Not Found**

```json
{
  "message": "Not found"
}
```

**Response: 422 Unprocessable Entity**

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

Deletes a Contact.

**Endpoint:** `DELETE /contacts/{id}`

**Required Permission:** Customers - Edit  
Single-Customer Users can only access own contacts.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contact ID |

**Response: 200 OK**

**Response: 401 Unauthorized**

```json
{
  "error": "Not authorized. Please ask account admin to update your group permissions."
}
```

**Response: 404 Not Found**
