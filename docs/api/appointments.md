# RepairShopr API Documentation - Appointments

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

### Appointments

#### Get Appointments

Returns a paginated list of Appointments.

**Endpoint:** `GET /appointments`

**Required Permission:** Appointments - View All (see-own never restricted)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date_from | string (date) | No | Returns Appointments that start after the date. Example "2019-01-25" |
| date_to | string (date) | No | Returns Appointments that start before the date. Example "2019-12-31" |
| mine | boolean | No | Return only current user's appointments |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

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

Creates an Appointment.

**Endpoint:** `POST /appointments`

**Required Permission:** No special permissions required

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| summary | string | Yes | Appointment summary |
| start_at | string (date-time) | Yes | Start date and time |
| description | string | No | Appointment description |
| user_ids | array[integer] | No | Array of user IDs |
| ticket_id | integer | No | Associated ticket ID |
| do_not_email | boolean | No | Do not send email |
| user_id | integer | No | User ID |
| end_at | string (date-time) | No | End date and time |
| location | string | No | Location |
| email_customer | boolean | No | Email customer |
| appointment_duration | string | No | Duration |
| appointment_type_id | integer | No | Appointment type ID |
| customer_id | integer | No | Customer ID |
| all_day | boolean | No | All day appointment |

**Response: 201 Created**

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

**Response: 422 Unprocessable Entity**

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

Retrieves an Appointment by ID.

**Endpoint:** `GET /appointments/{id}`

**Required Permission:** No special permissions required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment ID |

**Response: 200 OK**

```json
{
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
```

**Response: 404 Not Found**

#### Update Appointment

Updates an existing Appointment by ID.

**Endpoint:** `PUT /appointments/{id}`

**Required Permission:** No special permissions required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| description | string | No | Appointment description |
| user_ids | array[integer] | No | Array of user IDs |
| ticket_id | integer | No | Associated ticket ID |
| user_id | integer | No | User ID |
| start_at | string (date-time) | Yes | Start date and time |
| end_at | string (date-time) | No | End date and time |
| location | string | No | Location |
| summary | string | No | Appointment summary |
| email_customer | boolean | No | Email customer |
| appointment_duration | string | No | Duration |
| appointment_type_id | integer | No | Appointment type ID |
| customer_id | integer | No | Customer ID |
| all_day | boolean | No | All day appointment |

**Response: 200 OK**

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

**Response: 422 Unprocessable Entity**

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

Deletes an Appointment by ID.

**Endpoint:** `DELETE /appointments/{id}`

**Required Permission:** No special permissions required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment ID |

**Response: 200 OK**

**Response: 404 Not Found**
