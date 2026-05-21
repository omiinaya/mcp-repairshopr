# RepairShopr API Documentation - Setting

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Setting

#### Get Settings

Returns a list of Account Settings

**Endpoint:** `GET /settings`

**Response: 200**

successful

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
    "problem_types": ["Virus", "TuneUp", "Hardware", "Software", "Other"],
    "priorities": ["", "0 Urgent", "1 High", "2 Normal", "3 Low"]
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

#### Get Tabs

Returns Tabs Settings

**Endpoint:** `GET /settings/tabs`

**Response: 200**

successful

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
    "sales": true,
    "leads": true,
    "domo": false,
    "marketr": true,
    "recur": false,
    "reports": false,
    "wiki": false,
    "app_center": false,
    "pax8": false
  }
}
```

#### Get Printings

Returns Printing Settings

**Endpoint:** `GET /settings/printing`

**Response: 200**

successful

```json
{
  "messaging_channel": "100000000000000000001",
  "registers": []
}
```
