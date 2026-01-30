# RepairShopr API Documentation - Payment Method

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Payment Method

#### Get Payment Methods


Returns a paginated list of Payment Methods


All Users except Single Customer Users may use this action.



**Endpoint:** `GET /payment_methods`


**Response: 200**


successful


```json
{
  "payment_methods": [
    {
      "id": 1,
      "name": "Credit Card",
      "created_at": "2019-10-28T09:55:44.304Z",
      "updated_at": "2019-10-28T09:55:44.304Z",
      "uses_card_processing": false
    },
    {
      "id": 2,
      "name": "Cash",
      "created_at": "2019-10-28T09:55:44.307Z",
      "updated_at": "2019-10-28T09:55:44.307Z",
      "uses_card_processing": false
    },
    {
      "id": 3,
      "name": "Check",
      "created_at": "2019-10-28T09:55:44.309Z",
      "updated_at": "2019-10-28T09:55:44.309Z",
      "uses_card_processing": false
    },
    {
      "id": 4,
      "name": "Offline CC",
      "created_at": "2019-10-28T09:55:44.312Z",
      "updated_at": "2019-10-28T09:55:44.312Z",
      "uses_card_processing": false
    },
    {
      "id": 5,
      "name": "Quick",
      "created_at": "2019-10-28T09:55:44.316Z",
      "updated_at": "2019-10-28T09:55:44.316Z",
      "uses_card_processing": false
    },
    {
      "id": 6,
      "name": "Other",
      "created_at": "2019-10-28T09:55:44.319Z",
      "updated_at": "2019-10-28T09:55:44.319Z",
      "uses_card_processing": false
    }
  ]
}
```

