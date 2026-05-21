# RepairShopr API Documentation - Ticket Timer

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Ticket Timer

#### Get Ticket Timers

Returns a paginated list of Ticket Timers

Required permission: Ticket Timers - Overview

**Endpoint:** `GET /ticket_timers`

**Required Permission:** Required permission: Ticket Timers - Overview

**Query Parameters:**

| Parameter     | Type    | Required | Description                                                         |
| ------------- | ------- | -------- | ------------------------------------------------------------------- |
| created_at_lt | string  | No       | Returns Ticket Timers created before the date. Example "2019-01-22" |
| created_at_gt | string  | No       | Returns Ticket Timers created after the date. Example "2019-12-22"  |
| page          | integer | No       | Returns provided page of results, each 'page' contains 25 results   |

**Response: 200**

successful

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
