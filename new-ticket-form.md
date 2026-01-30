# RepairShopr API Documentation - New Ticket Form

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### New Ticket Form

#### Get New Ticket Forms


Returns a paginated list of Ticket Forms


Required permission: Ticket Workflows - Manage



**Endpoint:** `GET /new_ticket_forms`


**Required Permission:** Required permission: Ticket Workflows - Manage


**Response: 200**


successful


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


#### Get New Ticket Form by ID


Retrieves a Ticket Form


Required permission: Tickets - Create



**Endpoint:** `GET /new_ticket_forms/{id}`


**Required Permission:** Required permission: Tickets - Create


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


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


**Response: 404**


Invalid request


#### Create New Ticket Form


Creates a new Ticket for a Ticket Form


Required permission: Tickets - Create



**Endpoint:** `POST /new_ticket_forms/{id}/process_form`


**Required Permission:** Required permission: Tickets - Create


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_details | object | No |  |
| ticket_details | object | No |  |
| appointments | object | No |  |



**Response: 200**


successful


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


**Response: 422**


Invalid request


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

