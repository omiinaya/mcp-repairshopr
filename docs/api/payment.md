# RepairShopr API Documentation - Payment

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Payment

#### Get Payments

Returns a paginated list of Payments

Required permission: Payments - View List

**Endpoint:** `GET /payments`

**Required Permission:** Required permission: Payments - View List

**Query Parameters:**

| Parameter | Type    | Required | Description                                                       |
| --------- | ------- | -------- | ----------------------------------------------------------------- |
| query     | string  | No       | Search query                                                      |
| page      | integer | No       | Returns provided page of results, each 'page' contains 25 results |

**Response: 200**

successful

```json
{
  "payments": [
    {
      "id": 1,
      "created_at": "2019-10-28T07:00:00.000Z",
      "updated_at": "2019-10-28T10:18:14.061Z",
      "success": true,
      "payment_amount": 100,
      "invoice_ids": [null],
      "ref_num": "11006",
      "applied_at": "2019-10-26T00:00:00.000Z",
      "payment_method": "Check",
      "transaction_response": null,
      "signature_date": null,
      "customer": {
        "id": 1,
        "firstname": "Walkin",
        "lastname": "Customer",
        "fullname": "Walkin Customer",
        "business_name": null,
        "email": "walkin@somedomain.com",
        "phone": "123",
        "mobile": null,
        "created_at": "2019-10-28T10:17:58.224Z",
        "updated_at": "2019-10-28T10:17:58.224Z",
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
        "location_name": null,
        "location_id": null,
        "properties": {},
        "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=xw6sk8693f35nzgcb66o",
        "tax_rate_id": null,
        "notification_email": null,
        "invoice_cc_emails": null,
        "invoice_term_id": null,
        "referred_by": null,
        "ref_customer_id": null,
        "business_and_full_name": "Walkin Customer",
        "business_then_name": "Walkin Customer",
        "contacts": []
      }
    }
  ],
  "meta": {
    "total_pages": 1,
    "page": 1
  }
}
```

#### Create Payment

Creates a Payment

Required permission: Payments - Create

**Endpoint:** `POST /payments`

**Required Permission:** Required permission: Payments - Create

**Request Body:**

| Parameter          | Type    | Required | Description                                                                                       |
| ------------------ | ------- | -------- | ------------------------------------------------------------------------------------------------- |
| customer_id        | integer | No       |                                                                                                   |
| invoice_id         | integer | No       |                                                                                                   |
| invoice_number     | string  | No       |                                                                                                   |
| amount_cents       | integer | No       |                                                                                                   |
| address_street     | string  | No       |                                                                                                   |
| address_city       | string  | No       |                                                                                                   |
| address_zip        | string  | No       |                                                                                                   |
| payment_method     | string  | No       |                                                                                                   |
| ref_num            | string  | No       |                                                                                                   |
| register_id        | integer | No       |                                                                                                   |
| signature_name     | string  | No       |                                                                                                   |
| signature_data     | string  | No       |                                                                                                   |
| signature_date     | string  | No       |                                                                                                   |
| credit_card_number | string  | No       |                                                                                                   |
| date_month         | string  | No       |                                                                                                   |
| date_year          | string  | No       |                                                                                                   |
| cvv                | string  | No       |                                                                                                   |
| lastname           | string  | No       |                                                                                                   |
| firstname          | string  | No       |                                                                                                   |
| apply_payments     | object  | No       | Object where a key is an Invoice ID and a value is a payment amount to be applied to the invoice. |

**Response: 200**

successful

```json
{
  "payment": {
    "id": 3,
    "created_at": "2019-10-28T12:45:24.315Z",
    "updated_at": "2019-10-28T12:45:24.315Z",
    "success": true,
    "payment_amount": 10,
    "invoice_ids": [1],
    "ref_num": null,
    "applied_at": "2019-10-28T00:00:00.000Z",
    "payment_method": null,
    "transaction_response": null,
    "tickets": []
  }
}
```

**Response: 422**

Invalid request

#### Get Payment by ID

Retrieves a Payment by ID

Required permission: Payments - View List

**Endpoint:** `GET /payments/{id}`

**Required Permission:** Required permission: Payments - View List

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "payment": {
    "id": 5,
    "created_at": "2019-10-28T07:00:00.000Z",
    "updated_at": "2019-10-28T13:05:27.257Z",
    "success": true,
    "payment_amount": 100,
    "invoice_ids": [null],
    "ref_num": "11006",
    "applied_at": "2019-10-26T00:00:00.000Z",
    "payment_method": "Check",
    "transaction_response": null,
    "signature_date": null,
    "customer": {
      "id": 1,
      "firstname": "Walkin",
      "lastname": "Customer",
      "fullname": "Walkin Customer",
      "business_name": null,
      "email": "walkin@somedomain.com",
      "phone": "123",
      "mobile": null,
      "created_at": "2019-10-28T13:05:13.781Z",
      "updated_at": "2019-10-28T13:05:13.781Z",
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
      "location_name": null,
      "location_id": null,
      "properties": {},
      "online_profile_url": "http://testsubdomainwi1.lvh.me//my_profile/v2/index?portal_key=9rmh69dx953bbxmyxx3u",
      "tax_rate_id": null,
      "notification_email": null,
      "invoice_cc_emails": null,
      "invoice_term_id": null,
      "referred_by": null,
      "ref_customer_id": null,
      "business_and_full_name": "Walkin Customer",
      "business_then_name": "Walkin Customer",
      "contacts": []
    }
  }
}
```

**Response: 404**

Invalid request
