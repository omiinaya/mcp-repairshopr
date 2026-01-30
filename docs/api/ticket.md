# RepairShopr API Documentation - Ticket

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Ticket

#### Get Tickets


Returns a paginated list of Tickets


Required permission: Tickets - List/Search
Single-Customer Users can only access own tickets.



**Endpoint:** `GET /tickets`


**Required Permission:** Required permission: Tickets - List/Search


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


**Response: 200**


successful


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


Required permission: Tickets - Create
Single-Customer Users can only access own tickets.



**Endpoint:** `POST /tickets`


**Required Permission:** Required permission: Tickets - Create


**Request Body:**


**Response: 200**


successful


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


**Response: 422**


Invalid request


```json
{
  "error": "Customer required field"
}
```


#### Get Ticket by ID


Retrieves a Ticket by ID


Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"
Single-Customer Users can only access own tickets.



**Endpoint:** `GET /tickets/{id}`


**Required Permission:** Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


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


**Response: 404**


Invalid request


#### Update Ticket


Updates an existing Ticket by ID


Required permission: Tickets - Edit
Single-Customer Users can only access own tickets.



**Endpoint:** `PUT /tickets/{id}`


**Required Permission:** Required permission: Tickets - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


**Response: 200**


successful


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


**Response: 422**


Invalid request


```json
{
  "success": false,
  "message": [
    "Subject can't be blank"
  ]
}
```


#### Delete Ticket


Deletes a Ticket by ID


Required permission: Tickets - Delete
Single-Customer Users can only access own tickets.



**Endpoint:** `DELETE /tickets/{id}`


