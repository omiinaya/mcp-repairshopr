# RepairShopr API Documentation

**Version:** v1  
**OpenAPI Version:** 3.0.0

## Table of Contents

- [Introduction](#introduction)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Appointment Types](#appointment-types)
  - [Appointments](#appointments)
  - [Assets](#assets)
  - [Calls](#calls)
  - [Canned Responses](#canned-responses)
  - [Contacts](#contacts)
  - [Contracts](#contracts)
  - [Customers](#customers)
  - [Estimates](#estimates)
  - [Invoices](#invoices)
  - [Items](#items)
  - [Leads](#leads)
  - [Line Items](#line-items)
  - [New Ticket Forms](#new-ticket-forms)
  - [Payment Methods](#payment-methods)
  - [Payment Profiles](#payment-profiles)
  - [Payments](#payments)
  - [Phones](#phones)
  - [Portal Users](#portal-users)
  - [Products](#products)
  - [Product Serials](#product-serials)
  - [Purchase Orders](#purchase-orders)
  - [RMM Alerts](#rmm-alerts)
  - [Schedules](#schedules)
  - [Search](#search)
  - [Settings](#settings)
  - [Ticket Timers](#ticket-timers)
  - [Tickets](#tickets)
  - [Timelogs](#timelogs)
  - [User Devices](#user-devices)
  - [Users](#users)
  - [Vendors](#vendors)
  - [Wiki Pages](#wiki-pages)
  - [Worksheet Results](#worksheet-results)

---

## Introduction

Welcome to the official RepairShopr API Docs.

To use these docs, you will need an active RepairShopr account. You can sign up for one here: [RepairShopr](https://repairshopr.com)

If you already have an active account, fill in your subdomain below and then click "Authorize" and fill in your api-key. The key is specific to your user account so it is found on the your user profile page.

Please review the Terms of Service before using these docs and feel free to reach out with questions via the links below.

**Rate Limit:** 180 requests per minute per IP address on API Usage.

### Contact Information

- **Email:** help@repairshopr.com
- **Support URL:** https://feedback.repairshopr.com/
- **Terms of Service:** https://www.repairshopr.com/repairshopr-site-terms

### Additional Documentation

[Additional API Docs](https://feedback.repairshopr.com/knowledgebase/articles/376312-repairshopr-rest-api-build-custom-extensions-app)

---

## Authentication

The RepairShopr API uses Bearer Token authentication. Include your API key in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY
```

**Security Scheme:** `bearerAuth`  
**Type:** API Key  
**In:** Header  
**Name:** Authorization  
**Scheme:** Bearer

---

## API Endpoints

### Appointment Types

#### Get Appointment Types

Returns a paginated list of Appointment Types.

**Endpoint:** `GET /appointment_types`

**Required Permission:** Global Admin

**Response: 200 OK**

```json
{
  "appointment_types": [
    {
      "id": 1,
      "account_id": 1,
      "name": "Office Hours",
      "email_instructions": "string",
      "location_type": "manual_entry",
      "location_hard_code": null,
      "created_at": "2019-10-16T19:29:33.397Z",
      "updated_at": "2019-10-16T19:29:33.397Z",
      "buffer": null,
      "appointment_reminders_schedule_id": null
    }
  ]
}
```

#### Create Appointment Type

Creates an Appointment Type.

**Endpoint:** `POST /appointment_types`

**Required Permission:** Global Admin

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Appointment type name |
| email_instructions | string | No | Email instructions |
| location_type | integer | No | Location type |
| location_hard_code | string | No | Hard-coded location |

**Response: 200 OK**

```json
{
  "appointment_type": {
    "id": 1,
    "account_id": 1,
    "name": "Office Hours",
    "email_instructions": "string",
    "location_type": "manual_entry",
    "location_hard_code": null,
    "created_at": "2019-10-16T19:29:33.397Z",
    "updated_at": "2019-10-16T19:29:33.397Z",
    "buffer": null,
    "appointment_reminders_schedule_id": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "record": {
    "id": null,
    "account_id": 1,
    "name": "",
    "email_instructions": null,
    "location_type": null,
    "location_hard_code": null,
    "created_at": null,
    "updated_at": null,
    "buffer": null,
    "appointment_reminders_schedule_id": null
  },
  "errors": "Name can't be blank,Location type can't be blank"
}
```

#### Get Appointment Type by ID

Retrieves an Appointment Type by ID.

**Endpoint:** `GET /appointment_types/{id}`

**Required Permission:** Global Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment Type ID |

**Response: 200 OK**

```json
{
  "id": 1,
  "account_id": 1,
  "name": "Office Hours",
  "email_instructions": "string",
  "location_type": "manual_entry",
  "location_hard_code": null,
  "created_at": "2019-10-16T19:29:33.397Z",
  "updated_at": "2019-10-16T19:29:33.397Z",
  "buffer": null,
  "appointment_reminders_schedule_id": null
}
```

**Response: 404 Not Found**

#### Update Appointment Type

Updates an existing Appointment Type by ID.

**Endpoint:** `PUT /appointment_types/{id}`

**Required Permission:** Global Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment Type ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Appointment type name |
| email_instructions | string | No | Email instructions |
| location_type | integer | No | Location type |
| location_hard_code | string | No | Hard-coded location |

**Response: 200 OK**

**Response: 422 Unprocessable Entity**

#### Delete Appointment Type

Deletes an Appointment Type by ID.

**Endpoint:** `DELETE /appointment_types/{id}`

**Required Permission:** Global Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment Type ID |

**Response: 200 OK**

**Response: 404 Not Found**

---

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

---

### Assets

#### Get Assets

Returns a paginated list of Assets.

**Endpoint:** `GET /customer_assets`

**Required Permission:** Assets - List/Search  
Single-Customer Users can only access own assets.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| snmp_enabled | boolean | No | Any assets with SNMP enabled |
| customer_id | integer | No | Any assets attached to a Customer ID |
| asset_type_id | integer | No | Any assets attached to an Asset Type ID |
| query | string | No | Search query |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

```json
{
  "assets": [
    {
      "id": 7,
      "name": "New Name",
      "customer_id": 1,
      "contact_id": null,
      "created_at": "2019-10-21T04:40:27.117Z",
      "updated_at": "2019-10-21T04:40:27.190Z",
      "properties": {
        "OS": 4,
        "Size": "Medium"
      },
      "asset_type": "Dodrio",
      "asset_serial": "NewSerial",
      "external_rmm_link": null,
      "customer": {
        "id": 1,
        "firstname": "Walkin",
        "lastname": "Customer",
        "fullname": "Walkin Customer",
        "business_name": null,
        "email": "walkin@somedomain.com",
        "phone": "123",
        "mobile": null,
        "created_at": "2019-10-21T04:40:14.156Z",
        "updated_at": "2019-10-21T04:40:14.156Z",
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
        "location_id": null,
        "properties": {},
        "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=j2apoteiivxcuygw1nvc",
        "tax_rate_id": null,
        "notification_email": null,
        "invoice_cc_emails": null,
        "invoice_term_id": null,
        "referred_by": null,
        "ref_customer_id": null,
        "business_and_full_name": "Walkin Customer",
        "business_then_name": "Walkin Customer"
      },
      "rmm_links": [],
      "rmm_store": {
        "id": 4,
        "asset_id": 7,
        "account_id": 1,
        "triggers": {
          "bsod_triggered": "false",
          "time_triggered": "false",
          "no_av_triggered": "false",
          "defrag_triggered": "false",
          "firewall_triggered": "false",
          "app_crash_triggered": "false",
          "low_hd_space_triggered": "false",
          "smart_failure_triggered": "false",
          "device_manager_triggered": "false",
          "agent_offline_triggered": "false"
        },
        "windows_updates": {},
        "emsisoft": {},
        "general": {},
        "created_at": "2019-10-21T04:40:27.201Z",
        "updated_at": "2019-10-21T04:40:27.201Z",
        "override_alert_agent_offline_mins": null,
        "override_alert_agent_rearm_after_mins": null,
        "override_low_hd_threshold": null,
        "override_autoresolve_offline_alert": null
      },
      "address": {
        "id": 1,
        "name": "Home",
        "customer_id": 1,
        "address_type_id": 2,
        "address1": "123 main st",
        "address2": "address2",
        "city": "city",
        "state": "state",
        "zip": "11111",
        "latitude": null,
        "longitude": null,
        "created_at": "2019-10-21T04:40:27.201Z",
        "updated_at": "2019-10-21T04:40:27.201Z",
        "account_id": 1
      }
    }
  ]
}
```

#### Create Asset

Creates an Asset.

**Endpoint:** `POST /customer_assets`

**Required Permission:** Assets - Create  
Single-Customer Users can only access own assets.

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Asset name |
| asset_type_name | string | No | Asset type name |
| asset_type_id | integer | No | Asset type ID |
| properties | object | No | Asset properties |
| customer_id | integer | No | Customer ID |
| asset_serial | string | No | Asset serial number |

**Response: 200 OK**

```json
{
  "asset": {
    "id": 7,
    "name": "New Name",
    "customer_id": 1,
    "contact_id": null,
    "created_at": "2019-10-21T04:40:27.117Z",
    "updated_at": "2019-10-21T04:40:27.190Z",
    "properties": {
      "OS": 4,
      "Size": "Medium"
    },
    "asset_type": "Dodrio",
    "asset_serial": "NewSerial",
    "external_rmm_link": null,
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-10-21T04:40:14.156Z",
      "updated_at": "2019-10-21T04:40:14.156Z",
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
      "location_id": null,
      "properties": {},
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=j2apoteiivxcuygw1nvc",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer"
    },
    "rmm_links": [],
    "rmm_store": {
      "id": 4,
      "asset_id": 7,
      "account_id": 1,
      "triggers": {
        "bsod_triggered": "false",
        "time_triggered": "false",
        "no_av_triggered": "false",
        "defrag_triggered": "false",
        "firewall_triggered": "false",
        "app_crash_triggered": "false",
        "low_hd_space_triggered": "false",
        "smart_failure_triggered": "false",
        "device_manager_triggered": "false",
        "agent_offline_triggered": "false"
      },
      "windows_updates": {},
      "emsisoft": {},
      "general": {},
      "created_at": "2019-10-21T04:40:27.201Z",
      "updated_at": "2019-10-21T04:40:27.201Z",
      "override_alert_agent_offline_mins": null,
      "override_alert_agent_rearm_after_mins": null,
      "override_low_hd_threshold": null,
      "override_autoresolve_offline_alert": null
    },
    "address": {
      "id": 1,
      "name": "Home",
      "customer_id": 1,
      "address_type_id": 2,
      "address1": "123 main st",
      "address2": "address2",
      "city": "city",
      "state": "state",
      "zip": "11111",
      "latitude": null,
      "longitude": null,
      "created_at": "2019-10-21T04:40:27.201Z",
      "updated_at": "2019-10-21T04:40:27.201Z",
      "account_id": 1
    }
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Asset type can't be blank",
    "Name You must have an asset type first, please go create one"
  ],
  "params": {
    "name": "No type"
  }
}
```

#### Get Asset by ID

Retrieves an Asset by ID.

**Endpoint:** `GET /customer_assets/{id}`

**Required Permission:** Assets - View Details  
Single-Customer Users can only access own assets.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Asset ID |

**Response: 200 OK**

**Response: 404 Not Found**

#### Update Asset

Updates an existing Asset by ID.

**Endpoint:** `PUT /customer_assets/{id}`

**Required Permission:** Assets - Edit  
Single-Customer Users can only access own assets.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Asset ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Asset name |
| asset_type_name | string | No | Asset type name |
| asset_type_id | integer | No | Asset type ID |
| properties | object | No | Asset properties |
| customer_id | integer | No | Customer ID |
| asset_serial | string | No | Asset serial number |

**Response: 200 OK**

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Asset type can't be blank"
  ]
}
```

---

### Calls

#### Get Caller ID

Get Caller ID information.

**Endpoint:** `GET /callerid`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| did | string | Yes | Phone number |
| outbound | boolean | No | Outbound call |

**Response: 200 OK**

```json
{
  "data": {
    "name": "Walking Customer",
    "ticket_status": "Open"
  }
}
```

```json
"Walking Customer"
```

---

### Canned Responses

#### Get Canned Responses

Returns a list of Canned Responses with a query.

**Endpoint:** `GET /canned_responses`

**Required Permission:** Ticket Canned Responses - Manage

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query |

**Response: 200 OK**

```json
{
  "canned_responses": [
    {
      "id": 1,
      "title": "Test Canned Response",
      "body": "This is a test canned response",
      "subject": "Test Subject",
      "canned_response_category_id": 1,
      "category_name": "Test Category"
    }
  ]
}
```

#### Create Canned Response

Creates a new Canned Response.

**Endpoint:** `POST /canned_responses`

**Required Permission:** Ticket Canned Responses - Manage

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Canned response title |
| body | string | Yes | Canned response body |
| subject | string | No | Email subject |
| canned_response_category_id | integer | No | Category ID |

**Response: 201 Created**

#### Update Canned Response

Updates a Canned Response.

**Endpoint:** `PATCH /canned_responses/{id}`

**Required Permission:** Ticket Canned Responses - Manage

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Canned Response ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | No | Canned response title |
| body | string | No | Canned response body |
| subject | string | No | Email subject |
| canned_response_category_id | integer | No | Category ID |

**Response: 200 OK**

#### Delete Canned Response

Deletes a Canned Response.

**Endpoint:** `DELETE /canned_responses/{id}`

**Required Permission:** Ticket Canned Responses - Manage

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Canned Response ID |

**Response: 204 No Content**

#### Get Canned Response Settings

Returns the settings for Canned Responses.

**Endpoint:** `GET /canned_responses/settings`

**Required Permission:** Ticket Canned Responses - Manage  
Single-Customer Users can only access own canned responses.

**Response: 200 OK**

```json
{
  "canned_response_categories": [
    {
      "id": 1,
      "name": "Test Category"
    }
  ],
  "subjects": [
    "Test Subject",
    "Test Subject 2"
  ],
  "can_manage": true
}
```

---

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

---

### Contracts

#### Get Contracts

Returns a paginated list of Contracts.

**Endpoint:** `GET /contracts`

**Required Permission:** Contracts - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 50 results |

**Response: 200 OK**

```json
{
  "contracts": [
    {
      "id": 1,
      "account_id": 1,
      "customer_id": 1,
      "name": "Support Tier 1",
      "contract_amount": "30k",
      "start_date": "2019-10-23T00:00:00.000Z",
      "end_date": "2020-10-22T00:00:00.000Z",
      "primary_contact": null,
      "description": "Contract Description",
      "created_at": "2019-10-22T10:00:55.392Z",
      "updated_at": "2019-10-22T10:00:55.392Z",
      "status": "Opportunity",
      "likelihood": 30,
      "apply_to_all": false,
      "sla_id": null
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

#### Create Contract

Creates a Contract.

**Endpoint:** `POST /contracts`

**Required Permission:** Contracts - Edit

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| contract_amount | string | No | Contract amount |
| description | string | No | Contract description |
| start_date | string (date-time) | No | Start date |
| end_date | string (date-time) | No | End date |
| name | string | No | Contract name |
| primary_contact | string | No | Primary contact |
| status | string | No | Contract status |
| likelihood | integer | No | Likelihood percentage |
| apply_to_all | boolean | No | Apply to all |
| sla_id | integer | No | SLA ID |

**Response: 200 OK**

```json
{
  "id": 1,
  "account_id": 1,
  "customer_id": 1,
  "name": "Support Tier 1",
  "contract_amount": "30k",
  "start_date": "2019-10-23T00:00:00.000Z",
  "end_date": "2020-10-22T00:00:00.000Z",
  "primary_contact": null,
  "description": "Contract Description",
  "created_at": "2019-10-22T10:00:55.392Z",
  "updated_at": "2019-10-22T10:00:55.392Z",
  "status": "Opportunity",
  "likelihood": 30,
  "apply_to_all": false,
  "sla_id": null
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "record": {
    "id": null,
    "account_id": 1,
    "customer_id": null,
    "name": "No Customer",
    "contract_amount": null,
    "start_date": null,
    "end_date": null,
    "primary_contact": null,
    "description": "No Customer",
    "created_at": null,
    "updated_at": null,
    "status": "Opportunity",
    "likelihood": 0,
    "apply_to_all": false,
    "sla_id": null
  },
  "errors": "Customer can't be blank"
}
```

#### Get Contract by ID

Retrieves a Contract by ID.

**Endpoint:** `GET /contracts/{id}`

**Required Permission:** Contracts - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contract ID |

**Response: 200 OK**

```json
{
  "id": 1,
  "account_id": 1,
  "customer_id": 1,
  "name": "Support Tier 1",
  "contract_amount": "30k",
  "start_date": "2019-10-23T00:00:00.000Z",
  "end_date": "2020-10-22T00:00:00.000Z",
  "primary_contact": null,
  "description": "Contract Description",
  "created_at": "2019-10-22T10:00:55.392Z",
  "updated_at": "2019-10-22T10:00:55.392Z",
  "status": "Opportunity",
  "likelihood": 30,
  "apply_to_all": false,
  "sla_id": null
}
```

#### Update Contract

Updates an existing Contract by ID.

**Endpoint:** `PUT /contracts/{id}`

**Required Permission:** Contracts - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contract ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| contract_amount | string | No | Contract amount |
| description | string | No | Contract description |
| start_date | string (date-time) | No | Start date |
| end_date | string (date-time) | No | End date |
| name | string | No | Contract name |
| primary_contact | string | No | Primary contact |
| status | string | No | Contract status |
| likelihood | integer | No | Likelihood percentage |
| apply_to_all | boolean | No | Apply to all |
| sla_id | integer | No | SLA ID |

**Response: 200 OK**

**Response: 422 Unprocessable Entity**

```json
{
  "record": {
    "id": 1,
    "account_id": 1,
    "customer_id": 1,
    "name": "Support Tier 1",
    "contract_amount": "30k",
    "start_date": "2019-10-23T00:00:00.000Z",
    "end_date": "2020-10-22T00:00:00.000Z",
    "primary_contact": null,
    "description": "Contract Description",
    "created_at": "2019-10-22T10:00:55.392Z",
    "updated_at": "2019-10-22T10:00:55.392Z",
    "status": "Opportunity",
    "likelihood": 30,
    "apply_to_all": false,
    "sla_id": null
  },
  "errors": "Customer can't be blank"
}
```

#### Delete Contract

Deletes a Contract by ID.

**Endpoint:** `DELETE /contracts/{id}`

**Required Permission:** Contracts - Delete

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Contract ID |

**Response: 200 OK**

**Response: 404 Not Found**

---

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

---

### Estimates

#### Get Estimates

Returns a paginated list of Estimates.

**Endpoint:** `GET /estimates`

**Required Permission:** Estimates - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mine | boolean | No | Returns estimates that belong to the current user |
| status | string | No | Returns estimates with a given status. Possible values are 'approved' and 'declined'. |
| page | integer | No | Returns provided page of results, each 'page' contains 50 results |

**Response: 200 OK**

```json
{
  "estimates": [
    {
      "id": 1,
      "customer_id": 1,
      "customer_business_then_name": "Walkin Customer",
      "name": "MyString",
      "number": "MyString",
      "status": "Fresh",
      "created_at": "2019-10-22T11:45:33.866Z",
      "updated_at": "2019-10-22T11:45:33.866Z",
      "date": "2013-10-08T14:16:10.000Z",
      "subtotal": "9.99",
      "total": "9.99",
      "tax": "9.99",
      "ticket_id": null,
      "pdf_url": null,
      "location_id": null,
      "invoice_id": null,
      "employee": "MyString"
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create Estimate

Creates an Estimate.

**Endpoint:** `POST /estimates`

**Required Permission:** Estimates - Create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No | Estimate number |
| name | string | No | Estimate name |
| date | string (date-time) | No | Estimate date |
| customer_id | integer | Yes | Customer ID |
| note | string | No | Estimate note |
| status | string | No | Valid values are Fresh, Draft, Approved, Declined. |
| ticket_id | integer | No | Ticket ID |
| location_id | integer | No | Location ID |
| line_items | array | No | Array of Line Items |
| created_at | string (date-time) | No | Created at timestamp |
| updated_at | string (date-time) | No | Updated at timestamp |

**Response: 200 OK**

```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "name": "MyString",
    "number": "MyString",
    "status": "Fresh",
    "created_at": "2019-10-22T11:45:33.866Z",
    "updated_at": "2019-10-22T11:45:33.866Z",
    "date": "2013-10-08T14:16:10.000Z",
    "subtotal": "9.99",
    "total": "9.99",
    "tax": "9.99",
    "ticket_id": null,
    "pdf_url": null,
    "location_id": null,
    "invoice_id": null,
    "employee": "MyString"
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "customer_id": [
    "can't be blank"
  ],
  "date": [
    "can't be blank"
  ]
}
```

#### Get Estimate by ID

Retrieves an Estimate by ID or number.

**Endpoint:** `GET /estimates/{id}`

**Required Permission:** Estimates - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No | Estimate number is used when the server cannot find an Estimate by ID |

**Response: 200 OK**

```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "name": "MyString",
    "number": "MyString",
    "status": "Fresh",
    "created_at": "2019-10-22T11:45:33.866Z",
    "updated_at": "2019-10-22T11:45:33.866Z",
    "date": "2013-10-08T14:16:10.000Z",
    "subtotal": "9.99",
    "total": "9.99",
    "tax": "9.99",
    "ticket_id": null,
    "pdf_url": null,
    "location_id": null,
    "invoice_id": null,
    "employee": "MyString"
  }
}
```

#### Update Estimate

Updates an existing Estimate by ID.

**Endpoint:** `PUT /estimates/{id}`

**Required Permission:** Estimates - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | string | No | Estimate number |
| name | string | No | Estimate name |
| date | string (date-time) | No | Estimate date |
| customer_id | integer | No | Customer ID |
| note | string | No | Estimate note |
| status | string | No | Valid values are Fresh, Draft, Approved, Declined. |
| ticket_id | integer | No | Ticket ID |
| location_id | integer | No | Location ID |

**Response: 200 OK**

```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "name": "MyString",
    "number": "MyString",
    "status": "Fresh",
    "created_at": "2019-10-22T11:45:33.866Z",
    "updated_at": "2019-10-22T11:45:33.866Z",
    "date": "2013-10-08T14:16:10.000Z",
    "subtotal": "9.99",
    "total": "9.99",
    "tax": "9.99",
    "ticket_id": null,
    "pdf_url": null,
    "location_id": null,
    "invoice_id": null,
    "employee": "MyString"
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "date": [
    "can't be blank"
  ]
}
```

#### Delete Estimate

Deletes an Estimate by ID.

**Endpoint:** `DELETE /estimates/{id}`

**Required Permission:** Estimates - Delete

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Response: 200 OK**

```json
{
  "message": "1: We deleted # 123"
}
```

#### Print Estimate

Queues a print job for an Estimate.

**Endpoint:** `POST /estimates/{id}/print`

**Required Permission:** Estimates - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Response: 200 OK**

```json
{
  "message": "We queued up a print job"
}
```

#### Email Estimate

Sends an Estimate to a Customer.

**Endpoint:** `POST /estimates/{id}/email`

**Required Permission:** Estimates - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Response: 200 OK**

```json
{
  "message": "We queued up a print job"
}
```

#### Add Line Item to Estimate

Adds a Line Item to an Estimate.

**Endpoint:** `POST /estimates/{id}/line_items`

**Required Permission:** Estimates - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item | string | No | Item name |
| name | string | No | Name |
| product_id | integer | No | Product ID |
| quantity | integer | No | Quantity |

**Response: 200 OK**

```json
{
  "estimate": {
    "account_id": 1,
    "id": 11,
    "updated_at": "2019-10-25T11:31:02.793Z",
    "customer_id": 1,
    "employee": "MyString",
    "payment_type": "MyString",
    "number": "MyString",
    "labor": "9.99",
    "total": "0.0",
    "subtotal": "0.0",
    "tax": "0.0",
    "paid": false,
    "date": "2013-10-08T14:16:10.000Z",
    "status_date": "2013-10-08T14:16:10.000Z",
    "status_changed_by": null,
    "notax": false,
    "ticket_id": null,
    "note": "MyText",
    "category": "MyString",
    "hardwarecost": "0.0",
    "location_id": null,
    "pdf": {
      "url": null
    },
    "signature_data": "MyText",
    "signature_name": "MyString",
    "created_at": "2019-10-25T11:31:02.688Z",
    "invoice_id": null,
    "contact_id": null,
    "tax_rate_id": 1,
    "converted_at": null,
    "last_emailed": null,
    "status": "Fresh",
    "disabled": false,
    "signature_date": null,
    "multi_tax": null,
    "name": null
  },
  "line_item": {
    "id": 1,
    "created_at": "2019-10-25T11:31:02.763Z",
    "updated_at": "2019-10-25T11:31:02.763Z",
    "invoice_id": null,
    "item": "Manual Item",
    "name": "Item Name",
    "cost": "0.0",
    "price": "0.0",
    "quantity": "1.0",
    "product_id": null,
    "taxable": true,
    "discount_percent": null,
    "position": 1,
    "invoice_bundle_id": null,
    "discount_dollars": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "errors": "validation error: Item can't be blank"
}
```

#### Convert Estimate to Invoice

Convert an Estimate to an Invoice.

**Endpoint:** `POST /estimates/{id}/convert_to_invoice`

**Required permissions:** "Estimates - View Details" and "Invoices - Create"

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |

**Response: 200 OK**

```json
{
  "invoice": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "number": "1001",
    "created_at": "2019-10-25T11:53:10.575Z",
    "updated_at": "2019-10-25T11:53:10.609Z",
    "date": "2019-10-25T00:00:00.000Z",
    "due_date": "2019-10-25T00:00:00.000Z",
    "subtotal": "0.0",
    "total": "0.0",
    "tax": "0.0",
    "verified_paid": false,
    "tech_marked_paid": false,
    "ticket_id": null,
    "pdf_url": null,
    "is_paid": false,
    "location_id": null,
    "po_number": null,
    "contact_id": null,
    "note": null,
    "hardwarecost": "0.0"
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "error": "Validation failed: Item can't be blank, Name can't be blank"
}
```

#### Update Estimate Line Item

Updates a Line Item.

**Endpoint:** `PUT /estimates/{id}/line_items/{line_item_id}`

**Required Permission:** Estimates - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |
| line_item_id | integer | Yes | Line Item ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item | string | No | Item name |
| name | string | No | Name |
| product_id | integer | No | Product ID |
| quantity | integer | No | Quantity |

**Response: 200 OK**

```json
{
  "line_item": {
    "id": 3,
    "created_at": "2019-10-25T12:43:19.817Z",
    "updated_at": "2019-10-25T12:43:19.839Z",
    "invoice_id": null,
    "item": "New Updated Item",
    "name": "Some big thingy",
    "cost": "10.0",
    "price": "64.99",
    "quantity": "1.0",
    "product_id": null,
    "taxable": true,
    "discount_percent": null,
    "position": 1,
    "invoice_bundle_id": null,
    "discount_dollars": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "item": [
    "can't be blank"
  ]
}
```

#### Delete Estimate Line Item

Deletes a Line Item.

**Endpoint:** `DELETE /estimates/{id}/line_items/{line_item_id}`

**Required Permission:** Estimates - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Estimate ID |
| line_item_id | integer | Yes | Line Item ID |

**Response: 200 OK**

```json
{
  "estimate": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "number": "MyString",
    "status": "Fresh",
    "created_at": "2019-10-22T11:45:33.866Z",
    "updated_at": "2019-10-22T11:45:33.866Z",
    "date": "2013-10-08T14:16:10.000Z",
    "subtotal": "9.99",
    "total": "9.99",
    "tax": "9.99",
    "ticket_id": null,
    "pdf_url": null,
    "location_id": null,
    "invoice_id": null,
    "employee": "MyString"
  }
}
```

---

### Invoices

#### Get Invoices

Returns a paginated list of Invoices.

**Endpoint:** `GET /invoices`

**Required Permission:** Invoices - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| paid | boolean | No | Whether or not the returned list of invoices has been marked as paid |
| unpaid | boolean | No | Whether or not the returned list of invoices has been marked as unpaid |
| ticket_id | integer | No | Any invoices attached to a Ticket ID |
| since_updated_at | string | No | Any invoices updated since a date |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

```json
{
  "invoices": [
    {
      "id": 6,
      "customer_id": 2,
      "customer_business_then_name": "Wonk Donk",
      "number": "4444",
      "created_at": "2019-11-06T08:24:20.821Z",
      "updated_at": "2019-11-06T08:24:20.821Z",
      "date": "2019-11-06T00:00:00.000Z",
      "due_date": "2019-11-06T00:00:00.000Z",
      "subtotal": "0.0",
      "total": "0.0",
      "tax": "0.0",
      "verified_paid": false,
      "tech_marked_paid": false,
      "ticket_id": 1,
      "pdf_url": null,
      "is_paid": false,
      "location_id": null,
      "po_number": null,
      "contact_id": null,
      "note": null,
      "hardwarecost": null,
      "user_id": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create Invoice

Creates an Invoice.

**Endpoint:** `POST /invoices`

**Required Permission:** Invoices - Create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | No | Invoice ID |
| balance_due | integer | No | Balance due |
| customer_id | integer | Yes | Customer ID |
| number | string | Yes | Invoice number |
| date | string (date-time) | Yes | Invoice date |
| customer_business_then_name | string | No | Customer business then name |
| created_at | string (date-time) | No | Created at timestamp |
| updated_at | string (date-time) | No | Updated at timestamp |
| due_date | string (date) | No | Due date |
| subtotal | string | No | Subtotal |
| total | string | No | Total |
| tax | string | No | Tax |
| verified_paid | boolean | No | Verified paid status |
| tech_marked_paid | boolean | No | Tech marked paid status |
| ticket_id | integer | No | Ticket ID |
| pdf_url | string | No | PDF URL |
| location_id | integer | No | Location ID |
| po_number | string | No | Purchase order number |
| contact_id | integer | No | Contact ID |
| note | string | No | Invoice note |
| hardwarecost | number | No | Hardware cost |
| line_items | array | No | Array of line items |

**Response: 200 OK**

```json
{
  "invoice": {
    "id": 1,
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "number": "9999",
    "created_at": "2019-06-19T07:45:43.345Z",
    "updated_at": "2019-06-19T07:45:43.345Z",
    "date": "2019-06-19T00:00:00.000Z",
    "due_date": "2019-06-19T00:00:00.000Z",
    "subtotal": "0.0",
    "total": "0.0",
    "tax": "0.0",
    "verified_paid": false,
    "tech_marked_paid": false,
    "ticket_id": null,
    "pdf_url": null,
    "is_paid": false,
    "location_id": null,
    "po_number": null,
    "contact_id": null,
    "note": null,
    "hardwarecost": null,
    "user_id": 1
  }
}
```

**Response: 422 Unprocessable Entity**

#### Get Invoice by ID

Retrieves an Invoice by ID or Number.

**Endpoint:** `GET /invoices/{id}`

**Required Permission:** Invoices - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID or Number of Invoice to retrieve |

**Response: 200 OK**

```json
{
  "id": 1,
  "number": "9999",
  "date": "2019-06-19T00:00:00.000Z",
  "date_received": "2019-06-19T00:00:00.000Z",
  "customer_business_then_name": "Walkin Customer",
  "created_at": "2019-06-19T07:45:43.345Z",
  "updated_at": "2019-06-19T07:45:43.345Z",
  "due_date": "2019-06-19T00:00:00.000Z",
  "subtotal": "0.0",
  "total": "0.0",
  "tax": "0.0",
  "verified_paid": false,
  "tech_marked_paid": false,
  "ticket_id": null,
  "pdf_url": null,
  "is_paid": false,
  "location_id": null,
  "po_number": null,
  "contact_id": null,
  "note": null,
  "hardwarecost": null,
  "user_id": 1,
  "customer": {
    "id": 1,
    "firstname": "Walkin",
    "lastname": "Customer",
    "fullname": "Walkin Customer",
    "business_name": null,
    "email": "walkin@somedomain.com",
    "phone": "123",
    "mobile": null,
    "created_at": "2019-06-19T07:45:43.345Z",
    "updated_at": "2019-06-19T07:45:43.345Z",
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
  },
  "line_items": [],
  "payments": []
}
```

**Response: 404 Not Found**

#### Update Invoice

Updates an existing invoice by ID.

**Endpoint:** `PUT /invoices/{id}`

**Required Permission:** This updates an existing Invoice, all parameters overwrite existing params

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice to update |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Customer ID |
| number | string | No | Invoice number |
| date | string (date-time) | No | Invoice date |
| customer_business_then_name | string | No | Customer business then name |
| created_at | string (date-time) | No | Created at timestamp |
| updated_at | string (date-time) | No | Updated at timestamp |
| due_date | string (date) | No | Due date |
| subtotal | string | No | Subtotal |
| total | string | No | Total |
| tax | string | No | Tax |
| ticket_id | integer | No | Ticket ID |
| pdf_url | string | No | PDF URL |
| location_id | integer | No | Location ID |
| po_number | string | No | Purchase order number |
| contact_id | integer | No | Contact ID |
| note | string | No | Invoice note |
| hardwarecost | number | No | Hardware cost |

**Response: 200 OK**

```json
{
  "invoice": {
    "id": 3,
    "customer_id": 2,
    "customer_business_then_name": "Wonk Donk",
    "number": "1233",
    "created_at": "2019-07-01T21:37:26.051Z",
    "updated_at": "2019-07-01T21:37:26.204Z",
    "date": "2019-07-01T00:00:00.000Z",
    "due_date": "2019-07-01T00:00:00.000Z",
    "subtotal": "0.0",
    "total": "0.0",
    "tax": "0.0",
    "verified_paid": false,
    "tech_marked_paid": false,
    "ticket_id": null,
    "pdf_url": null,
    "is_paid": false,
    "location_id": null,
    "po_number": null,
    "contact_id": null,
    "note": null,
    "hardwarecost": "0.0"
  }
}
```

**Response: 404 Not Found**

#### Delete Invoice

Deletes an invoice by ID.

**Endpoint:** `DELETE /invoices/{id}`

**Required Permission:** Returns 200 even if the delete fails

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice to delete |

**Response: 200 OK**

**Response: 404 Not Found**

#### Add Invoice Line Item

Creates a new line item.

**Endpoint:** `POST /invoices/{id}/line_items`

**Required Permission:** Invoices - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice to update |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | No | Line item ID |
| line_discount_percent | integer | No | Line discount percent |
| discount_dollars | string | No | Discount dollars |
| item | string | No | Item name |
| name | string | No | Name |
| price | number | No | Price |
| cost | number | No | Cost |
| taxable | boolean | No | Taxable |

**Response: 200 OK**

**Response: 422 Unprocessable Entity**

#### Update Invoice Line Item

Updates an a line item of an invoice by ID.

**Endpoint:** `PUT /invoices/{id}/line_items/{line_item_id}`

**Required Permission:** This updates an existing Invoice's line item, all parameters overwrite existing params

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice to update |
| line_item_id | integer | Yes | ID of line item to update |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | No | Line item ID |
| line_discount_percent | integer | No | Line discount percent |
| discount_dollars | string | No | Discount dollars |
| item | string | No | Item name |
| name | string | No | Name |
| price | number | No | Price |
| cost | number | No | Cost |
| taxable | boolean | No | Taxable |

**Response: 200 OK**

**Response: 404 Not Found**

#### Delete Invoice Line Item

Deletes an a line item of an invoice by ID.

**Endpoint:** `DELETE /invoices/{id}/line_items/{line_item_id}`

**Required Permission:** This deletes an existing Invoice's line item

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice to delete |
| line_item_id | integer | Yes | ID of line item to update |

**Response: 200 OK**

```json
{
  "message": "Line item deleted"
}
```

**Response: 404 Not Found**

#### Get Invoice Ticket

Returns the associated ticket for an invoice.

**Endpoint:** `GET /invoices/{id}/ticket`

**Required permissions:** "Invoices - View Details" and "Tickets - View Details"

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice whose Ticket will be returned |

**Response: 200 OK**

```json
{
  "id": 1,
  "number": "1001",
  "subject": "Ticket Subject",
  "status": "New",
  "created_at": "2019-10-21T08:33:21.053Z",
  "updated_at": "2019-10-21T08:33:21.053Z",
  "customer_id": 1,
  "user_id": 1,
  "due_date": "2019-10-21T08:33:21.053Z"
}
```

**Response: 404 Not Found**

#### Print Invoice

Queues a print job for an invoice.

**Endpoint:** `POST /invoices/{id}/print`

**Required Permission:** Invoices - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | The ID of the Invoice to print |

**Response: 200 OK**

```json
{
  "message": "Invoice print job queued"
}
```

**Response: 404 Not Found**

#### Email Invoice

Sends invoice to customer.

**Endpoint:** `POST /invoices/{id}/email`

**Required Permission:** Invoices - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of Invoice which will be emailed |

**Response: 200 OK**

```json
{
  "message": "Invoice email sent"
}
```

**Response: 404 Not Found**

---

### Items

#### Get Items

Returns a paginated list of Part Orders.

**Endpoint:** `GET /items`

**Required Permission:** Parts Orders - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| completed | boolean | No | Returns only completed part orders |
| query | string | No | Search query |
| page | integer | No | Returns provided page of results, each 'page' contains 50 results |

**Response: 200 OK**

```json
{
  "items": [
    {
      "id": 1,
      "requestedon": "2019-09-28T13:18:39.513Z",
      "ticketnum": "123",
      "parturl": "https://amazon.com/",
      "shipping": null,
      "deststore": null,
      "orderedby": null,
      "orderedon": null,
      "trackingnum": "12345",
      "receivedon": null,
      "price": "0.0",
      "account_id": 1,
      "description": null,
      "destination_location_id": null,
      "from_location_id": null,
      "from_name": null,
      "received_at": null,
      "user_id": null,
      "created_at": "2019-10-28T14:18:39.515Z",
      "updated_at": "2019-10-28T14:18:39.515Z",
      "due_at": null,
      "ticket_id": null,
      "logistic_state": null,
      "product_id": null,
      "quantity": null,
      "round_trip": false,
      "trip_leg": null,
      "retail_cents": null,
      "taxable": true,
      "converted": false,
      "notes": null,
      "refurb_id": null,
      "invoice_id": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

---

### Leads

#### Get Leads

Returns a paginated list of Leads.

**Endpoint:** `GET /leads`

**Required Permission:** Leads - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| statuses | array[string] | No | Array of statuses. Possible values are "New", "Lead", "First Contact", "Opportunity", "Prospect", "Waiting on Client", "In Negotiation", "Pending", "Won", "Lost". |
| status_list | string | No | Comma separated list of statuses. |
| users | array[integer] | No | Array of user IDs. |
| mailbox_ids | array[integer] | No | Array of Mailbox IDs |
| has_ticket | boolean | No | Has ticket |
| query | string | No | Search query |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

```json
{
  "leads": [
    {
      "id": 1,
      "first_name": "Susy",
      "last_name": "Ratke",
      "email": "walkin@somedomain.com",
      "phone": "",
      "mobile": "",
      "created_at": "2019-10-23T06:49:14.560Z",
      "updated_at": "2019-10-23T06:49:14.560Z",
      "address": "",
      "city": "",
      "state": "",
      "zip": "",
      "ticket_subject": null,
      "ticket_description": null,
      "ticket_problem_type": null,
      "ticket_id": null,
      "customer_id": 1,
      "contact_id": null,
      "mailbox_id": null,
      "mailbox_name": null,
      "business_then_name": "Klocko-Stracke",
      "has_attachments": false,
      "message_read": false,
      "status": "New",
      "user_id": null,
      "location_id": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "total_entries": 1,
    "per_page": 25,
    "page": 1
  }
}
```

#### Create Lead

Creates a Lead.

**Endpoint:** `POST /leads`

**Required Permission:** None

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| address | string | No | Address |
| business_name | string | No | Business name |
| city | string | No | City |
| zip | string | No | ZIP code |
| converted | boolean | No | Converted status |
| message_read | boolean | No | Message read status |
| disabled | boolean | No | Disabled status |
| email | string | No | Email address |
| first_name | string | No | First name |
| last_name | string | No | Last name |
| mobile | string | No | Mobile number |
| phone | string | No | Phone number |
| state | string | No | State |
| ticket_description | string | No | Ticket description |
| ticket_problem_type | string | No | Ticket problem type |
| ticket_subject | string | No | Ticket subject |
| location_id | integer | No | Location ID |
| from_check_in | boolean | No | From check-in |
| customer_id | integer | No | Customer ID |
| ticket_id | integer | No | Ticket ID |
| hidden_notes | string | No | Hidden notes |
| contact_id | integer | No | Contact ID |
| appointment_time | string | No | Appointment time |
| status | string | No | Status |
| user_id | integer | No | User ID |
| ticket_type_id | integer | No | Ticket type ID |
| mailbox_id | integer | No | Mailbox ID |
| opportunity_start_date | string (date-time) | No | Opportunity start date |
| opportunity_amount_dollars | number | No | Opportunity amount in dollars |
| likelihood | integer | No | Likelihood percentage |
| properties | object | No | Properties |
| ticket_properties | object | No | Ticket properties |
| customer_purchase_id | integer | No | Customer purchase ID |
| signature_date | string (date-time) | No | Signature date |
| signature_name | string | No | Signature name |
| signature_data | string | No | Signature data |
| appointment_type_id | integer | No | Appointment type ID |

**Response: 200 OK**

```json
{
  "lead": {
    "id": 1,
    "first_name": "Susy",
    "last_name": "Ratke",
    "email": "walkin@somedomain.com",
    "phone": "",
    "mobile": "",
    "created_at": "2019-10-23T06:49:14.560Z",
    "updated_at": "2019-10-23T06:49:14.560Z",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "ticket_subject": null,
    "ticket_description": null,
    "ticket_problem_type": null,
    "ticket_id": null,
    "customer_id": 1,
    "contact_id": null,
    "mailbox_id": null,
    "mailbox_name": null,
    "business_then_name": "Klocko-Stracke",
    "has_attachments": false,
    "message_read": false,
    "status": "New",
    "user_id": null,
    "location_id": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Ticket description can't be blank"
  ],
  "params": {
    "from_check_in": true
  }
}
```

#### Get Lead by ID

Retrieves a Lead by ID.

**Endpoint:** `GET /leads/{id}`

**Required Permission:** Leads - List/Search

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Lead ID |

**Response: 200 OK**

```json
{
  "lead": {
    "id": 1,
    "first_name": "Susy",
    "last_name": "Ratke",
    "email": "walkin@somedomain.com",
    "phone": "",
    "mobile": "",
    "created_at": "2019-10-23T06:49:14.560Z",
    "updated_at": "2019-10-23T06:49:14.560Z",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "ticket_subject": null,
    "ticket_description": null,
    "ticket_problem_type": null,
    "ticket_id": null,
    "customer_id": 1,
    "contact_id": null,
    "mailbox_id": null,
    "mailbox_name": null,
    "business_then_name": "Klocko-Stracke",
    "has_attachments": false,
    "message_read": false,
    "status": "New",
    "user_id": null,
    "location_id": null
  }
}
```

**Response: 404 Not Found**

#### Update Lead

Updates an existing Lead by ID.

**Endpoint:** `PUT /leads/{id}`

**Required Permission:** None

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Lead ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| address | string | No | Address |
| business_name | string | No | Business name |
| city | string | No | City |
| zip | string | No | ZIP code |
| converted | boolean | No | Converted status |
| message_read | boolean | No | Message read status |
| disabled | boolean | No | Disabled status |
| email | string | No | Email address |
| first_name | string | No | First name |
| last_name | string | No | Last name |
| mobile | string | No | Mobile number |
| phone | string | No | Phone number |
| state | string | No | State |
| ticket_description | string | No | Ticket description |
| ticket_problem_type | string | No | Ticket problem type |
| ticket_subject | string | No | Ticket subject |
| location_id | integer | No | Location ID |
| from_check_in | boolean | No | From check-in |
| customer_id | integer | No | Customer ID |
| ticket_id | integer | No | Ticket ID |
| hidden_notes | string | No | Hidden notes |
| contact_id | integer | No | Contact ID |
| appointment_time | string | No | Appointment time |
| status | string | No | Status |
| user_id | integer | No | User ID |
| ticket_type_id | integer | No | Ticket type ID |
| mailbox_id | integer | No | Mailbox ID |
| opportunity_start_date | string (date-time) | No | Opportunity start date |
| opportunity_amount_dollars | number | No | Opportunity amount in dollars |
| likelihood | integer | No | Likelihood percentage |
| properties | object | No | Properties |
| ticket_properties | object | No | Ticket properties |
| customer_purchase_id | integer | No | Customer purchase ID |
| signature_date | string (date-time) | No | Signature date |
| signature_name | string | No | Signature name |
| signature_data | string | No | Signature data |
| appointment_type_id | integer | No | Appointment type ID |

**Response: 200 OK**

```json
{
  "lead": {
    "id": 1,
    "first_name": "Susy",
    "last_name": "Ratke",
    "email": "walkin@somedomain.com",
    "phone": "",
    "mobile": "",
    "created_at": "2019-10-23T06:49:14.560Z",
    "updated_at": "2019-10-23T06:49:14.560Z",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "ticket_subject": null,
    "ticket_description": null,
    "ticket_problem_type": null,
    "ticket_id": null,
    "customer_id": 1,
    "contact_id": null,
    "mailbox_id": null,
    "mailbox_name": null,
    "business_then_name": "Klocko-Stracke",
    "has_attachments": false,
    "message_read": false,
    "status": "New",
    "user_id": null,
    "location_id": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Ticket description can't be blank"
  ],
  "params": {
    "ticket_description": ""
  }
}
```

---

### Line Items

#### Get Line Items

Returns a paginated list of Line Items.

**Endpoint:** `GET /line_items`

**Required Permission:** Global Admin

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| invoice_id | integer | No | Returns Line Items that belong to an Invoice ID |
| estimate_id | integer | No | Returns Line Items that belong to an Estimate ID |
| invoice_id_not_null | boolean | No | Returns Line Items that belong to any Invoice |
| estimate_id_not_null | boolean | No | Returns Line Items that belong to any Estimate |

**Response: 200 OK**

```json
{
  "line_items": [
    {
      "id": 1,
      "created_at": "2019-10-28T14:38:47.864Z",
      "updated_at": "2019-10-28T14:38:47.864Z",
      "invoice_id": 1,
      "item": "Test Item",
      "name": "Some big thingy",
      "cost": "10.0",
      "price": "64.99",
      "quantity": "1.0",
      "product_id": null,
      "taxable": true,
      "discount_percent": null,
      "position": 1,
      "invoice_bundle_id": null,
      "discount_dollars": null
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

---

### New Ticket Forms

#### Get Ticket Forms

Returns a paginated list of Ticket Forms.

**Endpoint:** `GET /new_ticket_forms`

**Required Permission:** Ticket Workflows - Manage

**Response: 200 OK**

```json
{
  "new_ticket_forms": [
    {
      "id": 1,
      "name": "Phone Repair",
      "default": false,
      "disabled": false,
      "data": {
        "customer_details": {
          "fields": {
            "firstname": "require",
            "lastname": "require",
            "business_name": "show",
            "email": "show",
            "phone": "show",
            "address": "hide",
            "referred_by": "show",
            "tax_rate_id": "hide",
            "get_sms": "hide",
            "opt_out": "hide",
            "no_email": "hide",
            "send_portal_invitation": "hide",
            "notification_email": "hide",
            "invoice_cc_emails": "hide",
            "invoice_term_id": "hide",
            "custom_fields": "show"
          },
          "defaults": {
            "placeholder": ""
          },
          "position": "1"
        },
        "ticket_details": {
          "fields": {
            "subject": "require",
            "description": "require",
            "user_id": "show",
            "priority": "hide",
            "due_date": "hide",
            "problem_type": "require",
            "notify_emails": "hide",
            "category": "hide",
            "address_id": "hide",
            "contract_id": "hide",
            "sla_id": "hide",
            "ticket_type_id": "show",
            "do_not_email": "show",
            "isapproved": "hide",
            "pre_diagnosed": "hide"
          },
          "defaults": {
            "placeholder": "",
            "isapproved": "true",
            "pre_diagnosed": "true"
          },
          "disabled": [
            "subject",
            "problem_type"
          ],
          "position": "2"
        },
        "worksheets": {
          "position": "3"
        },
        "related_assets": {
          "position": "4"
        }
      }
    }
  ]
}
```

#### Get Ticket Form

Retrieves a Ticket Form.

**Endpoint:** `GET /new_ticket_forms/{id}`

**Required Permission:** Tickets - Create

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Ticket Form ID |

**Response: 200 OK**

```json
{
  "new_ticket_form": {
    "id": 1,
    "name": "Phone Repair",
    "default": false,
    "disabled": false,
    "data": {
      "customer_details": {
        "fields": {
          "firstname": "require",
          "lastname": "require",
          "business_name": "show",
          "email": "show",
          "phone": "show",
          "address": "hide",
          "referred_by": "show",
          "tax_rate_id": "hide",
          "get_sms": "hide",
          "opt_out": "hide",
          "no_email": "hide",
          "send_portal_invitation": "hide",
          "notification_email": "hide",
          "invoice_cc_emails": "hide",
          "invoice_term_id": "hide",
          "custom_fields": "show"
        },
        "defaults": {
          "placeholder": ""
        },
        "position": "1"
      },
      "ticket_details": {
        "fields": {
          "subject": "require",
          "description": "require",
          "user_id": "show",
          "priority": "hide",
          "due_date": "hide",
          "problem_type": "require",
          "notify_emails": "hide",
          "category": "hide",
          "address_id": "hide",
          "contract_id": "hide",
          "sla_id": "hide",
          "ticket_type_id": "show",
          "do_not_email": "show",
          "isapproved": "hide",
          "pre_diagnosed": "hide"
        },
        "defaults": {
          "placeholder": "",
          "isapproved": "true",
          "pre_diagnosed": "true"
        },
        "disabled": [
          "subject",
          "problem_type"
        ],
        "position": "2"
      },
      "worksheets": {
        "position": "3"
      },
      "related_assets": {
        "position": "4"
      }
    }
  }
}
```

**Response: 404 Not Found**

#### Process Ticket Form

Creates a new Ticket for a Ticket Form.

**Endpoint:** `POST /new_ticket_forms/{id}/process_form`

**Required Permission:** Tickets - Create

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Ticket Form ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_details | object | No | Customer details |
| ticket_details | object | No | Ticket details |
| appointments | object | No | Appointments |

**Response: 200 OK**

```json
{
  "ticket": {
    "id": 1,
    "customer_id": 2,
    "subject": "Ticket Subject",
    "status": "New",
    "problem_type": "Hardware",
    "created_at": "2019-10-29T12:05:24.322Z",
    "updated_at": "2019-10-29T12:05:24.382Z",
    "category": "Standard",
    "referredby": null,
    "isapproved": false,
    "memory": null,
    "upgradeoffered": false,
    "password": null,
    "cancelled": false,
    "power_adapter": false,
    "start_at": null,
    "end_at": null,
    "user_id": 1,
    "account_id": 1,
    "checkbox_results": null,
    "textbox_results": null,
    "due_date": "2019-11-01T12:05:24.314Z",
    "number": 4201,
    "location_id": null,
    "pdf": {
      "url": null
    },
    "signature_name": null,
    "signature_data": "",
    "gevent_id": null,
    "intake_form_pdf": {
      "url": null
    },
    "contact_id": null,
    "properties": {},
    "ticket_type_id": null,
    "priority": null,
    "notify_emails": null,
    "disabled": false,
    "ticket_recurring_schedule_id": null,
    "time_to_resolve_minutes": null,
    "original_customer_id": 2,
    "original_ticket_id": null,
    "sla_id": null,
    "contract_id": null,
    "address_id": null,
    "creator_id": null,
    "signature_date": null,
    "resolved_at": null,
    "all_notify_emails": null,
    "outtake_form_name": null,
    "outtake_form_data": null,
    "outtake_form_date": null,
    "custom_fields_cache": " ",
    "with_initial_issue_body": null,
    "with_items_any": null
  },
  "invoice": null,
  "redirect": "/tickets/1",
  "message": "Ticket created.."
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "errors": {
    "appointments": {
      "summary": [
        "can't be blank"
      ],
      "start_at": [
        "can't be blank"
      ],
      "end_at": [
        "can't be blank"
      ]
    }
  }
}
```

---

### Payment Methods

#### Get Payment Methods

Returns a paginated list of Payment Methods.

**Endpoint:** `GET /payment_methods`

**Description:** All Users except Single Customer Users may use this action.

**Response: 200 OK**

```json
{
  "payment_methods": [
    {
      "id": 1,
      "name": "Credit Card",
      "created_at": "2019-10-28T09:55:44.304Z",
      "updated_at": "2019-10-28T09:55:44.304Z",
      "uses_card_processing": false
    },
    {
      "id": 2,
      "name": "Cash",
      "created_at": "2019-10-28T09:55:44.307Z",
      "updated_at": "2019-10-28T09:55:44.307Z",
      "uses_card_processing": false
    },
    {
      "id": 3,
      "name": "Check",
      "created_at": "2019-10-28T09:55:44.309Z",
      "updated_at": "2019-10-28T09:55:44.309Z",
      "uses_card_processing": false
    },
    {
      "id": 4,
      "name": "Offline CC",
      "created_at": "2019-10-28T09:55:44.312Z",
      "updated_at": "2019-10-28T09:55:44.312Z",
      "uses_card_processing": false
    },
    {
      "id": 5,
      "name": "Quick",
      "created_at": "2019-10-28T09:55:44.316Z",
      "updated_at": "2019-10-28T09:55:44.316Z",
      "uses_card_processing": false
    },
    {
      "id": 6,
      "name": "Other",
      "created_at": "2019-10-28T09:55:44.319Z",
      "updated_at": "2019-10-28T09:55:44.319Z",
      "uses_card_processing": false
    }
  ]
}
```

---

### Payment Profiles

#### Get Payment Profiles

Returns a paginated list of Payment Profiles.

**Endpoint:** `GET /customers/{customer_id}/payment_profiles`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |

**Response: 200 OK**

```json
{
  "payment_profiles": [
    {
      "id": 1,
      "customer_id": 1,
      "expiration": "MyString",
      "customer_external_id": null,
      "used_gateway": "authorize_net",
      "payment_profile_id": 1,
      "last_four": "MyString",
      "created_at": "2019-10-25T07:11:31.903Z",
      "updated_at": "2019-10-25T07:11:31.903Z"
    }
  ]
}
```

#### Create Payment Profile

Creates a Payment Profile.

**Endpoint:** `POST /customers/{customer_id}/payment_profiles`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_external_id | string | No | Payment Gateway's Customer token |
| payment_profile_id | string | No | Payment Gateway's stored payment profile token |
| expiration | string | No | Expiration date |
| last_four | string | No | Last four digits |

**Response: 200 OK**

```json
{
  "payment_profile": {
    "id": 1,
    "customer_id": 1,
    "expiration": "MyString",
    "customer_external_id": null,
    "used_gateway": "authorize_net",
    "payment_profile_id": 1,
    "last_four": "MyString",
    "created_at": "2019-10-25T07:11:31.903Z",
    "updated_at": "2019-10-25T07:11:31.903Z"
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "message": "Account not configured to use integrated processing."
}
```

#### Get Payment Profile by ID

Retrieves a Payment Profile by ID.

**Endpoint:** `GET /customers/{customer_id}/payment_profiles/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| id | integer | Yes | Payment Profile ID |

**Response: 200 OK**

```json
{
  "payment_profile": {
    "id": 1,
    "customer_id": 1,
    "expiration": "MyString",
    "customer_external_id": null,
    "used_gateway": "authorize_net",
    "payment_profile_id": 1,
    "last_four": "MyString",
    "created_at": "2019-10-25T07:11:31.903Z",
    "updated_at": "2019-10-25T07:11:31.903Z"
  }
}
```

**Response: 404 Not Found**

#### Update Payment Profile

Updates a Payment Profile.

**Endpoint:** `PUT /customers/{customer_id}/payment_profiles/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| id | integer | Yes | Payment Profile ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| expiration | string | No | Expiration date |
| last_four | string | No | Last four digits |

**Response: 200 OK**

```json
{
  "payment_profile": {
    "id": 1,
    "customer_id": 1,
    "expiration": "MyString",
    "customer_external_id": null,
    "used_gateway": "authorize_net",
    "payment_profile_id": 1,
    "last_four": "MyString",
    "created_at": "2019-10-25T07:11:31.903Z",
    "updated_at": "2019-10-25T07:11:31.903Z"
  }
}
```

**Response: 404 Not Found**

#### Delete Payment Profile

Deletes a Payment Profile.

**Endpoint:** `DELETE /customers/{customer_id}/payment_profiles/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| id | integer | Yes | Payment Profile ID |

**Response: 200 OK**

```json
{
  "success": true
}
```

**Response: 404 Not Found**

---

### Payments

#### Get Payments

Returns a paginated list of Payments.

**Endpoint:** `GET /payments`

**Required Permission:** Payments - View List

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

```json
{
  "payments": [
    {
      "id": 1,
      "created_at": "2019-10-28T07:00:00.000Z",
      "updated_at": "2019-10-28T10:18:14.061Z",
      "success": true,
      "payment_amount": 100,
      "invoice_ids": [
        null
      ],
      "ref_num": "11006",
      "applied_at": "2019-10-26T00:00:00.000Z",
      "payment_method": "Check",
      "transaction_response": null,
      "signature_date": null,
      "customer": {
        "id": 1,
        "firstname": "Walkin",
        "lastname": "Customer",
        "fullname": "Walkin Customer",
        "business_name": null,
        "email": "walkin@somedomain.com",
        "phone": "123",
        "mobile": null,
        "created_at": "2019-10-28T10:17:58.224Z",
        "updated_at": "2019-10-28T10:17:58.224Z",
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
        "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=xw6sk8693f35nzgcb66o",
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
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create Payment

Creates a Payment.

**Endpoint:** `POST /payments`

**Required Permission:** Payments - Create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| invoice_id | integer | No | Invoice ID |
| invoice_number | string | No | Invoice number |
| amount_cents | integer | Yes | Payment amount in cents |
| address_street | string | No | Address street |
| address_city | string | No | Address city |
| address_zip | string | No | Address ZIP |
| payment_method | string | No | Payment method |
| ref_num | string | No | Reference number |
| register_id | integer | No | Register ID |
| signature_name | string | No | Signature name |
| signature_data | string | No | Signature data |
| signature_date | string (date-time) | No | Signature date |
| credit_card_number | string | No | Credit card number |
| date_month | string | No | Expiration month |
| date_year | string | No | Expiration year |
| cvv | string | No | CVV code |
| lastname | string | No | Last name |
| firstname | string | No | First name |
| apply_payments | object | No | Object where a key is an Invoice ID and a value is a payment amount to be applied to the invoice. |

**Response: 200 OK**

```json
{
  "payment": {
    "id": 3,
    "created_at": "2019-10-28T12:45:24.315Z",
    "updated_at": "2019-10-28T12:45:24.315Z",
    "success": true,
    "payment_amount": 10,
    "invoice_ids": [
      1
    ],
    "ref_num": null,
    "applied_at": "2019-10-28T00:00:00.000Z",
    "payment_method": null,
    "transaction_response": null,
    "tickets": []
  }
}
```

**Response: 422 Unprocessable Entity**

#### Get Payment by ID

Retrieves a Payment by ID.

**Endpoint:** `GET /payments/{id}`

**Required Permission:** Payments - View List

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Payment ID |

**Response: 200 OK**

```json
{
  "payment": {
    "id": 5,
    "created_at": "2019-10-28T07:00:00.000Z",
    "updated_at": "2019-10-28T13:05:27.257Z",
    "success": true,
    "payment_amount": 100,
    "invoice_ids": [
      null
    ],
    "ref_num": "11006",
    "applied_at": "2019-10-26T00:00:00.000Z",
    "payment_method": "Check",
    "transaction_response": null,
    "signature_date": null,
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-10-28T13:05:13.781Z",
      "updated_at": "2019-10-28T13:05:13.781Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=9rmh69dx953bbxmyxx3u",
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

**Response: 404 Not Found**

---

### Phones

#### Get Phones

Returns a paginated list of Phones.

**Endpoint:** `GET /customers/{customer_id}/phones`

**Required Permission:** Customers - View Detail  
Single-Customer Users can only access own.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |

**Response: 200 OK**

```json
{
  "phones": [
    {
      "id": 2,
      "label": "Mobile",
      "number": "111222333",
      "customer_id": 1,
      "created_at": "2019-10-28T15:07:49.764Z",
      "updated_at": "2019-10-28T15:07:49.764Z",
      "extension": null
    },
    {
      "id": 1,
      "label": "Phone",
      "number": "123",
      "customer_id": 1,
      "created_at": "2019-10-28T15:07:32:225Z",
      "updated_at": "2019-10-28T15:07:32.225Z",
      "extension": null
    }
  ]
}
```

#### Create Phone

Creates a Phone.

**Endpoint:** `POST /customers/{customer_id}/phones`

**Required Permission:** Customers - Edit  
Single-Customer Users can only access own.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| label | string | No | Phone label |
| number | string | Yes | Phone number |
| extension | string | No | Extension |

**Response: 200 OK**

```json
{
  "id": 4,
  "label": null,
  "number": "222000222",
  "customer_id": 1,
  "created_at": "2019-10-28T15:07:50.138Z",
  "updated_at": "2019-10-28T15:07:50.138Z",
  "extension": null
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Number can't be blank"
  ],
  "params": {
    "customer_id": "1",
    "number": ""
  }
}
```

#### Update Phone

Updates an existing Phone by ID.

**Endpoint:** `PUT /customers/{customer_id}/phones/{id}`

**Required Permission:** Customers - Edit  
Single-Customer Users can only access own.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| id | integer | Yes | Phone ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| label | string | No | Phone label |
| number | string | Yes | Phone number |
| extension | string | No | Extension |

**Response: 200 OK**

```json
{
  "id": 4,
  "label": null,
  "number": "222000222",
  "customer_id": 1,
  "created_at": "2019-10-28T15:07:50.138Z",
  "updated_at": "2019-10-28T15:07:50.138Z",
  "extension": null
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Number can't be blank"
  ],
  "params": {
    "customer_id": "1",
    "id": "9",
    "number": ""
  }
}
```

#### Delete Phone

Deletes a Phone by ID.

**Endpoint:** `DELETE /customers/{customer_id}/phones/{id}`

**Required Permission:** Customers - Edit  
Single-Customer Users can only access own.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| id | integer | Yes | Phone ID |

**Response: 200 OK**

**Response: 404 Not Found**

---

### Portal Users

#### Get Portal Users

Returns a paginated list of Portal Users.

**Endpoint:** `GET /portal_users`

**Required Permission:** Global Admin

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Returns Portal Users that belong to a Customer ID |
| email | string | No | Portal User email |
| page | integer | No | Returns provided page of results, each 'page' contains 100 results |

**Response: 200 OK**

```json
{
  "portal_users": [
    {
      "id": 1,
      "email": "katelyn@okuneva.name",
      "account_id": 1,
      "customer_id": 1,
      "contact_id": 1,
      "created_at": "2019-10-25T13:36:47.165Z",
      "updated_at": "2019-10-25T13:36:47.165Z",
      "portal_group_id": 4
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

#### Create Portal User

Creates a Portal User.

**Endpoint:** `POST /portal_users`

**Required Permission:** Global Admin

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| contact_id | integer | No | Contact ID |
| customer_id | integer | Yes | Customer ID |
| password | string | Yes | Password |
| password_confirmation | string | Yes | Password confirmation |
| email | string | Yes | Email address |
| portal_group_id | integer | No | Portal group ID |

**Response: 200 OK**

```json
{
  "id": 1,
  "email": "katelyn@okuneva.name",
  "account_id": 1,
  "customer_id": 1,
  "contact_id": 1,
  "created_at": "2019-10-25T13:36:47.165Z",
  "updated_at": "2019-10-25T13:36:47.165Z",
  "portal_group_id": 4
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Email can't be blank",
    "Password confirmation doesn't match Password"
  ],
  "params": {
    "customer_id": 1,
    "password": "does not match",
    "password_confirmation": "confirmation"
  }
}
```

#### Update Portal User

Updates an existing Portal User by ID.

**Endpoint:** `PUT /portal_users/{id}`

**Required Permission:** Global Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Portal User ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| contact_id | integer | No | Contact ID |
| customer_id | integer | Yes | Customer ID |
| password | string | Yes | Password |
| password_confirmation | string | Yes | Password confirmation |
| email | string | Yes | Email address |
| portal_group_id | integer | No | Portal group ID |

**Response: 200 OK**

```json
{
  "id": 1,
  "email": "katelyn@okuneva.name",
  "account_id": 1,
  "customer_id": 1,
  "contact_id": 1,
  "created_at": "2019-10-25T13:36:47.165Z",
  "updated_at": "2019-10-25T13:36:47.165Z",
  "portal_group_id": 4
}
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Password confirmation doesn't match Password"
  ],
  "params": {
    "password": "does not match",
    "password_confirmation": "the confirmation"
  }
}
```

#### Delete Portal User

Deletes a Portal User by ID.

**Endpoint:** `DELETE /portal_users/{id}`

**Required Permission:** Global Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Portal User ID |

**Response: 200 OK**

```json
{
  "id": 1,
  "email": "katelyn@okuneva.name",
  "account_id": 1,
  "customer_id": 1,
  "contact_id": 1,
  "created_at": "2019-10-25T13:36:47.165Z",
  "updated_at": "2019-10-25T13:36:47.165Z",
  "portal_group_id": 4
}
}
```

**Response: 404 Not Found**

#### Create Portal User Invitation

Creates an Invitation for a Portal User.

**Endpoint:** `POST /portal_users/create_invitation`

**Required Permission:** Global Admin

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Portal User ID |

**Response: 200 OK**

```json
{
  "success": true,
  "message": "All set, we BCC'd you on that invitation."
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": "Invalid email, correct the contact's email and try to resend."
}
```

---

### Products

#### Get Products

Returns a paginated list of Products.

**Endpoint:** `GET /products`

**Required Permission:** Products - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sort | string | No | A Product field to order by. Example "name ASC". |
| sku | string | No | Returns Products with the SKU. |
| name | string | No | Returns Products with the name. |
| upc_code | string | No | Returns Products with the UPC Code. |
| category_id | integer | No | Returns Products from the Category. |
| id | array[integer] | No | Any product with ID included in the list. |
| id_not | array[integer] | No | Any product with ID not included in the list. |
| query | string | No | Search query. |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results. |

**Response: 200 OK**

```json
{
  "products": [
    {
      "id": 1,
      "price_cost": 0.01,
      "price_retail": 0.01,
      "condition": null,
      "description": "Description #1",
      "maintain_stock": false,
      "name": "Product #1",
      "quantity": 100,
      "warranty": null,
      "sort_order": null,
      "reorder_at": null,
      "disabled": false,
      "taxable": true,
      "product_category": null,
      "category_path": null,
      "upc_code": null,
      "discount_percent": null,
      "warranty_template_id": null,
      "qb_item_id": 1,
      "desired_stock_level": null,
      "price_wholesale": 0,
      "notes": null,
      "tax_rate_id": null,
      "physical_location": null,
      "serialized": false,
      "vendor_ids": [],
      "long_description": null,
      "location_quantities": [],
      "photos": []
    }
  ]
}
```

#### Create Product

Creates a Product.

**Endpoint:** `POST /products`

**Required Permission:** Products - Create

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Product name |
| description | string | Yes | Product description |
| price_cost | number | No | Cost price |
| price_retail | number | No | Retail price |
| condition | string | No | Condition |
| maintain_stock | boolean | No | Maintain stock |
| quantity | integer | No | Quantity |
| warranty | string | No | Warranty |
| sort_order | integer | No | Sort order |
| reorder_at | integer | No | Reorder at quantity |
| disabled | boolean | No | Disabled status |
| taxable | boolean | No | Taxable |
| product_category | string | No | Product category |
| upc_code | string | No | UPC code |
| discount_percent | number | No | Discount percent |
| warranty_template_id | integer | No | Warranty template ID |
| qb_item_id | integer | No | QuickBooks item ID |
| desired_stock_level | integer | No | Desired stock level |
| price_wholesale | number | No | Wholesale price |
| notes | string | No | Notes |
| tax_rate_id | integer | No | Tax rate ID |
| vendor_ids | array[integer] | No | Vendor IDs |
| physical_location | string | No | Physical location |
| serialized | boolean | No | Serialized |
| category_ids | array[integer] | No | Category IDs |
| product_skus_attributes | array | No | SKU attributes |

**Response: 200 OK**

```json
{
  "product": {
    "id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "condition": null,
    "description": "Description #1",
    "maintain_stock": false,
    "name": "Product #1",
    "quantity": 100,
    "warranty": null,
    "sort_order": null,
    "reorder_at": null,
    "disabled": false,
    "taxable": true,
    "product_category": null,
    "category_path": null,
    "upc_code": null,
    "discount_percent": null,
    "warranty_template_id": null,
    "qb_item_id": 1,
    "desired_stock_level": null,
    "price_wholesale": 0,
    "notes": null,
    "tax_rate_id": null,
    "physical_location": null,
    "serialized": false,
    "vendor_ids": [],
    "long_description": null,
    "location_quantities": [],
    "photos": []
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Name can't be blank",
    "Description can't be blank"
  ],
  "params": {
    "name": "",
    "maintain_stock": false
  }
}
```

#### Get Product by ID

Retrieves a Product by ID.

**Endpoint:** `GET /products/{id}`

**Required Permission:** Products - List/Search

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

**Response: 200 OK**

```json
{
  "product": {
    "id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "condition": null,
    "description": "Description #1",
    "maintain_stock": false,
    "name": "Product #1",
    "quantity": 100,
    "warranty": null,
    "sort_order": null,
    "reorder_at": null,
    "disabled": false,
    "taxable": true,
    "product_category": null,
    "category_path": null,
    "upc_code": null,
    "discount_percent": null,
    "warranty_template_id": null,
    "qb_item_id": 1,
    "desired_stock_level": null,
    "price_wholesale": 0,
    "notes": null,
    "tax_rate_id": null,
    "physical_location": null,
    "serialized": false,
    "vendor_ids": [],
    "long_description": null,
    "location_quantities": [],
    "photos": []
  }
}
```

**Response: 404 Not Found**

#### Update Product

Updates an existing Product by ID.

**Endpoint:** `PUT /products/{id}`

**Required Permission:** Products - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Product name |
| description | string | Yes | Product description |
| price_cost | number | No | Cost price |
| price_retail | number | No | Retail price |
| condition | string | No | Condition |
| maintain_stock | boolean | No | Maintain stock |
| quantity | integer | No | Quantity |
| warranty | string | No | Warranty |
| sort_order | integer | No | Sort order |
| reorder_at | integer | No | Reorder at quantity |
| disabled | boolean | No | Disabled status |
| taxable | boolean | No | Taxable |
| product_category | string | No | Product category |
| upc_code | string | No | UPC code |
| discount_percent | number | No | Discount percent |
| warranty_template_id | integer | No | Warranty template ID |
| qb_item_id | integer | No | QuickBooks item ID |
| desired_stock_level | integer | No | Desired stock level |
| price_wholesale | number | No | Wholesale price |
| notes | string | No | Notes |
| tax_rate_id | integer | No | Tax rate ID |
| vendor_ids | array[integer] | No | Vendor IDs |
| physical_location | string | No | Physical location |
| serialized | boolean | No | Serialized |
| category_ids | array[integer] | No | Category IDs |
| product_skus_attributes | array | No | SKU attributes |

**Response: 200 OK**

```json
{
  "product": {
    "id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "condition": null,
    "description": "Description #1",
    "maintain_stock": false,
    "name": "Product #1",
    "quantity": 100,
    "warranty": null,
    "sort_order": null,
    "reorder_at": null,
    "disabled": false,
    "taxable": true,
    "product_category": null,
    "category_path": null,
    "upc_code": null,
    "discount_percent": null,
    "warranty_template_id": null,
    "qb_item_id": 1,
    "desired_stock_level": null,
    "price_wholesale": 0,
    "notes": null,
    "tax_rate_id": null,
    "physical_location": null,
    "serialized": false,
    "vendor_ids": [],
    "long_description": null,
    "location_quantities": [],
    "photos": []
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Name can't be blank"
  ]
}
```

#### Get Product by Barcode

Returns a Product by Barcode.

**Endpoint:** `GET /products/barcode`

**Required Permission:** Products - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| barcode | string | Yes | Product Barcode string |

**Response: 200 OK**

```json
{
  "product": {
    "id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "condition": null,
    "description": "Description #1",
    "maintain_stock": false,
    "name": "Product #1",
    "quantity": 100,
    "warranty": null,
    "sort_order": null,
    "reorder_at": null,
    "disabled": false,
    "taxable": true,
    "product_category": null,
    "category_path": null,
    "upc_code": null,
    "discount_percent": null,
    "warranty_template_id": null,
    "qb_item_id": 1,
    "desired_stock_level": null,
    "price_wholesale": 0,
    "notes": null,
    "tax_rate_id": null,
    "physical_location": null,
    "serialized": false,
    "vendor_ids": [],
    "long_description": null,
    "location_quantities": [],
    "photos": []
  }
}
```

#### Get Product Categories

Returns a paginated list of Product Categories.

**Endpoint:** `GET /products/categories`

**Required Permission:** Products - List/Search

**Response: 200 OK**

```json
{
  "categories": [
    {
      "id": 1,
      "account_id": 1,
      "ancestry": null,
      "name": "Root Category",
      "description": "Root Category",
      "device_product_id": null,
      "names_depth_cache": "Root Category"
    }
  ]
}
```

#### Add Product Images

Creates a Product Image.

**Endpoint:** `POST /products/{id}/add_images`

**Required Permission:** Products - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| files | array | No | Array of file objects with url and filename |

**Response: 200 OK**

```json
{
  "message": "Success! Those will be added shortly in background workers."
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "error": "Please pass 'url' & 'filename' or 'files([{}])' parameter."
}
```

#### Delete Product Image

Deletes a Product Image.

**Endpoint:** `DELETE /products/{id}/delete_image`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |
| photo_id | integer | No | Photo ID |

**Response: 200 OK**

```json
{
  "message": "Success! Image removed."
}
```

**Response: 404 Not Found**

```json
{
  "message": "Photo Not Found."
}
```

#### Update Location Quantity

Updates a Location Quantity.

**Endpoint:** `PUT /products/{id}/location_quantities`

**Required Permission:** Products - Edit Quantities

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Product ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location_quantity_id | integer | Yes | Location quantity ID |
| quantity | integer | Yes | Quantity |

**Response: 200 OK**

```json
{
  "product_id": 15,
  "id": 1,
  "quantity": 100,
  "price_cost_cents": null,
  "price_retail_cents": null,
  "location_id": 1,
  "tax_rate_id": null,
  "created_at": "2019-10-25T10:08:05.205Z",
  "updated_at": "2019-10-25T10:08:05.227Z",
  "reorder_at": null,
  "desired_stock_level": 0
}
```

---

### Product Serials

#### Get Product Serials

Returns a paginated list of Product_serials.

**Endpoint:** `GET /products/{product_id}/product_serials`

**Required Permission:** Products - List/Search

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | integer | Yes | Product ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Possible values reserved, sold, returned, in_transfer, breakage, used_in_refurb, in_stock |
| page | integer | No | Returns provided page of results, each 'page' contains 100 result |

**Response: 200 OK**

```json
{
  "product_serials": [
    {
      "id": 1,
      "created_at": "2019-10-24T07:32:07.656Z",
      "updated_at": "2019-10-24T07:32:07.656Z",
      "product_location_quantity_id": null,
      "line_item_id": null,
      "serial_number": "abcde345332z1",
      "status": "In Stock",
      "instance_price_cost": 0.01,
      "instance_price_retail": 0.01,
      "location_id": null
    }
  ]
}
```

#### Create Product Serial

Creates a Product Serial.

**Endpoint:** `POST /products/{product_id}/product_serials`

**Required Permission:** Products - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | integer | Yes | Product ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| condition | string | No | Condition |
| price_cost_cents | integer | No | Cost in cents |
| price_retail_cents | integer | No | Retail price in cents |
| serial_number | string | Yes | Serial number |

**Response: 200 OK**

```json
{
  "product_serial": {
    "id": 1,
    "created_at": "2019-10-24T07:32:07.656Z",
    "updated_at": "2019-10-24T07:32:07.656Z",
    "product_location_quantity_id": null,
    "line_item_id": null,
    "serial_number": "abcde345332z1",
    "status": "In Stock",
    "instance_price_cost": 0.01,
    "instance_price_retail": 0.01,
    "location_id": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Serial number scientific-notation not allowed, may have been introduced by a spreadsheet program inferring Numerical from a csv."
  ]
}
```

#### Update Product Serial

Updates an existing Product Serial by ID.

**Endpoint:** `PUT /products/{product_id}/product_serials/{id}`

**Required Permission:** Products - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | integer | Yes | Product ID |
| id | integer | Yes | Product Serial ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| condition | string | No | Condition |
| price_cost_cents | integer | No | Cost in cents |
| price_retail_cents | integer | No | Retail price in cents |
| serial_number | string | Yes | Serial number |
| notes | string | No | Notes |

**Response: 200 OK**

```json
{
  "product_serial": {
    "id": 1,
    "created_at": "2019-10-24T07:32:07.656Z",
    "updated_at": "2019-10-24T07:32:07.656Z",
    "product_location_quantity_id": null,
    "line_item_id": null,
    "serial_number": "abcde345332z1",
    "status": "In Stock",
    "instance_price_cost": 0.01,
    "instance_price_retail": 0.01,
    "location_id": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Serial number has already been taken"
  ]
}
```

#### Attach Product Serial to Line Item

Adds Product Serials to a Line Item.

**Endpoint:** `POST /products/{product_id}/product_serials/attach_to_line_item`

**Required Permission:** Products - List/Search  
Additional permissions required depending on "record_type":  
- LineItem: "Invoices - Edit" or "Estimates - Edit"  
- TicketLineItem: Tickets - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | integer | Yes | Product ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| record_type | string | Yes | Record type. Possible values: TransferLineItem, LineItem, ReturnLineItem, TicketLineItem, RefurbLineItem |
| line_item_id | integer | Yes | Line item ID |
| product_serial_ids | array[integer] | Yes | Product serial IDs |

**Response: 200 OK**

```json
{
  "status": "attached"
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "status": "attached",
  "errors": "One of the serial numbers has already been used. Please try again."
}
```

---

### Purchase Orders

#### Get Purchase Orders

Returns a paginated list of Purchase Orders.

**Endpoint:** `GET /purchase_orders`

**Required Permission:** Purchase Orders - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 20 results |

**Response: 200 OK**

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

Creates a Purchase Order.

**Endpoint:** `POST /purchase_orders`

**Required Permission:** Purchase Orders - Edit

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| discount_percent | integer | No | Discount percent |
| expected_date | string (date-time) | No | Expected date |
| general_notes | string | No | General notes |
| other_cents | integer | No | Other costs in cents |
| shipping_cents | integer | No | Shipping costs in cents |
| shipping_notes | string | No | Shipping notes |
| user_id | integer | No | User ID |
| vendor_id | integer | Yes | Vendor ID |
| location_id | integer | No | Location ID |
| due_date | string (date-time) | No | Due date |
| paid_date | string (date-time) | No | Paid date |
| order_date | string (date-time) | No | Order date |
| delivery_tracking | string | No | Delivery tracking URL |

**Response: 200 OK**

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
    "paid_date": "2019-11-15T00:00:00:00.000Z",
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

Retrieves a Purchase Order by ID.

**Endpoint:** `GET /purchase_orders/{id}`

**Required Permission:** Purchase Orders - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Purchase Order ID |

**Response: 200 OK**

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
    "paid_date": "2019-11-15T00:00:00:00.000Z",
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

**Response: 404 Not Found**

#### Receive Purchase Order

Receive purchase_order.

**Endpoint:** `POST /purchase_orders/{id}/receive`

**Required Permission:** Purchase Orders - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Purchase Order ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| line_item_id | integer | Yes | Line item ID |

**Response: 200 OK**

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

#### Add Product to Purchase Order

Adds a Product to a Purchase Order.

**Endpoint:** `POST /purchase_orders/{id}/create_po_line_item`

**Required Permission:** Purchase Orders - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Purchase Order ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | integer | Yes | Product ID |
| quantity | integer | Yes | Quantity |

**Response: 200 OK**

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

**Response: 422 Unprocessable Entity**

```json
{
  "errors": "Error adding that item  - please ensure that the item you are trying to add is set to ‘Maintain Stock’."
}
```

---

### RMM Alerts

#### Get RMM Alerts

Returns a paginated list of RMM Alerts.

**Endpoint:** `GET /rmm_alerts`

**Required Permission:** RMM Alerts - List  
Single-Customer Users can only access own RMM Alerts.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Possible values resolved, all, active. Default: active |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

```json
{
  "rmm_alerts": [
    {
      "id": 1,
      "customer_id": 0,
      "ticket_number": null,
      "ticket_status": null,
      "computer_name": "MyString",
      "properties": {},
      "resolved": false,
      "check_id": 1,
      "status": "MyString",
      "formatted_output": "MyText",
      "description": "MyText",
      "created_at": "2019-10-31T08:22:35.058Z",
      "updated_at": "2019-10-31T08:22:35.058Z",
      "asset_id": 1
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create RMM Alert

Creates an RMM Alert.

**Endpoint:** `POST /rmm_alerts`

**Required Permission:** RMM Alerts - Create  
Single-Customer Users can only access own RMM Alerts.

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Customer ID |
| asset_id | integer | No | Asset ID |
| description | string | No | Alert description |
| resolved | boolean | No | Resolved status |
| status | string | No | Alert status |
| properties | object | No | Alert properties |

**Response: 201 Created**

```json
{
  "success": true,
  "alert": {
    "id": 3,
    "account_id": 1,
    "customer_id": 1,
    "computer_name": null,
    "properties": {},
    "resolved": false,
    "check_id": null,
    "status": null,
    "formatted_output": null,
    "description": "RMM Alert Description",
    "created_at": "2020-08-04T12:19:25.754Z",
    "updated_at": "2020-08-04T12:19:25.754Z",
    "ticket_id": null,
    "asset_id": 2
  }
}
```

#### Mute RMM Alert

Mutes an RMM Alert by ID.

**Endpoint:** `POST /rmm_alerts/{id}/mute`

**Required Permission:** RMM Alerts - Clear/Manage  
Single-Customer Users can only access own RMM Alerts.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | RMM Alert ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mute_for | string | Yes | Length of time to mute alert for. Accepted values: '1-hour', '1-day', '2-days', '1-week', '2-weeks', '1-month', 'forever' |

**Response: 200 OK**

```json
{
  "success": "true"
}
```

**Response: 404 Not Found**

**Response: 422 Unprocessable Entity**

#### Get RMM Alert by ID

Retrieves an RMM Alert by ID.

**Endpoint:** `GET /rmm_alerts/{id}`

**Required Permission:** RMM Alerts - List  
Single-Customer Users can only access own RMM Alerts.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | RMM Alert ID |

**Response: 200 OK**

```json
{
  "rmm_alert": {
    "id": 1,
    "customer_id": 0,
    "ticket_number": null,
    "ticket_status": null,
    "computer_name": "MyString",
    "properties": {},
    "resolved": false,
    "check_id": 1,
    "status": "MyString",
    "formatted_output": "MyText",
    "description": "MyText",
    "created_at": "2019-10-31T08:22:35.058Z",
    "updated_at": "2019-10-31T08:22:35.058Z",
    "asset_id": 1
  }
}
```

**Response: 404 Not Found**

#### Delete RMM Alert

Deletes/Clears an RMM Alert by ID.

**Endpoint:** `DELETE /rmm_alerts/{id}`

**Required Permission:** RMM Alerts - Delete  
Single-Customer Users can only access own RMM Alerts.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | RMM Alert ID |

**Response: 200 OK**

```json
{
  "success": "true"
}
```

**Response: 404 Not Found**

---

### Schedules

#### Get Invoice Schedules

Returns a paginated list of Invoice Schedules.

**Endpoint:** `GET /schedules`

**Required Permission:** Recurring Invoices - List

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Returns a list of Schedules that belong to a Customer ID |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |

**Response: 200 OK**

```json
{
  "schedules": [
    {
      "id": 1,
      "account_id": 1,
      "customer_id": 1,
      "email_customer": false,
      "frequency": "Daily",
      "name": "MyString",
      "next_run": "2016-01-01T00:00:00.000Z",
      "snail_mail": false,
      "charge_mop": false,
      "subtotal": 0,
      "invoice_unbilled_ticket_charges": false,
      "paused": false,
      "last_invoice_paid": null,
      "lines": []
    }
  ]
}
```

#### Create Invoice Schedule

Creates an Invoice Schedule.

**Endpoint:** `POST /schedules`

**Required Permission:** Recurring Invoices - New

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| email_customer | boolean | No | Email customer |
| frequency | string | Yes | Frequency. Possible values: Daily, Monthly, Weekly, Biweekly, Quarterly, Semi-Annually, Annually, Biennially, Triennially |
| name | string | Yes | Schedule name |
| next_run | string (date) | Yes | Next run date |
| snail_mail | boolean | No | Snail mail |
| charge_mop | boolean | No | Charge MOP |
| invoice_unbilled_ticket_charges | boolean | No | Invoice unbilled ticket charges |
| paused | boolean | No | Paused |

**Response: 200 OK**

```json
{
  "schedule": {
    "id": 1,
    "account_id": 1,
    "customer_id": 1,
    "email_customer": false,
    "frequency": "Daily",
    "name": "MyString",
    "next_run": "2016-01-01T00:00:00.000Z",
    "snail_mail": false,
    "charge_mop": false,
    "subtotal": 0,
    "invoice_unbilled_ticket_charges": false,
    "paused": false,
    "last_invoice_paid": null,
    "lines": []
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "error": [
    "Frequency Must be a valid selection",
    "Frequency can't be blank",
    "Next run can't be blank",
    "Name can't be blank",
    "Customer can't be blank"
  ]
}
```

#### Get Schedule by ID

Retrieves a Schedule by ID.

**Endpoint:** `GET /schedules/{id}`

**Required Permission:** Recurring Invoices - List

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Schedule ID |

**Response: 200 OK**

```json
{
  "schedule": {
    "id": 1,
    "account_id": 1,
    "customer_id": 1,
    "email_customer": false,
    "frequency": "Daily",
    "name": "MyString",
    "next_run": "2016-01-01T00:00:00.000Z",
    "snail_mail": false,
    "charge_mop": false,
    "subtotal": 0,
    "invoice_unbilled_ticket_charges": false,
    "paused": false,
    "last_invoice_paid": null,
    "lines": []
  }
}
```

**Response: 404 Not Found**

#### Update Schedule

Updates an existing Invoice Schedule by ID.

**Endpoint:** `PUT /schedules/{id}`

**Required Permission:** Recurring Invoices - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Schedule ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | Yes | Customer ID |
| email_customer | boolean | No | Email customer |
| frequency | string | Yes | Frequency. Possible values: Daily, Monthly, Weekly, Biweekly, Quarterly, Semi-Annually, Annually, Biennially, Triennially |
| name | string | Yes | Schedule name |
| next_run | string (date) | Yes | Next run date |
| snail_mail | boolean | No | Snail mail |
| charge_mop | boolean | No | Charge MOP |
| invoice_unbilled_ticket_charges | boolean | No | Invoice unbilled ticket charges |
| paused | boolean | No | Paused |

**Response: 200 OK**

```json
{
  "schedule": {
    "id": 1,
    "account_id": 1,
    "customer_id": 1,
    "email_customer": false,
    "frequency": "Daily",
    "name": "MyString",
    "next_run": "2016-01-01T00:00:00.000Z",
    "snail_mail": false,
    "charge_mop": false,
    "subtotal": 0,
    "invoice_unbilled_ticket_charges": false,
    "paused": false,
    "last_invoice_paid": null,
    "lines": []
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "error": [
    "Next run can't be blank"
  ]
}
```

#### Delete Schedule

Deletes a Schedule by ID.

**Endpoint:** `DELETE /schedules/{id}`

**Required Permission:** Recurring Invoices - Delete

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Schedule ID |

**Response: 200 OK**

**Response: 404 Not Found**

#### Add Line Item to Schedule

Adds a Line Item to an Invoice Schedule.

**Endpoint:** `POST /schedules/{id}/add_line_item`

**Required Permission:** Recurring Invoices - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Schedule ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | integer | No | Product ID |
| cost_cents | integer | No | Cost in cents |
| description | string | No | Description |
| name | string | Yes | Name |
| position | integer | No | Position |
| quantity | number | No | Quantity |
| retail_cents | integer | No | Retail price in cents |
| one_time_charge | boolean | No | One time charge |
| taxable | boolean | No | Taxable |
| user_id | integer | No | User ID |
| asset_type_id | integer | No | Asset type ID |
| contact_field_type_id | integer | No | Contact field type ID |
| contact_field_answer_id | integer | No | Contact field answer ID |
| recurring_type_id | integer | No | Recurring type ID. Possible values: 1, 2, 3, 4, 5, 6 |
| saved_asset_search_id | integer | No | Saved asset search ID |

**Response: 200 OK**

```json
{
  "schedule_line_item": {
    "id": 1,
    "cost_cents": 0,
    "description": "Description",
    "name": "Name",
    "position": 0,
    "product_id": null,
    "quantity": "0.0",
    "retail_cents": 0,
    "user_id": 1,
    "price_cost": 0,
    "price_retail": 0,
    "product_category": null,
    "asset_type_id": null,
    "recurring_type_id": null,
    "device_ids": [],
    "one_time_charge": false
  }
}
```

**Response: 422 Unprocessable Entity**

```json
{
  "error": [
    "Name can't be blank"
  ]
}
```

#### Remove Line Item from Schedule

Removes a Line Item from an Invoice Schedule.

**Endpoint:** `POST /schedules/{id}/remove_line_item`

**Required Permission:** Recurring Invoices - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Schedule ID |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| line_item_id | integer | Yes | Line item ID |

**Response: 200 OK**

**Response: 404 Not Found**

#### Update Schedule Line Item

Updates a Line Item.

**Endpoint:** `PUT /schedules/{id}/line_items/{schedule_line_item_id}`

**Required Permission:** Recurring Invoices - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Schedule ID |
| schedule_line_item_id | integer | Yes | ID of line item to update |

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| product_id | integer | No | Product ID |
| cost_cents | integer | No | Cost in cents |
| description | string | No | Description |
| name | string | Yes | Name |
| position | integer | No | Position |
| quantity | number | No | Quantity |
| retail_cents | integer | No | Retail price in cents |
| one_time_charge | boolean | No | One time charge |
| taxable | boolean | No | Taxable |
| user_id | integer | No | User ID |
| asset_type_id | integer | No | Asset type ID |
| contact_field_type_id | integer | No | Contact field type ID |
| contact_field_answer_id | integer | No | Contact field answer ID |
| recurring_type_id | integer | No | Recurring type ID. Possible values: 1, 2, 3, 4, 5, 6 |

**Response: 200 OK**

```json
{
  "schedule_line_item": {
    "id": 3,
    "cost_cents": 1,
    "description": "MyText",
    "name": "Updated Name",
    "position": 1,
    "product_id": 1,
    "quantity": "9.99",
    "retail_cents": 1,
    "user_id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "product_category": null,
    "asset_type_id": null,
    "recurring_type_id": null,
    "saved_asset_search_id": null
  }
}
```

**Response: 422 Unprocessable Entity**

```json
  "error": [
    "Name can't be blank"
  ]
}
```

---

### Search

#### Search All the Things

Search all the things.

**Endpoint:** `GET /search`

**Additional permissions required depending on search results type:  
- Customer, Contact, Asset: "Customers - List/Search"  
- Lead: Leads - List/Search  
- Invoice: Invoices - List/Search  
- Estimate: Estimates - List/Search  
- Ticket: Tickets - List/Search  
- Product: Products - List/Search  
- Purchase Order, Vendor: Purchase Orders - List/Search  
- Report: Reports - View  
- Wiki: Documentation - Allow Usage  

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | integer | Yes | Search query |

**Response: 200 OK**

```json
{
  "quick_result": null,
  "results": [
    {
      "table": {
        "_id": 1,
        "_type": "customer",
        "_index": "customers",
        "_source": {
          "table": {
            "firstname": "Walkin",
            "lastname": "Customer",
            "email": "walkin@somedomain.com",
            "business_name": null,
            "phones": [
              {
                "id": 1,
                "label": "Phone",
                "number": "123",
                "customer_id": 1,
                "created_at": "2019-11-01T09:13:58.626Z",
                "updated_at": "2019-11-01T09:13:58.626Z",
                "extension": null
              }
            ]
          }
        }
      }
    }
  ],
  "error": null
}
```

---

### Settings

#### Get Account Settings

Returns a list of Account Settings.

**Endpoint:** `GET /settings`

**Response: 200 OK**

```json
{
  "customers": {
    "required_fields": null,
    "customer_fields": [],
    "customer_field_answers": []
  },
  "assets": {
    "asset_types": [],
    "asset_type_fields": [],
    "asset_type_field_answers": []
  },
  "locale": {
    "iso_code": "en",
    "currency_symbol": "$",
    "date_format": "mm-dd-yy",
    "time_format": "hh:mm tt",
    "time_zone": "America/Los_Angeles",
    "time_offset": "-08:00"
  },
  "ticket": {
    "ticket_types": [],
    "ticket_type_fields": [],
    "ticket_type_field_answers": [],
    "problem_types": [
      "Virus",
      "TuneUp",
      "Hardware",
      "Software",
      "Other"
    ],
    "priorities": [
      "",
      "0 Urgent",
      "1 High",
      "2 Normal",
      "3 Low"
    ]
  },
  "business_hours_enabled": true,
  "business_hours": [
    {
      "day": "Sunday",
      "start": "09:00",
      "end": "17:00",
      "closed": false
    },
    {
      "day": "Monday",
      "start": "09:00",
      "end": "17:00",
      "closed": false
    },
    {
      "day": "Tuesday",
      "start": "09:00",
      "end": "17:00",
      "closed": false
    },
    {
      "day": "Wednesday",
      "start": "09:00",
      "end": "17:00",
      "closed": false
    },
    {
      "day": "Thursday",
      "start": "09:00",
      "end": "17:00",
      "closed": false
    },
    {
      "day": "Friday",
      "start": "09:00",
      "end": "17:00",
      "closed": false
    },
    {
      "day": "Saturday",
      "start": "09:00",
      "end": "17:00",
      "closed": false
    }
  ],
  "default_holiday_calendar": "USA",
  "msp_addon": null
}
```

#### Get Tabs Settings

Returns Tabs Settings.

**Endpoint:** `GET /settings/tabs`

**Response: 200 OK**

```json
{
  "tabs": {
    "msp_dashboard": true,
    "customers": true,
    "assets": false,
    "alerts": false,
    "contracts": false,
    "invoices": true,
    "customer_purchases": false,
    "refurbs": false,
    "estimates": true,
    "tickets": true,
    "parts": true,
    "products": true,
    "purchase_orders": false,
    "field_jobs": true,
    "kabuto_policies": true,
    "scripts": true,
    "sales": true
  }
}
    
### Tickets

#### Get Tickets

Returns a paginated list of Tickets

**Endpoint:** `GET /tickets`

**Required Permission:** Tickets - List/Search
Single-Customer Users can only access own tickets.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Any Ticket with customer_id equal to the parameter. |
| contact_id | integer | No | Any Ticket with contact_id equal to the parameter. |
| number | string | No | Any Ticket with number equal to the parameter. |
| resolved_after | string | No | Returns Tickets resolved after the date. Example "2019-01-23". |
| created_after | string | No | Returns Tickets created after the date. Example "2019-02-25". |
| since_updated_at | string | No | Returns Tickets updated after the date. Example "2019-02-25". |
| status | string | No | Any Ticket with status equal to the parameter. Examples "New", "In Progress", "Resolved", "Invoiced", "Waiting for Parts", "Waiting on Customer", "Scheduled", "Customer Reply", "Not Closed". |
| query | string | No | Search query |
| user_id | integer | No | Any Ticket assigned to a User ID |
| mine | boolean | No | Any Ticket assigned to the current user |
| ticket_search_id | integer | No | Returns results of a Ticket Search |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |
| comment_format | string | No | Returns comments in the specified format. Allowed values: 'plaintext', 'richtext', 'original'. Defaults to 'plaintext'. |
| all_comments | boolean | No | When set to true, includes all ticket comments in the resposne, when set to false, only the initial comment is returned. Defaults to true. Default value will be changed to false in the near future. |
**Response: 200 OK**

```json
{
  "tickets": [
    {
      "id": 1,
      "number": 1,
      "subject": "Some major problem",
      "created_at": "2019-11-04T08:59:31.034Z",
      "customer_id": 1,
      "customer_business_then_name": "Walkin Customer",
      "due_date": "2019-11-04T08:59:31.016Z",
      "resolved_at": null,
      "start_at": null,
      "end_at": null,
      "location_id": null,
      "location_name": null,
      "problem_type": "Virus",
      "status": "New",
      "ticket_type_id": 1,
      "ticket_type_name": "Hardware",
      "properties": {},
      "user_id": null,
      "updated_at": "2019-11-04T08:59:31.034Z",
      "pdf_url": null,
      "priority": null,
      "billing_status": null,
      "tag_list": [],
      "sla_name": null,
      "creator_name_or_email": null,
      "contact_fullname": null,
      "contract_name": null,
      "address_id": null,
      "parent": false,
      "parent_id": null,
      "child": false,
      "recurring": false,
      "customer_reply": false,
      "total_formatted_billable_time": null,
      "contact_id": null,
      "sla_breached": false,
      "sla_breaching_soon": false,
      "contract_id": null,
      "sla_id": null,
      "customer_tag_list": [],
      "resolution_time": null,
      "response_time": null,
      "customer_icons": [],
      "comments": [],
      "user": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create Ticket

Creates a Ticket

**Endpoint:** `POST /tickets`

**Required Permission:** Tickets - Create
Single-Customer Users can only access own tickets.

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| See Ticket object | | | |
**Response: 200 OK**

```json
{
  "ticket": {
    "id": 3,
    "number": 2012,
    "subject": "Ticket Subject",
    "created_at": "2019-11-04T14:55:01.883Z",
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "due_date": "2025-10-10T08:00:00.000Z",
    "start_at": null,
    "end_at": "2025-10-10T18:45:00.000Z",
    "location_id": null,
    "problem_type": "Virus",
    "status": "New",
    "properties": {
      "Device Type": "Hard Drive",
      "Maker": "Text field"
    },
    "user_id": 1,
    "updated_at": "2019-11-04T14:55:01.928Z",
    "pdf_url": null,
    "intake_form_html": null,
    "signature_name": "Joe",
    "signature_date": null,
    "asset_ids": [
      1
    ],
    "priority": "High",
    "resolved_at": null,
    "outtake_form_name": null,
    "outtake_form_date": null,
    "outtake_form_html": null,
    "comments": [
      {
        "id": 1,
        "created_at": "2019-11-04T14:55:01.884Z",
        "updated_at": "2019-11-04T14:55:01.884Z",
        "ticket_id": 3,
        "subject": "Comment Subject",
        "body": "Comment Body",
        "tech": null,
        "hidden": true,
        "user_id": null
      }
    ],
    "attachments": [],
    "ticket_timers": [],
    "line_items": [],
    "worksheet_results": [],
    "assets": [
      {
        "id": 1,
        "name": "Vileplume",
        "customer_id": 1,
        "created_at": "2019-11-04T14:55:01.790Z",
        "updated_at": "2019-11-04T14:55:01.790Z",
        "properties": {},
        "asset_type": "Sandshrew",
        "asset_serial": null,
        "external_rmm_link": null,
        "customer": {
          "id": 1,
          "firstname": "Walkin",
          "lastname": "Customer",
          "fullname": "Walkin Customer",
          "business_name": null,
          "email": "walkin@somedomain.com",
          "phone": "123",
          "mobile": null,
          "created_at": "2019-11-04T14:54:50.735Z",
          "updated_at": "2019-11-04T14:54:50.735Z",
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
          "location_id": null,
          "properties": {},
          "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=3g85nj295ar5u4c9zq1o",
          "tax_rate_id": null,
          "notification_email": null,
          "invoice_cc_emails": null,
          "invoice_term_id": null,
          "referred_by": null,
          "ref_customer_id": null,
          "business_and_full_name": "Walkin Customer",
          "business_then_name": "Walkin Customer"
        },
        "rmm_links": [],
        "rmm_store": {
          "id": 1,
          "asset_id": 1,
          "account_id": 1,
          "triggers": {
            "bsod_triggered": "false",
            "time_triggered": "false",
            "no_av_triggered": "false",
            "defrag_triggered": "false",
            "firewall_triggered": "false",
            "app_crash_triggered": "false",
            "low_hd_space_triggered": "false",
            "smart_failure_triggered": "false",
            "device_manager_triggered": "false",
            "agent_offline_triggered": "false"
          },
          "windows_updates": {},
          "emsisoft": {},
          "general": {},
          "created_at": "2019-11-04T14:55:01.991Z",
          "updated_at": "2019-11-04T14:55:01.991Z",
          "override_alert_agent_offline_mins": null,
          "override_alert_agent_rearm_after_mins": null,
          "override_low_hd_threshold": null,
          "override_autoresolve_offline_alert": null
        }
      }
    ],
    "appointments": [],
    "ticket_fields": [
      {
        "id": 2,
        "name": "Maker",
        "field_type": "text_field",
        "required": null,
        "account_id": 1,
        "created_at": "2019-11-04T14:55:01.761Z",
        "updated_at": "2019-11-04T14:55:01.761Z",
        "ticket_type_id": 1,
        "hidden": false,
        "position": null,
        "answers": []
      },
      {
        "id": 1,
        "name": "Device Type",
        "field_type": "select_box",
        "required": null,
        "account_id": 1,
        "created_at": "2019-11-04T14:55:01.743Z",
        "updated_at": "2019-11-04T14:55:01.743Z",
        "ticket_type_id": 1,
        "hidden": false,
        "position": null,
        "answers": [
          {
            "id": 1,
            "ticket_field_id": 1,
            "content": "Hard Drive",
            "created_at": "2019-11-04T14:55:01.758Z",
            "updated_at": "2019-11-04T14:55:01.758Z",
            "account_id": null
          }
        ]
      }
    ],
    "ticket_answers": [
      {
        "id": 1,
        "ticket_field_id": 1,
        "content": "Hard Drive",
        "created_at": "2019-11-04T14:55:01.758Z",
        "updated_at": "2019-11-04T14:55:01.758Z",
        "account_id": null
      }
    ],
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-11-04T14:54:50.735Z",
      "updated_at": "2019-11-04T14:54:50.735Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=cfrwzra6wo3ybuj598pa",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    },
    "contact": null,
    "user": {
      "id": 1,
      "email": "bat1man44128@man.com",
      "full_name": "Bat Man",
      "created_at": "2019-11-04T14:54:51.081Z",
      "updated_at": "2019-11-04T14:54:51.081Z",
      "group": "Admins",
      "admin": true,
      "color": "1e3e96"
    },
    "ticket_type": {
      "id": 1,
      "name": "Devices",
      "account_id": 1,
      "created_at": "2019-11-04T14:55:01.722Z",
      "updated_at": "2019-11-04T14:55:01.722Z",
      "disabled": false,
      "intake_terms": null,
      "skip_intake": false,
      "outtake_terms": null,
      "skip_outtake": false,
      "ticket_fields": [
        {
          "id": 2,
          "name": "Maker",
          "field_type": "text_field",
          "required": null,
          "account_id": 1,
          "created_at": "2019-11-04T14:55:01.761Z",
          "updated_at": "2019-11-04T14:55:01.761Z",
          "ticket_type_id": 1,
          "hidden": false,
          "position": null,
          "answers": []
        },
        {
          "id": 1,
          "name": "Device Type",
          "field_type": "select_box",
          "required": null,
          "account_id": 1,
          "created_at": "2019-11-04T14:55:01.743Z",
          "updated_at": "2019-11-04T14:55:01.743Z",
          "ticket_type_id": 1,
          "hidden": false,
          "position": null,
          "answers": [
            {
              "id": 1,
              "ticket_field_id": 1,
              "content": "Hard Drive",
              "created_at": "2019-11-04T14:55:01.758Z",
              "updated_at": "2019-11-04T14:55:01.758Z",
              "account_id": null
            }
          ]
        }
      ]
    }
  }
}
```
**Response: 422 Unprocessable Entity**

```json
{
  "error": "Customer required field"
}
```

#### Get Ticket by ID

Retrieves a Ticket by ID

**Endpoint:** `GET /tickets/{id}`

**Required Permission:** Tickets - View Details
Single-Customer Users can only access own tickets.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
**Response: 200 OK**

```json
{
  "ticket": {
    "id": 5,
    "number": 4,
    "subject": "Some major problem",
    "created_at": "2019-11-05T07:40:54.824Z",
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "due_date": "2019-11-05T07:40:54.820Z",
    "start_at": null,
    "end_at": null,
    "location_id": null,
    "problem_type": "Virus",
    "status": "New",
    "properties": {},
    "user_id": null,
    "updated_at": "2019-11-05T07:40:54.824Z",
    "pdf_url": null,
    "intake_form_html": null,
    "signature_name": null,
    "signature_date": null,
    "asset_ids": [],
    "priority": null,
    "resolved_at": null,
    "outtake_form_name": null,
    "outtake_form_date": null,
    "outtake_form_html": null,
    "tag_list": [],
    "comments": [],
    "attachments": [],
    "ticket_timers": [],
    "line_items": [],
    "worksheet_results": [],
    "assets": [],
    "appointments": [],
    "ticket_fields": [],
    "ticket_answers": [],
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-11-05T07:40:44.365Z",
      "updated_at": "2019-11-05T07:40:44.365Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=2ry2wdlnaybl86oetmbr",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    },
    "contact": null,
    "user": {
      "id": 1,
      "email": "bat1man44128@man.com",
      "full_name": "Bat Man",
      "created_at": "2019-11-04T14:54:51.081Z",
      "updated_at": "2019-11-04T14:54:51.081Z",
      "group": "Admins",
      "admin": true,
      "color": "1e3e96"
    },
    "ticket_type": {
      "id": 1,
      "name": "Devices",
      "account_id": 1,
      "created_at": "2019-11-04T14:55:01.722Z",
      "updated_at": "2019-11-04T14:55:01.722Z",
      "disabled": false,
      "intake_terms": null,
      "skip_intake": false,
      "outtake_terms": null,
      "skip_outtake": false,
      "ticket_fields": []
    },
    "address": null
  }
}
```
**Response: 404 Not Found**

#### Update Ticket

Updates an existing Ticket by ID

**Endpoint:** `PUT /tickets/{id}`

**Required Permission:** Tickets - Edit
Single-Customer Users can only access own tickets.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| See Ticket object | | | |
**Response: 200 OK**

```json
{
  "ticket": {
    "id": 5,
    "number": 4,
    "subject": "Some major problem",
    "created_at": "2019-11-05T07:40:54.824Z",
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "due_date": "2019-11-05T07:40:54.820Z",
    "start_at": null,
    "end_at": null,
    "location_id": null,
    "problem_type": "Virus",
    "status": "New",
    "properties": {},
    "user_id": null,
    "updated_at": "2019-11-05T07:40:54.824Z",
    "pdf_url": null,
    "intake_form_html": null,
    "signature_name": null,
    "signature_date": null,
    "asset_ids": [],
    "priority": null,
    "resolved_at": null,
    "outtake_form_name": null,
    "outtake_form_date": null,
    "outtake_form_html": null,
    "comments": [],
    "attachments": [],
    "ticket_timers": [],
    "line_items": [],
    "worksheet_results": [],
    "assets": [],
    "appointments": [],
    "ticket_fields": [],
    "ticket_answers": [],
    "tag_list": [],
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-11-05T07:40:44.365Z",
      "updated_at": "2019-11-05T07:40:44.365Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=2ry2wdlnaybl86oetmbr",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    },
    "contact": null,
    "user": {
      "id": 1,
      "email": "bat1man44128@man.com",
      "full_name": "Bat Man",
      "created_at": "2019-11-04T14:54:51.081Z",
      "updated_at": "2019-11-04T14:54:51.081Z",
      "group": "Admins",
      "admin": true,
      "color": "1e3e96"
    },
    "ticket_type": {
      "id": 1,
      "name": "Devices",
      "account_id": 1,
      "created_at": "2019-11-04T14:55:01.722Z",
      "updated_at": "2019-11-04T14:55:01.722Z",
      "disabled": false,
      "intake_terms": null,
      "skip_intake": false,
      "outtake_terms": null,
      "skip_outtake": false,
      "ticket_fields": []
    },
    "address": null
  }
}
```

#### Delete Ticket

Deletes a Ticket by ID

**Endpoint:** `DELETE /tickets/{id}`

**Required Permission:** Tickets - Delete
Single-Customer Users can only access own tickets.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
**Response: 200 OK**

```json
{
  "message": "Ticket was successfully deleted. "
}
```
**Response: 404 Not Found**

---

### Ticket Timers

#### Get Ticket Timers

Returns a paginated list of Ticket Timers

**Endpoint:** `GET /ticket_timers`

**Required Permission:** Tickets - View Details

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| created_at_lt | string | No | Returns Ticket Timers created before the date. Example "2019-01-22" |
| created_at_gt | string | No | Returns Ticket Timers created after the date. Example "2019-12-22" |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |
**Response: 200 OK**

```json
{
  "ticket_timers": [
    {
      "id": 1,
      "ticket_id": 1,
      "user_id": 1,
      "start_time": "2013-08-06T13:41:15.000Z",
      "end_time": "2013-08-06T14:41:15.000Z",
      "recorded": false,
      "created_at": "2019-11-05T15:18:43.727Z",
      "updated_at": "2019-11-05T15:18:43.727Z",
      "billable": false,
      "notes": null,
      "toggl_id": null,
      "product_id": null,
      "comment_id": null,
      "ticket_line_item_id": null,
      "active_duration": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

---

### Timelogs

#### Get Timelogs

Returns a paginated list of Timelogs

**Endpoint:** `GET /timelogs`

**Required Permission:** Tickets - View Details

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | No | Returns Timelogs that belong to a User |
**Response: 200 OK**

```json
{
  "timelogs": [
    {
      "id": 1,
      "in_at": "2019-11-01T12:50:26.882Z",
      "out_at": null,
      "account_id": 1,
      "user_id": 1,
      "in_note": null,
      "out_note": null,
      "created_at": "2019-11-01T12:50:26.934Z",
      "updated_at": "2019-11-01T12:50:26.934Z",
      "lunch": null,
      "manually_updated": null
    }
  ]
}
```

#### Update Timelog

Updates a Timelog

**Endpoint:** `PUT /timelogs`

**Required Permission:** Tickets - Edit

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lunch | boolean | No |  |
| in_at | string | No |  |
| out_at | string | No |  |
| in_note | string | No |  |
| out_note | string | No |  |
**Response: 200 OK**

```json
{
  "id": 1,
  "in_at": "2019-11-01T12:50:26.882Z",
  "out_at": null,
  "account_id": 1,
  "user_id": 1,
  "in_note": null,
  "out_note": null,
  "created_at": "2019-11-01T12:50:26.934Z",
  "updated_at": "2019-11-01T12:50:26.934Z",
  "lunch": null,
  "manually_updated": null
}
```

---

### User Devices

#### Create User Device

Creates a User Device

**Endpoint:** `POST /user_devices`

**Required Permission:** Global Admin

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| device_uuid | string | No |  |
| device_name | string | No |  |
| registration_token_gcm | string | No |  |
| system_name | string | No |  |
| model | string | No |  |
| screen_size | string | No |  |
**Response: 200 OK**

```json
{
  "user_id": 1,
  "registration_token_gcm": "new_token",
  "id": 5,
  "device_uuid": "u12345",
  "account_id": null,
  "name": null,
  "device_name": null,
  "system_name": null,
  "model": null,
  "screen_size": null,
  "disabled": false,
  "created_at": "2019-11-04T08:18:32.476Z",
  "updated_at": "2019-11-04T08:18:32.490Z"
}
```

---

### Users

#### Get Users

Returns a paginated list of Users

**Endpoint:** `GET /users`

**Required Permission:** Global Admin

**Response: 200 OK**

```json
{
  "users": [
    [
      1,
      "Joe Doe"
    ]
  ]
}
```

---

### Vendors

#### Get Vendors

Returns a paginated list of Vendors

**Endpoint:** `GET /vendors`

**Required Permission:** Purchase Orders - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 100 result |
**Response: 200 OK**

```json
{
  "vendors": [
    {
      "id": 1,
      "name": "Vendor Name",
      "rep_first_name": "Bill",
      "rep_last_name": "Sales",
      "email": "info@candswholes.com",
      "phone": "603-344-5555",
      "account_number": null,
      "created_at": "2019-11-05T16:11:12.409Z",
      "updated_at": "2019-11-05T16:11:12.409Z",
      "address": "44 Billings Circle",
      "city": "Keene",
      "state": "NH",
      "zip": "03455",
      "website": "www.candswholes.com",
      "notes": "White label trucks"
    }
  ]
}
```

#### Create Vendor

Creates a Vendor

**Endpoint:** `POST /vendors`

**Required Permission:** Purchase Orders - Edit

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| See Ticket object | | | |
**Response: 200 OK**

```json
{
  "vendor": {
    "id": 1,
    "name": "Vendor Name",
    "rep_first_name": "Bill",
    "rep_last_name": "Sales",
    "email": "info@candswholes.com",
    "phone": "603-344-5555",
    "account_number": null,
    "created_at": "2019-11-05T16:11:12.409Z",
    "updated_at": "2019-11-05T16:11:12.409Z",
    "address": "44 Billings Circle",
    "city": "Keene",
    "state": "NH",
    "zip": "03455",
    "website": "www.candswholes.com",
    "notes": "White label trucks"
  }
}
```
**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Email is not an email"
  ],
  "params": {
    "name": "Vendor1",
    "email": "broken_emailmail.com"
  }
}
```

---

### Wiki Pages

#### Get Wiki Pages

Returns a paginated list of Wiki Pages

**Endpoint:** `GET /wiki_pages`

**Required Permission:** Documentation - Allow Usage

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 100 result |
**Response: 200 OK**

```json
{
  "wiki_pages": [
    {
      "id": 1,
      "account_id": 1,
      "name": "API Doc",
      "slug": "api-doc",
      "body": "a sample body",
      "interpolated_body": "a sample body"
    }
  ]
}
```

#### Create Wiki Page

Creates a Wiki Page

**Endpoint:** `POST /wiki_pages`

**Required Permission:** Documentation - Allow Usage

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No |  |
| slug | string | No |  |
| body | string | No |  |
| customer_id | integer | No |  |
| asset_id | integer | No |  |
| visibility | string | No |  |
**Response: 200 OK**

```json
{
  "wiki_page": {
    "id": 1,
    "account_id": 1,
    "name": "API Doc",
    "slug": "api-doc",
    "body": "a sample body",
    "interpolated_body": "a sample body"
  }
}
```

---

### Worksheet Results

#### Get Worksheet Results

Returns a paginated list of Worksheet Results

**Endpoint:** `GET /tickets/{ticket_id}/worksheet_results`

**Required Permission:** Tickets - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |
**Response: 200 OK**

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

#### Create Worksheet Result

Creates Worksheet Result

**Endpoint:** `POST /tickets/{ticket_id}/worksheet_results`

**Required Permission:** Tickets - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |
**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| worksheet_template_id | integer | No |  |
| title | string | No |  |
**Response: 200 OK**

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

---

### Tickets

#### Get Tickets

Returns a paginated list of Tickets

**Endpoint:** `GET /tickets`

**Required Permission:** Tickets - List/Search
Single-Customer Users can only access own tickets.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | integer | No | Any Ticket with customer_id equal to the parameter. |
| contact_id | integer | No | Any Ticket with contact_id equal to the parameter. |
| number | string | No | Any Ticket with number equal to the parameter. |
| resolved_after | string | No | Returns Tickets resolved after the date. Example "2019-01-23". |
| created_after | string | No | Returns Tickets created after the date. Example "2019-02-25". |
| since_updated_at | string | No | Returns Tickets updated after the date. Example "2019-02-25". |
| status | string | No | Any Ticket with status equal to the parameter. Examples "New", "In Progress", "Resolved", "Invoiced", "Waiting for Parts", "Waiting on Customer", "Scheduled", "Customer Reply", "Not Closed". |
| query | string | No | Search query |
| user_id | integer | No | Any Ticket assigned to a User ID |
| mine | boolean | No | Any Ticket assigned to the current user |
| ticket_search_id | integer | No | Returns results of a Ticket Search |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |
| comment_format | string | No | Returns comments in the specified format. Allowed values: 'plaintext', 'richtext', 'original'. Defaults to 'plaintext'. |
| all_comments | boolean | No | When set to true, includes all ticket comments in the resposne, when set to false, only the initial comment is returned. Defaults to true. Default value will be changed to false in the near future. |
**Response: 200 OK**

```json
{
  "tickets": [
    {
      "id": 1,
      "number": 1,
      "subject": "Some major problem",
      "created_at": "2019-11-04T08:59:31.034Z",
      "customer_id": 1,
      "customer_business_then_name": "Walkin Customer",
      "due_date": "2019-11-04T08:59:31.016Z",
      "resolved_at": null,
      "start_at": null,
      "end_at": null,
      "location_id": null,
      "location_name": null,
      "problem_type": "Virus",
      "status": "New",
      "ticket_type_id": 1,
      "ticket_type_name": "Hardware",
      "properties": {},
      "user_id": null,
      "updated_at": "2019-11-04T08:59:31.034Z",
      "pdf_url": null,
      "priority": null,
      "billing_status": null,
      "tag_list": [],
      "sla_name": null,
      "creator_name_or_email": null,
      "contact_fullname": null,
      "contract_name": null,
      "address_id": null,
      "parent": false,
      "parent_id": null,
      "child": false,
      "recurring": false,
      "customer_reply": false,
      "total_formatted_billable_time": null,
      "contact_id": null,
      "sla_breached": false,
      "sla_breaching_soon": false,
      "contract_id": null,
      "sla_id": null,
      "customer_tag_list": [],
      "resolution_time": null,
      "response_time": null,
      "customer_icons": [],
      "comments": [],
      "user": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create Ticket

Creates a Ticket

**Endpoint:** `POST /tickets`

**Required Permission:** Tickets - Create
Single-Customer Users can only access own tickets.

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| See Ticket object | | | |
**Response: 200 OK**

```json
{
  "ticket": {
    "id": 3,
    "number": 2012,
    "subject": "Ticket Subject",
    "created_at": "2019-11-04T14:55:01.883Z",
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "due_date": "2025-10-10T08:00:00.000Z",
    "start_at": null,
    "end_at": "2025-10-10T18:45:00.000Z",
    "location_id": null,
    "problem_type": "Virus",
    "status": "New",
    "properties": {
      "Device Type": "Hard Drive",
      "Maker": "Text field"
    },
    "user_id": 1,
    "updated_at": "2019-11-04T14:55:01.928Z",
    "pdf_url": null,
    "intake_form_html": null,
    "signature_name": "Joe",
    "signature_date": null,
    "asset_ids": [
      1
    ],
    "priority": "High",
    "resolved_at": null,
    "outtake_form_name": null,
    "outtake_form_date": null,
    "outtake_form_html": null,
    "comments": [
      {
        "id": 1,
        "created_at": "2019-11-04T14:55:01.884Z",
        "updated_at": "2019-11-04T14:55:01.884Z",
        "ticket_id": 3,
        "subject": "Comment Subject",
        "body": "Comment Body",
        "tech": null,
        "hidden": true,
        "user_id": null
      }
    ],
    "attachments": [],
    "ticket_timers": [],
    "line_items": [],
    "worksheet_results": [],
    "assets": [
      {
        "id": 1,
        "name": "Vileplume",
        "customer_id": 1,
        "created_at": "2019-11-04T14:55:01.790Z",
        "updated_at": "2019-11-04T14:55:01.790Z",
        "properties": {},
        "asset_type": "Sandshrew",
        "asset_serial": null,
        "external_rmm_link": null,
        "customer": {
          "id": 1,
          "firstname": "Walkin",
          "lastname": "Customer",
          "fullname": "Walkin Customer",
          "business_name": null,
          "email": "walkin@somedomain.com",
          "phone": "123",
          "mobile": null,
          "created_at": "2019-11-04T14:54:50.735Z",
          "updated_at": "2019-11-04T14:54:50.735Z",
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
          "location_id": null,
          "properties": {},
          "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=3g85nj295ar5u4c9zq1o",
          "tax_rate_id": null,
          "notification_email": null,
          "invoice_cc_emails": null,
          "invoice_term_id": null,
          "referred_by": null,
          "ref_customer_id": null,
          "business_and_full_name": "Walkin Customer",
          "business_then_name": "Walkin Customer"
        },
        "rmm_links": [],
        "rmm_store": {
          "id": 1,
          "asset_id": 1,
          "account_id": 1,
          "triggers": {
            "bsod_triggered": "false",
            "time_triggered": "false",
            "no_av_triggered": "false",
            "defrag_triggered": "false",
            "firewall_triggered": "false",
            "app_crash_triggered": "false",
            "low_hd_space_triggered": "false",
            "smart_failure_triggered": "false",
            "device_manager_triggered": "false",
            "agent_offline_triggered": "false"
          },
          "windows_updates": {},
          "emsisoft": {},
          "general": {},
          "created_at": "2019-11-04T14:55:01.991Z",
          "updated_at": "2019-11-04T14:55:01.991Z",
          "override_alert_agent_offline_mins": null,
          "override_alert_agent_rearm_after_mins": null,
          "override_low_hd_threshold": null,
          "override_autoresolve_offline_alert": null
        }
      }
    ],
    "appointments": [],
    "ticket_fields": [
      {
        "id": 2,
        "name": "Maker",
        "field_type": "text_field",
        "required": null,
        "account_id": 1,
        "created_at": "2019-11-04T14:55:01.761Z",
        "updated_at": "2019-11-04T14:55:01.761Z",
        "ticket_type_id": 1,
        "hidden": false,
        "position": null,
        "answers": []
      },
      {
        "id": 1,
        "name": "Device Type",
        "field_type": "select_box",
        "required": null,
        "account_id": 1,
        "created_at": "2019-11-04T14:55:01.743Z",
        "updated_at": "2019-11-04T14:55:01.743Z",
        "ticket_type_id": 1,
        "hidden": false,
        "position": null,
        "answers": [
          {
            "id": 1,
            "ticket_field_id": 1,
            "content": "Hard Drive",
            "created_at": "2019-11-04T14:55:01.758Z",
            "updated_at": "2019-11-04T14:55:01.758Z",
            "account_id": null
          }
        ]
      }
    ],
    "ticket_answers": [
      {
        "id": 1,
        "ticket_field_id": 1,
        "content": "Hard Drive",
        "created_at": "2019-11-04T14:55:01.758Z",
        "updated_at": "2019-11-04T14:55:01.758Z",
        "account_id": null
      }
    ],
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-11-04T14:54:50.735Z",
      "updated_at": "2019-11-04T14:54:50.735Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=cfrwzra6wo3ybuj598pa",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    },
    "contact": null,
    "user": {
      "id": 1,
      "email": "bat1man44128@man.com",
      "full_name": "Bat Man",
      "created_at": "2019-11-04T14:54:51.081Z",
      "updated_at": "2019-11-04T14:54:51.081Z",
      "group": "Admins",
      "admin": true,
      "color": "1e3e96"
    },
    "ticket_type": {
      "id": 1,
      "name": "Devices",
      "account_id": 1,
      "created_at": "2019-11-04T14:55:01.722Z",
      "updated_at": "2019-11-04T14:55:01.722Z",
      "disabled": false,
      "intake_terms": null,
      "skip_intake": false,
      "outtake_terms": null,
      "skip_outtake": false,
      "ticket_fields": [
        {
          "id": 2,
          "name": "Maker",
          "field_type": "text_field",
          "required": null,
          "account_id": 1,
          "created_at": "2019-11-04T14:55:01.761Z",
          "updated_at": "2019-11-04T14:55:01.761Z",
          "ticket_type_id": 1,
          "hidden": false,
          "position": null,
          "answers": []
        },
        {
          "id": 1,
          "name": "Device Type",
          "field_type": "select_box",
          "required": null,
          "account_id": 1,
          "created_at": "2019-11-04T14:55:01.743Z",
          "updated_at": "2019-11-04T14:55:01.743Z",
          "ticket_type_id": 1,
          "hidden": false,
          "position": null,
          "answers": [
            {
              "id": 1,
              "ticket_field_id": 1,
              "content": "Hard Drive",
              "created_at": "2019-11-04T14:55:01.758Z",
              "updated_at": "2019-11-04T14:55:01.758Z",
              "account_id": null
            }
          ]
        }
      ]
    }
  }
}
```
**Response: 422 Unprocessable Entity**

```json
{
  "error": "Customer required field"
}
```

#### Get Ticket by ID

Retrieves a Ticket by ID

**Endpoint:** `GET /tickets/{id}`

**Required Permission:** Tickets - View Details
Single-Customer Users can only access own tickets.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
**Response: 200 OK**

```json
{
  "ticket": {
    "id": 5,
    "number": 4,
    "subject": "Some major problem",
    "created_at": "2019-11-05T07:40:54.824Z",
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "due_date": "2019-11-05T07:40:54.820Z",
    "start_at": null,
    "end_at": null,
    "location_id": null,
    "problem_type": "Virus",
    "status": "New",
    "properties": {},
    "user_id": null,
    "updated_at": "2019-11-05T07:40:54.824Z",
    "pdf_url": null,
    "intake_form_html": null,
    "signature_name": null,
    "signature_date": null,
    "asset_ids": [],
    "priority": null,
    "resolved_at": null,
    "outtake_form_name": null,
    "outtake_form_date": null,
    "outtake_form_html": null,
    "tag_list": [],
    "comments": [],
    "attachments": [],
    "ticket_timers": [],
    "line_items": [],
    "worksheet_results": [],
    "assets": [],
    "appointments": [],
    "ticket_fields": [],
    "ticket_answers": [],
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-11-05T07:40:44.365Z",
      "updated_at": "2019-11-05T07:40:44.365Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=2ry2wdlnaybl86oetmbr",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    },
    "contact": null,
    "user": {
      "id": 1,
      "email": "bat1man44128@man.com",
      "full_name": "Bat Man",
      "created_at": "2019-11-04T14:54:51.081Z",
      "updated_at": "2019-11-04T14:54:51.081Z",
      "group": "Admins",
      "admin": true,
      "color": "1e3e96"
    },
    "ticket_type": {
      "id": 1,
      "name": "Devices",
      "account_id": 1,
      "created_at": "2019-11-04T14:55:01.722Z",
      "updated_at": "2019-11-04T14:55:01.722Z",
      "disabled": false,
      "intake_terms": null,
      "skip_intake": false,
      "outtake_terms": null,
      "skip_outtake": false,
      "ticket_fields": []
    },
    "address": null
  }
}
```
**Response: 404 Not Found**

#### Update Ticket

Updates an existing Ticket by ID

**Endpoint:** `PUT /tickets/{id}`

**Required Permission:** Tickets - Edit
Single-Customer Users can only access own tickets.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| See Ticket object | | | |
**Response: 200 OK**

```json
{
  "ticket": {
    "id": 5,
    "number": 4,
    "subject": "Some major problem",
    "created_at": "2019-11-05T07:40:54.824Z",
    "customer_id": 1,
    "customer_business_then_name": "Walkin Customer",
    "due_date": "2019-11-05T07:40:54.820Z",
    "start_at": null,
    "end_at": null,
    "location_id": null,
    "problem_type": "Virus",
    "status": "New",
    "properties": {},
    "user_id": null,
    "updated_at": "2019-11-05T07:40:54.824Z",
    "pdf_url": null,
    "intake_form_html": null,
    "signature_name": null,
    "signature_date": null,
    "asset_ids": [],
    "priority": null,
    "resolved_at": null,
    "outtake_form_name": null,
    "outtake_form_date": null,
    "outtake_form_html": null,
    "comments": [],
    "attachments": [],
    "ticket_timers": [],
    "line_items": [],
    "worksheet_results": [],
    "assets": [],
    "appointments": [],
    "ticket_fields": [],
    "ticket_answers": [],
    "tag_list": [],
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-11-05T07:40:44.365Z",
      "updated_at": "2019-11-05T07:40:44.365Z",
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
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=2ry2wdlnaybl86oetmbr",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    },
    "contact": null,
    "user": {
      "id": 1,
      "email": "bat1man44128@man.com",
      "full_name": "Bat Man",
      "created_at": "2019-11-04T14:54:51.081Z",
      "updated_at": "2019-11-04T14:54:51.081Z",
      "group": "Admins",
      "admin": true,
      "color": "1e3e96"
    },
    "ticket_type": {
      "id": 1,
      "name": "Devices",
      "account_id": 1,
      "created_at": "2019-11-04T14:55:01.722Z",
      "updated_at": "2019-11-04T14:55:01.722Z",
      "disabled": false,
      "intake_terms": null,
      "skip_intake": false,
      "outtake_terms": null,
      "skip_outtake": false,
      "ticket_fields": []
    },
    "address": null
  }
}
```

#### Delete Ticket

Deletes a Ticket by ID

**Endpoint:** `DELETE /tickets/{id}`

**Required Permission:** Tickets - Delete
Single-Customer Users can only access own tickets.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
**Response: 200 OK**

```json
{
  "message": "Ticket was successfully deleted. "
}
```
**Response: 404 Not Found**

---

### Ticket Timers

#### Get Ticket Timers

Returns a paginated list of Ticket Timers

**Endpoint:** `GET /ticket_timers`

**Required Permission:** Tickets - View Details

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| created_at_lt | string | No | Returns Ticket Timers created before the date. Example "2019-01-22" |
| created_at_gt | string | No | Returns Ticket Timers created after the date. Example "2019-12-22" |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |
**Response: 200 OK**

```json
{
  "ticket_timers": [
    {
      "id": 1,
      "ticket_id": 1,
      "user_id": 1,
      "start_time": "2013-08-06T13:41:15.000Z",
      "end_time": "2013-08-06T14:41:15.000Z",
      "recorded": false,
      "created_at": "2019-11-05T15:18:43.727Z",
      "updated_at": "2019-11-05T15:18:43.727Z",
      "billable": false,
      "notes": null,
      "toggl_id": null,
      "product_id": null,
      "comment_id": null,
      "ticket_line_item_id": null,
      "active_duration": null
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

---

### Timelogs

#### Get Timelogs

Returns a paginated list of Timelogs

**Endpoint:** `GET /timelogs`

**Required Permission:** Tickets - View Details

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | No | Returns Timelogs that belong to a User |
**Response: 200 OK**

```json
{
  "timelogs": [
    {
      "id": 1,
      "in_at": "2019-11-01T12:50:26.882Z",
      "out_at": null,
      "account_id": 1,
      "user_id": 1,
      "in_note": null,
      "out_note": null,
      "created_at": "2019-11-01T12:50:26.934Z",
      "updated_at": "2019-11-01T12:50:26.934Z",
      "lunch": null,
      "manually_updated": null
    }
  ]
}
```

#### Update Timelog

Updates a Timelog

**Endpoint:** `PUT /timelogs`

**Required Permission:** Tickets - Edit

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lunch | boolean | No |  |
| in_at | string | No |  |
| out_at | string | No |  |
| in_note | string | No |  |
| out_note | string | No |  |
**Response: 200 OK**

```json
{
  "id": 1,
  "in_at": "2019-11-01T12:50:26.882Z",
  "out_at": null,
  "account_id": 1,
  "user_id": 1,
  "in_note": null,
  "out_note": null,
  "created_at": "2019-11-01T12:50:26.934Z",
  "updated_at": "2019-11-01T12:50:26.934Z",
  "lunch": null,
  "manually_updated": null
}
```

---

### User Devices

#### Create User Device

Creates a User Device

**Endpoint:** `POST /user_devices`

**Required Permission:** Global Admin

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| device_uuid | string | No |  |
| device_name | string | No |  |
| registration_token_gcm | string | No |  |
| system_name | string | No |  |
| model | string | No |  |
| screen_size | string | No |  |
**Response: 200 OK**

```json
{
  "user_id": 1,
  "registration_token_gcm": "new_token",
  "id": 5,
  "device_uuid": "u12345",
  "account_id": null,
  "name": null,
  "device_name": null,
  "system_name": null,
  "model": null,
  "screen_size": null,
  "disabled": false,
  "created_at": "2019-11-04T08:18:32.476Z",
  "updated_at": "2019-11-04T08:18:32.490Z"
}
```

---

### Users

#### Get Users

Returns a paginated list of Users

**Endpoint:** `GET /users`

**Required Permission:** Global Admin

**Response: 200 OK**

```json
{
  "users": [
    [
      1,
      "Joe Doe"
    ]
  ]
}
```

---

### Vendors

#### Get Vendors

Returns a paginated list of Vendors

**Endpoint:** `GET /vendors`

**Required Permission:** Purchase Orders - List/Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 100 result |
**Response: 200 OK**

```json
{
  "vendors": [
    {
      "id": 1,
      "name": "Vendor Name",
      "rep_first_name": "Bill",
      "rep_last_name": "Sales",
      "email": "info@candswholes.com",
      "phone": "603-344-5555",
      "account_number": null,
      "created_at": "2019-11-05T16:11:12.409Z",
      "updated_at": "2019-11-05T16:11:12.409Z",
      "address": "44 Billings Circle",
      "city": "Keene",
      "state": "NH",
      "zip": "03455",
      "website": "www.candswholes.com",
      "notes": "White label trucks"
    }
  ]
}
```

#### Create Vendor

Creates a Vendor

**Endpoint:** `POST /vendors`

**Required Permission:** Purchase Orders - Edit

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| See Ticket object | | | |
**Response: 200 OK**

```json
{
  "vendor": {
    "id": 1,
    "name": "Vendor Name",
    "rep_first_name": "Bill",
    "rep_last_name": "Sales",
    "email": "info@candswholes.com",
    "phone": "603-344-5555",
    "account_number": null,
    "created_at": "2019-11-05T16:11:12.409Z",
    "updated_at": "2019-11-05T16:11:12.409Z",
    "address": "44 Billings Circle",
    "city": "Keene",
    "state": "NH",
    "zip": "03455",
    "website": "www.candswholes.com",
    "notes": "White label trucks"
  }
}
```
**Response: 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": [
    "Email is not an email"
  ],
  "params": {
    "name": "Vendor1",
    "email": "broken_emailmail.com"
  }
}
```

---

### Wiki Pages

#### Get Wiki Pages

Returns a paginated list of Wiki Pages

**Endpoint:** `GET /wiki_pages`

**Required Permission:** Documentation - Allow Usage

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Returns provided page of results, each 'page' contains 100 result |
**Response: 200 OK**

```json
{
  "wiki_pages": [
    {
      "id": 1,
      "account_id": 1,
      "name": "API Doc",
      "slug": "api-doc",
      "body": "a sample body",
      "interpolated_body": "a sample body"
    }
  ]
}
```

#### Create Wiki Page

Creates a Wiki Page

**Endpoint:** `POST /wiki_pages`

**Required Permission:** Documentation - Allow Usage

**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No |  |
| slug | string | No |  |
| body | string | No |  |
| customer_id | integer | No |  |
| asset_id | integer | No |  |
| visibility | string | No |  |
**Response: 200 OK**

```json
{
  "wiki_page": {
    "id": 1,
    "account_id": 1,
    "name": "API Doc",
    "slug": "api-doc",
    "body": "a sample body",
    "interpolated_body": "a sample body"
  }
}
```

---

### Worksheet Results

#### Get Worksheet Results

Returns a paginated list of Worksheet Results

**Endpoint:** `GET /tickets/{ticket_id}/worksheet_results`

**Required Permission:** Tickets - View Details

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |
| page | integer | No | Returns provided page of results, each 'page' contains 25 results |
**Response: 200 OK**

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

#### Create Worksheet Result

Creates Worksheet Result

**Endpoint:** `POST /tickets/{ticket_id}/worksheet_results`

**Required Permission:** Tickets - Edit

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_id | integer | Yes |  |
**Request Body:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| worksheet_template_id | integer | No |  |
| title | string | No |  |
**Response: 200 OK**

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

---

