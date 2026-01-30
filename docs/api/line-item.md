# RepairShopr API Documentation - Line Item

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Line Item

#### Get Line Items


Returns a paginated list of Line Items


Required permission: Global Admin



**Endpoint:** `GET /line_items`


**Required Permission:** Required permission: Global Admin


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| invoice_id | integer | No | Returns Line Items that belong to an Invoice ID |
| estimate_id | integer | No | Returns Line Items that belong to an Estimate ID |
| invoice_id_not_null | boolean | No | Returns Line Items that belong to any Invoice |
| estimate_id_not_null | boolean | No | Returns Line Items that belong to any Estimate |


**Response: 200**


successful


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

