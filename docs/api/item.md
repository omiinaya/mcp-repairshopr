# RepairShopr API Documentation - Item

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Item

#### Get Items

Returns a paginated list of Part Orders

Required permission: Parts Orders - List/Search

**Endpoint:** `GET /items`

**Required Permission:** Required permission: Parts Orders - List/Search

**Query Parameters:**

| Parameter | Type    | Required | Description                                                       |
| --------- | ------- | -------- | ----------------------------------------------------------------- |
| completed | boolean | No       | Returns only completed part orders                                |
| query     | string  | No       | Search query                                                      |
| page      | integer | No       | Returns provided page of results, each 'page' contains 50 results |

**Response: 200**

successful

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
