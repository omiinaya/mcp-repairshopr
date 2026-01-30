# RepairShopr API Documentation - Assets

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.

## API Endpoints

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
