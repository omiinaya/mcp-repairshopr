# RepairShopr API Documentation - Appointment

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Appointment

#### Get Appointments


Returns a paginated list of Appointments


Required permission: Appointments - View All (see-own never restricted)



**Endpoint:** `GET /appointments`


**Required Permission:** Required permission: Appointments - View All (see-own never restricted)


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date_from | string | No | Returns Appointments that start after the date. Example "2019-01-25" |
| date_to | string | No | Returns Appointments that start before the date. Example "2019-12-31" |
| mine | boolean | No | Return only current user's appointments |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |


**Response: 200**


successful


```json
{
  "appointments": [
    {
      "appointment": {
        "id": 3,
        "summary": "Appointment API",
        "description": "Notes:\n Appointment Description\n\n Contact: \nWalkin Customer \n\n Details: \nCustomer Information: \n Walkin Customer\n  Phone: 123 - walkin@somedomain.com",
        "customer_id": 1,
        "created_at": "2019-10-20T01:28:50.580Z",
        "updated_at": "2019-10-20T01:28:50.580Z",
        "start_at": "2019-10-21T01:28:00.000Z",
        "end_at": "2019-10-21T05:28:00.000Z",
        "duration": 4,
        "location": "In Shop",
        "ticket_id": null,
        "appointment_location_type": null,
        "start_at_label": "Sun 10-20-19 06:28 PM",
        "all_day": null,
        "ticket": null,
        "do_not_email": "1",
        "customer": {
          "id": 1,
          "firstname": "Walkin",
          "lastname": "Customer",
          "fullname": "Walkin Customer",
          "business_name": null,
          "email": "walkin@somedomain.com",
          "phone": "123",
          "mobile": null,
          "created_at": "2019-10-20T01:28:37.187Z",
          "updated_at": "2019-10-20T01:28:37.187Z",
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
          "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=dxbkw6x44de91dum7fua",
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
    }
  ]
}
```


#### Create Appointment


Creates an Appointment


No special permissions required.



**Endpoint:** `POST /appointments`


**Required Permission:** No special permissions required.


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| description | string | No |  |
| user_ids | array | No |  |
| ticket_id | integer | No |  |
| do_not_email | boolean | No |  |
| user_id | integer | No |  |
| start_at | string | Yes |  |
| end_at | string | No |  |
| location | string | No |  |
| summary | string | Yes |  |
| email_customer | boolean | No |  |
| appointment_duration | string | No |  |
| appointment_type_id | integer | No |  |
| customer_id | integer | No |  |
| all_day | boolean | No |  |



**Response: 201**


successful


```json
{
  "appointment": {
    "id": 3,
    "summary": "Appointment API",
    "description": "Notes:\n Appointment Description\n\n Contact: \nWalkin Customer \n\n Details: \nCustomer Information: \n Walkin Customer\n  Phone: 123 - walkin@somedomain.com",
    "customer_id": 1,
    "created_at": "2019-10-20T01:28:50.580Z",
    "updated_at": "2019-10-20T01:28:50.580Z",
    "start_at": "2019-10-21T01:28:00.000Z",
    "end_at": "2019-10-21T05:28:00.000Z",
    "duration": 4,
    "location": "In Shop",
    "ticket_id": null,
    "appointment_location_type": null,
    "start_at_label": "Sun 10-20-19 06:28 PM",
    "all_day": null,
    "ticket": null,
    "do_not_email": "1",
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-10-20T01:28:37.187Z",
      "updated_at": "2019-10-20T01:28:37.187Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=dxbkw6x44de91dum7fua",
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
}
```


**Response: 422**


Invalid request


```json
{
  "success": false,
  "error": "Summary can't be blank,Start at can't be blank,End at can't be blank",
  "message": "Summary can't be blank,Start at can't be blank,End at can't be blank",
  "params": {
    "description": "Incomplete appointment"
  }
}
```


#### Get Appointment by ID


Retrieves an Appointment by ID


No special permissions required.



**Endpoint:** `GET /appointments/{id}`


**Required Permission:** No special permissions required.


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "id": 0,
  "summary": "string",
  "description": "string",
  "customer_id": 0,
  "created_at": "string",
  "updated_at": "string",
  "start_at": "string",
  "end_at": "string",
  "duration": 0.0,
  "location": "string",
  "ticket_id": 0,
  "appointment_location_type": "string",
  "start_at_label": "string",
  "all_day": true,
  "ticket": {},
  "customer": {
    "id": 0,
    "firstname": "string",
    "lastname": "string",
    "fullname": "string",
    "business_name": "string",
    "email": "string",
    "phone": "string",
    "mobile": "string",
    "created_at": "string",
    "updated_at": "string",
    "pdf_url": "string",
    "address": "string",
    "address_2": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "latitude": 0.0,
    "longitude": 0.0,
    "notes": "string",
    "get_sms": true,
    "opt_out": true,
    "disabled": true,
    "no_email": true,
    "location_name": "string",
    "location_id": 0,
    "properties": {},
    "online_profile_url": "string",
    "referred_by": 0,
    "ref_customer_id": 0,
    "tax_rate_id": "string",
    "notification_email": "string",
    "invoice_cc_emails": "string",
    "invoice_term_id": "string",
    "business_and_full_name": "string",
    "business_then_name": "string",
    "contacts": {}
  }
}
```


**Response: 404**


Invalid request


#### Update Appointment


Updates an existing Appointment by ID


No special permissions required.



**Endpoint:** `PUT /appointments/{id}`


**Required Permission:** No special permissions required.


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| description | string | No |  |
| user_ids | array | No |  |
| ticket_id | integer | No |  |
| user_id | integer | No |  |
| start_at | string | Yes |  |
| end_at | string | No |  |
| location | string | No |  |
| summary | string | No |  |
| email_customer | boolean | No |  |
| appointment_duration | string | No |  |
| appointment_type_id | integer | No |  |
| customer_id | integer | No |  |
| all_day | boolean | No |  |



**Response: 200**


successful


```json
{
  "appointment": {
    "id": 3,
    "summary": "Appointment API",
    "description": "Notes:\n Appointment Description\n\n Contact: \nWalkin Customer \n\n Details: \nCustomer Information: \n Walkin Customer\n  Phone: 123 - walkin@somedomain.com",
    "customer_id": 1,
    "created_at": "2019-10-20T01:28:50.580Z",
    "updated_at": "2019-10-20T01:28:50.580Z",
    "start_at": "2019-10-21T01:28:00.000Z",
    "end_at": "2019-10-21T05:28:00.000Z",
    "duration": 4,
    "location": "In Shop",
    "ticket_id": null,
    "appointment_location_type": null,
    "start_at_label": "Sun 10-20-19 06:28 PM",
    "all_day": null,
    "ticket": null,
    "do_not_email": "1",
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-10-20T01:28:37.187Z",
      "updated_at": "2019-10-20T01:28:37.187Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=dxbkw6x44de91dum7fua",
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
}
```


**Response: 422**


Invalid request


```json
{
  "success": false,
  "error": "Summary can't be blank",
  "message": "Summary can't be blank",
  "params": {
    "summary": ""
  }
}
```


#### Delete Appointment


Deletes an Appointment by ID


No special permissions required.



**Endpoint:** `DELETE /appointments/{id}`


**Required Permission:** No special permissions required.


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


**Response: 404**


Invalid request

