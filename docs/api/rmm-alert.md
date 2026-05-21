# RepairShopr API Documentation - Rmm Alert

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Rmm Alert

#### Get Rmm Alerts

Returns a paginated list of RMM Alerts

Required permission: RMM Alerts - List
Single-Customer Users can only access own RMM Alerts.

**Endpoint:** `GET /rmm_alerts`

**Required Permission:** Required permission: RMM Alerts - List

**Query Parameters:**

| Parameter | Type    | Required | Description                                                       |
| --------- | ------- | -------- | ----------------------------------------------------------------- |
| status    | string  | No       | Possible values resolved, all, active.                            |
| page      | integer | No       | Returns provided page of results, each 'page' contains 25 results |

**Response: 200**

successful

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

#### Create Rmm Alert

Creates an RMM Alert

Required permission: RMM Alerts - Create
Single-Customer Users can only access own RMM Alerts.

**Endpoint:** `POST /rmm_alerts`

**Required Permission:** Required permission: RMM Alerts - Create

**Request Body:**

| Parameter   | Type    | Required | Description |
| ----------- | ------- | -------- | ----------- |
| customer_id | integer | No       |             |
| asset_id    | integer | No       |             |
| description | string  | No       |             |
| resolved    | boolean | No       |             |
| status      | string  | No       |             |
| properties  | object  | No       |             |

**Response: 201**

successful

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

#### Create Rmm Alert

Mutes an RMM Alert by ID

Required permission: RMM Alerts - Clear/Manage
Single-Customer Users can only access own RMM Alerts.

**Endpoint:** `POST /rmm_alerts/{id}/mute`

**Required Permission:** Required permission: RMM Alerts - Clear/Manage

**Path Parameters:**

| Parameter | Type    | Required | Description                                                                                                               |
| --------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| id        | integer | Yes      |                                                                                                                           |
| mute_for  | string  | Yes      | Length of time to mute alert for. Accepted values: '1-hour', '1-day', '2-days', '1-week', '2-weeks', '1-month', 'forever' |

**Response: 200**

successful

```json
{
  "success": "true"
}
```

**Response: 404**

Invalid request

**Response: 422**

Invalid Request

#### Get Rmm Alert by ID

Retrieves an RMM Alert by ID

Required permission: RMM Alerts - List
Single-Customer Users can only access own RMM Alerts.

**Endpoint:** `GET /rmm_alerts/{id}`

**Required Permission:** Required permission: RMM Alerts - List

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

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

**Response: 404**

Invalid request

#### Delete Rmm Alert

Deletes/Clears an RMM Alert by ID

Required permission: RMM Alerts - Delete
Single-Customer Users can only access own RMM Alerts.

**Endpoint:** `DELETE /rmm_alerts/{id}`

**Required Permission:** Required permission: RMM Alerts - Delete

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "success": "true"
}
```

**Response: 404**

Invalid request