**Required Permission:** Required permission: Tickets - Delete


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "message": "Ticket was successfully deleted. "
}
```


**Response: 404**


Invalid request


```json
{
  "message": "Not found"
}
```


#### Get Settings


Returns Tickets Settings


**Endpoint:** `GET /tickets/settings`


**Response: 200**


successful


```json
{
  "ticket_status_list": [
    "New",
    "In Progress",
    "Resolved",
    "Invoiced",
    "Waiting for Parts",
    "Waiting on Customer",
    "Scheduled",
    "Customer Reply"
  ],
  "default_labor_product_id": null,
  "ticket_timer_charge_by_default": null,
  "saved_searches": [],
  "ticket_types": [],
  "ticket_type_fields": [],
  "ticket_type_field_answers": [],
  "appointment_types": [],
  "users": [
    {
      "id": 1,
      "name": "Bat Man"
    }
  ],
  "dashboard_settings": null,
  "worksheet_templates": [],
  "require_ticket_type": null,
  "require_intake_form_with_ticket": null,
  "require_outtake_form_with_ticket": null,
  "ticket_workflow_default_id": null
}
```


#### Create Ticket


Prints a Ticket by ID


Required permission: Tickets - View Details
Single-Customer Users can only access own tickets.



**Endpoint:** `POST /tickets/{id}/print`


**Required Permission:** Required permission: Tickets - View Details


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


#### Get Ticket by ID


Returns Comments for a Ticket


Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"
Single-Customer Users can only access comments for their own tickets.



**Endpoint:** `GET /tickets/{id}/comments`


**Required Permission:** Required permissions: "Tickets - View Details" or "Tickets - View 'Their Ticket' Details (assigned to them)"


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |
| sort_by | string | No | Sort by field, created_at or updated_at |
| sort_direction | string | No | Sort direction, ASC or DESC |
| created_after | string | No | Filter comments created after this date |
| created_before | string | No | Filter comments created before this date |
| updated_after | string | No | Filter comments updated after this date |
| updated_before | string | No | Filter comments updated before this date |
| page | integer | No | Returns provided page of results, each page contains 10 comments by default, default can be changed by setting the 'per_page' parameter |
| per_page | integer | No | Sets the number of comments per page, default is 10 |
| comment_format | string | No | Returns comments in the specified format. Allowed values: 'plaintext', 'richtext', 'original'. Defaults to 'plaintext'. |


**Response: 200**


successful


#### Create Ticket


Adds a Comment to a Ticket


Required permission: Tickets - Edit
Single-Customer Users can only access own tickets.



**Endpoint:** `POST /tickets/{id}/comment`


**Required Permission:** Required permission: Tickets - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subject | string | No |  |
| tech | string | No |  |
| body | string | No |  |
| hidden | boolean | No |  |
| sms_body | string | No |  |
| do_not_email | boolean | No |  |



**Response: 200**


successful


```json
{
  "comment": {
    "id": 2,
    "created_at": "2019-11-05T09:13:33.422Z",
    "updated_at": "2019-11-05T09:13:33.422Z",
    "ticket_id": 13,
    "subject": "Comment Subject",
    "body": "Comment Body",
    "tech": "Joe",
    "hidden": true,
    "user_id": 1
  }
}
```


**Response: 422**


Invalid request


```json
{
  "success": false,
  "message": [
    "Body can't be blank",
    "Subject can't be blank"
  ]
}
```


#### Create Ticket


Create a Ticket Timer for a Ticket


Required permission: Ticket Timers - Overview



**Endpoint:** `POST /tickets/{id}/timer_entry`


**Required Permission:** Required permission: Ticket Timers - Overview


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_at | string | No |  |
| end_at | string | No |  |
| duration_minutes | integer | No |  |
| user_id | integer | No | Current user by default |
| notes | string | No |  |
| product_id | integer | No |  |



**Response: 200**


successful


```json
{
  "id": 1,
  "ticket_id": 15,
  "user_id": 1,
  "start_time": "2019-11-05T12:15:59.000Z",
  "end_time": "2019-11-05T12:25:59.000Z",
  "recorded": false,
  "created_at": "2019-11-05T12:15:59.365Z",
  "updated_at": "2019-11-05T12:15:59.365Z",
  "billable": false,
  "notes": "API Timer",
  "toggl_id": null,
  "product_id": null,
  "comment_id": null,
  "ticket_line_item_id": null,
  "active_duration": 600
}
```


**Response: 422**


Invalid request


```json
{
  "error": "no implicit conversion of nil into String"
}
```


#### Create Ticket


Creates a Ticket Line Item


Required permission: Tickets - Edit
Single-Customer Users can only access own tickets.



**Endpoint:** `POST /tickets/{id}/add_line_item`


**Required Permission:** Required permission: Tickets - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No |  |
| upc_code | string | No |  |
| product_id | integer | No |  |
| description | string | No |  |
| quantity | number | No |  |
| price_cost | number | No |  |
| price_retail | number | No |  |
| taxable | boolean | No |  |



**Response: 200**


successful


```json
{
  "id": 1,
  "ticket_id": 17,
  "user_id": 1,
  "product_id": null,
  "name": "Manual Item",
  "description": "No Product",
  "quantity": "1.0",
  "product_category": null,
  "upc_code": null,
  "taxable": true,
  "cost_cents": 1000,
  "retail_cents": 1500,
  "created_at": "2019-11-05T11:46:20.347Z",
  "updated_at": "2019-11-05T11:46:20.347Z",
  "converted": false,
  "item_id": null,
  "position": 2,
  "estimate_line_item_id": null,
  "old_price": null,
  "line_discount_percent": null,
  "discount_dollars": null,
  "original_ticket_line_item_id": null,
  "price_cost": 10,
  "price_retail": 15
}
```


**Response: 422**


Invalid request


```json
{
  "errors": "Name can't be blank, Description can't be blank",
  "params": {}
}
```


#### Create Ticket


Attach a file to a Ticket


Required permission: Tickets - Edit
Single-Customer Users can only access own tickets.



**Endpoint:** `POST /tickets/{id}/attach_file_url`


**Required Permission:** Required permission: Tickets - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


**Response: 200**


successful


```json
{
  "message": "Processing - refresh ticket in a moment to see if it worked."
}
```


**Response: 422**


Invalid request


```json
{
  "error": "Missing files param - or not an array like [{'url':'http://foo','filename': 'test'}]"
}
```


#### Create Ticket


Deletes a Ticket Line Item


Required permission: Tickets - Edit
Single-Customer Users can only access own tickets.



**Endpoint:** `POST /tickets/{id}/remove_line_item`


**Required Permission:** Required permission: Tickets - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_line_item_id | integer | No |  |



**Response: 200**


successful


```json
{
  "success": true,
  "message": ""
}
```


**Response: 404**


Invalid request


#### Update Ticket


Updates an existing Ticket Line Item


Required permission: Tickets - Edit
Single-Customer Users can only access own tickets.



**Endpoint:** `PUT /tickets/{id}/update_line_item`


**Required Permission:** Required permission: Tickets - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ticket_line_item_id | integer | No |  |
| name | string | No |  |
| upc_code | string | No |  |
| product_id | integer | No |  |
| description | string | No |  |
| quantity | number | No |  |
| price_cost | number | No |  |
| price_retail | number | No |  |
| taxable | boolean | No |  |



**Response: 200**


successful


```json
{
  "ticket_line_item": {
    "id": 3,
    "ticket_id": 23,
    "user_id": null,
    "product_id": null,
    "name": "Updated Line Name",
    "description": "Description",
    "quantity": "1.0",
    "product_category": null,
    "upc_code": null,
    "taxable": true,
    "cost_cents": null,
    "retail_cents": 10000,
    "created_at": "2019-11-05T14:20:25.673Z",
    "updated_at": "2019-11-05T14:20:25.692Z",
    "converted": false,
    "item_id": null,
    "position": 3,
    "estimate_line_item_id": null,
    "old_price": null,
    "line_discount_percent": null,
    "discount_dollars": null,
    "original_ticket_line_item_id": null,
    "price_cost": 0,
    "price_retail": 100
  }
}
```


**Response: 404**


Invalid request


#### Create Ticket


Deletes a Ticket Attachment


Required permission: Tickets - Edit
Single-Customer Users can only access own tickets.



**Endpoint:** `POST /tickets/{id}/delete_attachment`


**Required Permission:** Required permission: Tickets - Edit


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| attachment_id | integer | No |  |



**Response: 200**


successful


```json
{
  "success": true
}
```


**Response: 404**


Invalid request


#### Create Ticket


Deletes a Ticket Timer


Required permission: Ticket Timers - Overview



**Endpoint:** `POST /tickets/{id}/delete_timer_entry`


**Required Permission:** Required permission: Ticket Timers - Overview


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


**Response: 200**


successful


```json
{
  "success": true
}
```


**Response: 404**


Invalid request


#### Update Ticket


Updates an existing Ticket Timer


Required permission: Ticket Timers - Overview



**Endpoint:** `PUT /tickets/{id}/update_timer_entry`


**Required Permission:** Required permission: Ticket Timers - Overview


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| timer_entry_id | integer | No |  |
| start_at | string | No |  |
| duration_minutes | integer | No |  |
| user_id | integer | No | Current user by default |
| notes | string | No |  |
| product_id | integer | No |  |



**Response: 200**


successful


```json
{
  "ticket_id": 29,
  "id": 3,
  "notes": "Updated Notes",
  "user_id": 1,
  "toggl_id": null,
  "start_time": "2013-08-06T13:41:15.000Z",
  "end_time": "2013-08-06T14:41:15.000Z",
  "recorded": false,
  "created_at": "2019-11-05T14:58:58.047Z",
  "updated_at": "2019-11-05T14:58:58.062Z",
  "billable": false,
  "product_id": 2,
  "comment_id": null,
  "ticket_line_item_id": null,
  "active_duration": null
}
```


**Response: 404**


Invalid request


#### Create Ticket


Charges a Ticket Timer


Required permission: Ticket Timers - Overview



**Endpoint:** `POST /tickets/{id}/charge_timer_entry`


**Required Permission:** Required permission: Ticket Timers - Overview


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


**Response: 200**


successful


```json
{
  "ticket_id": 29,
  "id": 3,
  "notes": "Updated Notes",
  "user_id": 1,
  "toggl_id": null,
  "start_time": "2013-08-06T13:41:15.000Z",
  "end_time": "2013-08-06T14:41:15.000Z",
  "recorded": true,
  "created_at": "2019-11-05T14:58:58.047Z",
  "updated_at": "2019-11-05T14:58:58.062Z",
  "billable": false,
  "product_id": 2,
  "comment_id": null,
  "ticket_line_item_id": null,
  "active_duration": null
}
```


**Response: 404**


Invalid request

