# RepairShopr API Documentation - Search

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Search

#### Get Searchs


Search all the things


Additional permissions required depending on search results type:
- Customer, Contact, Asset: "Customers - List/Search"
- Lead: Leads - List/Search
- Invoice: Invoices - List/Search
- Estimate: Estimates - List/Search
- Ticket: Tickets - List/Search
- Product: Products - List/Search
- Purchase Order, Vendor: Purchase Orders - List/Search
- Report: Reports - View
- Wiki: Documentation - Allow Usage



**Endpoint:** `GET /search`


**Required Permission:** Additional permissions required depending on search results type:


**Query Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | integer | No | Search query |


**Response: 200**


successful


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

