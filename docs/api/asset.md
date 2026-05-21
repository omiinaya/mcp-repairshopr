# RepairShopr API Documentation - Asset

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Asset

#### Get Customer Assets

Returns a paginated list of Assets

Required permission: Assets - List/Search
Single-Customer Users can only access own assets.

**Endpoint:** `GET /customer_assets`

**Required Permission:** Required permission: Assets - List/Search

**Query Parameters:**

| Parameter     | Type    | Required | Description                                                       |
| ------------- | ------- | -------- | ----------------------------------------------------------------- |
| snmp_enabled  | boolean | No       | Any assets with SNMP enabled                                      |
| customer_id   | integer | No       | Any assets attached to a Customer ID                              |
| asset_type_id | integer | No       | Any assets attached to an Asset Type ID                           |
| query         | string  | No       | Search query                                                      |
| page          | integer | No       | Returns provided page of results, each 'page' contains 25 results |

**Response: 200**

successful

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

#### Create Customer Asset

Creates an Asset

Required permission: Assets - Create
Single-Customer Users can only access own assets.

**Endpoint:** `POST /customer_assets`

**Required Permission:** Required permission: Assets - Create

**Request Body:**

| Parameter       | Type    | Required | Description |
| --------------- | ------- | -------- | ----------- |
| asset_type_name | string  | No       |             |
| asset_type_id   | integer | No       |             |
| properties      | object  | No       |             |
| name            | string  | Yes      |             |
| customer_id     | integer | No       |             |
| asset_serial    | string  | No       |             |

**Response: 200**

successful

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

**Response: 422**

Invalid request

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

#### Get Customer Asset by ID

Retrieves an Asset by ID

Required permission: Assets - View Details
Single-Customer Users can only access own assets.

**Endpoint:** `GET /customer_assets/{id}`

**Required Permission:** Required permission: Assets - View Details

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "type": "object",
  "properties": {
    "id": 0,
    "asset_id": 0,
    "account_id": 0,
    "type": "object",
    "properties": null,
    "created_at": "string",
    "updated_at": "string",
    "override_alert_agent_offline_mins": null,
    "override_alert_agent_rearm_after_mins": null,
    "override_low_hd_threshold": null,
    "override_autoresolve_offline_alert": null,
    "override_low_hd_thresholds": null
  }
}
```

**Response: 404**

Invalid request

#### Update Customer Asset

Updates an existing Asset by ID

Required permission: Assets - Edit
Single-Customer Users can only access own assets.

**Endpoint:** `PUT /customer_assets/{id}`

**Required Permission:** Required permission: Assets - Edit

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

| Parameter       | Type    | Required | Description |
| --------------- | ------- | -------- | ----------- |
| asset_type_name | string  | No       |             |
| asset_type_id   | integer | No       |             |
| properties      | object  | No       |             |
| name            | string  | Yes      |             |
| customer_id     | integer | No       |             |
| asset_serial    | string  | No       |             |

**Response: 200**

successful

```json
{
  "type": "object",
  "properties": {
    "id": 0,
    "asset_id": 0,
    "account_id": 0,
    "type": "object",
    "properties": null,
    "created_at": "string",
    "updated_at": "string",
    "override_alert_agent_offline_mins": null,
    "override_alert_agent_rearm_after_mins": null,
    "override_low_hd_threshold": null,
    "override_autoresolve_offline_alert": null,
    "override_low_hd_thresholds": null
  }
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Asset type can't be blank"]
}
```
