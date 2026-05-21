# RepairShopr API Documentation - Product

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### Product

#### Get Products

Returns a paginated list of Products

Required permission: Products - List/Search

**Endpoint:** `GET /products`

**Required Permission:** Required permission: Products - List/Search

**Query Parameters:**

| Parameter   | Type    | Required | Description                                                        |
| ----------- | ------- | -------- | ------------------------------------------------------------------ |
| sort        | string  | No       | A Product field to order by. Example "name ASC".                   |
| sku         | string  | No       | Returns Products with the SKU.                                     |
| name        | string  | No       | Returns Products with the name.                                    |
| upc_code    | string  | No       | Returns Products with the UPC Code.                                |
| category_id | integer | No       | Returns Products from the Category.                                |
| id          | array   | No       | Any product with ID included in the list.                          |
| id_not      | array   | No       | Any product with ID not included in the list.                      |
| query       | string  | No       | Search query.                                                      |
| page        | integer | No       | Returns provided page of results, each 'page' contains 25 results. |

**Response: 200**

successful

```json
{
  "products": [
    {
      "id": 1,
      "price_cost": 0.01,
      "price_retail": 0.01,
      "condition": null,
      "description": "Description #1",
      "maintain_stock": false,
      "name": "Product #1",
      "quantity": 100,
      "warranty": null,
      "sort_order": null,
      "reorder_at": null,
      "disabled": false,
      "taxable": true,
      "product_category": null,
      "category_path": null,
      "upc_code": null,
      "discount_percent": null,
      "warranty_template_id": null,
      "qb_item_id": 1,
      "desired_stock_level": null,
      "price_wholesale": 0,
      "notes": null,
      "tax_rate_id": null,
      "physical_location": null,
      "serialized": false,
      "vendor_ids": [],
      "long_description": null,
      "location_quantities": [],
      "photos": []
    }
  ]
}
```

#### Create Product

Creates a Product

Required permission: Products - Create

**Endpoint:** `POST /products`

**Required Permission:** Required permission: Products - Create

**Request Body:**

| Parameter               | Type    | Required | Description |
| ----------------------- | ------- | -------- | ----------- |
| price_cost              | number  | No       |             |
| price_retail            | number  | No       |             |
| condition               | string  | No       |             |
| description             | string  | Yes      |             |
| maintain_stock          | boolean | No       |             |
| name                    | string  | Yes      |             |
| quantity                | integer | No       |             |
| warranty                | string  | No       |             |
| sort_order              | integer | No       |             |
| reorder_at              | integer | No       |             |
| disabled                | boolean | No       |             |
| taxable                 | boolean | No       |             |
| product_category        | string  | No       |             |
| upc_code                | string  | No       |             |
| discount_percent        | number  | No       |             |
| warranty_template_id    | integer | No       |             |
| qb_item_id              | integer | No       |             |
| desired_stock_level     | integer | No       |             |
| price_wholesale         | number  | No       |             |
| notes                   | string  | No       |             |
| tax_rate_id             | integer | No       |             |
| vendor_ids              | array   | No       |             |
| physical_location       | string  | No       |             |
| serialized              | boolean | No       |             |
| category_ids            | array   | No       |             |
| product_skus_attributes | array   | No       |             |

**Response: 200**

successful

```json
{
  "product": {
    "id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "condition": null,
    "description": "Description #1",
    "maintain_stock": false,
    "name": "Product #1",
    "quantity": 100,
    "warranty": null,
    "sort_order": null,
    "reorder_at": null,
    "disabled": false,
    "taxable": true,
    "product_category": null,
    "category_path": null,
    "upc_code": null,
    "discount_percent": null,
    "warranty_template_id": null,
    "qb_item_id": 1,
    "desired_stock_level": null,
    "price_wholesale": 0,
    "notes": null,
    "tax_rate_id": null,
    "physical_location": null,
    "serialized": false,
    "vendor_ids": [],
    "long_description": null,
    "location_quantities": [],
    "photos": []
  }
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Name can't be blank", "Description can't be blank"],
  "params": {
    "name": "",
    "maintain_stock": false
  }
}
```

#### Get Product by ID

Retrieves a Product by ID

Required permission: Products - List/Search

**Endpoint:** `GET /products/{id}`

**Required Permission:** Required permission: Products - List/Search

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Response: 200**

successful

```json
{
  "product": {
    "id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "condition": null,
    "description": "Description #1",
    "maintain_stock": false,
    "name": "Product #1",
    "quantity": 100,
    "warranty": null,
    "sort_order": null,
    "reorder_at": null,
    "disabled": false,
    "taxable": true,
    "product_category": null,
    "category_path": null,
    "upc_code": null,
    "discount_percent": null,
    "warranty_template_id": null,
    "qb_item_id": 1,
    "desired_stock_level": null,
    "price_wholesale": 0,
    "notes": null,
    "tax_rate_id": null,
    "physical_location": null,
    "serialized": false,
    "vendor_ids": [],
    "long_description": null,
    "location_quantities": [],
    "photos": []
  }
}
```

**Response: 404**

Invalid request

#### Update Product

Updates an existing Product by ID

Required permission: Products - Edit

**Endpoint:** `PUT /products/{id}`

**Required Permission:** Required permission: Products - Edit

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

| Parameter               | Type    | Required | Description |
| ----------------------- | ------- | -------- | ----------- |
| price_cost              | number  | No       |             |
| price_retail            | number  | No       |             |
| condition               | string  | No       |             |
| description             | string  | Yes      |             |
| maintain_stock          | boolean | No       |             |
| name                    | string  | Yes      |             |
| quantity                | integer | No       |             |
| warranty                | string  | No       |             |
| sort_order              | integer | No       |             |
| reorder_at              | integer | No       |             |
| disabled                | boolean | No       |             |
| taxable                 | boolean | No       |             |
| product_category        | string  | No       |             |
| upc_code                | string  | No       |             |
| discount_percent        | number  | No       |             |
| warranty_template_id    | integer | No       |             |
| qb_item_id              | integer | No       |             |
| desired_stock_level     | integer | No       |             |
| price_wholesale         | number  | No       |             |
| notes                   | string  | No       |             |
| tax_rate_id             | integer | No       |             |
| vendor_ids              | array   | No       |             |
| physical_location       | string  | No       |             |
| serialized              | boolean | No       |             |
| category_ids            | array   | No       |             |
| product_skus_attributes | array   | No       |             |

**Response: 200**

successful

```json
{
  "product": {
    "id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "condition": null,
    "description": "Description #1",
    "maintain_stock": false,
    "name": "Product #1",
    "quantity": 100,
    "warranty": null,
    "sort_order": null,
    "reorder_at": null,
    "disabled": false,
    "taxable": true,
    "product_category": null,
    "category_path": null,
    "upc_code": null,
    "discount_percent": null,
    "warranty_template_id": null,
    "qb_item_id": 1,
    "desired_stock_level": null,
    "price_wholesale": 0,
    "notes": null,
    "tax_rate_id": null,
    "physical_location": null,
    "serialized": false,
    "vendor_ids": [],
    "long_description": null,
    "location_quantities": [],
    "photos": []
  }
}
```

**Response: 422**

Invalid request

```json
{
  "success": false,
  "message": ["Name can't be blank"]
}
```

#### Get Barcodes

Returns a Product by Barcode

Required permission: Products - List/Search

**Endpoint:** `GET /products/barcode`

**Required Permission:** Required permission: Products - List/Search

**Query Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| barcode   | string | No       | Product Barcode string |

**Response: 200**

successful

```json
{
  "product": {
    "id": 1,
    "price_cost": 0.01,
    "price_retail": 0.01,
    "condition": null,
    "description": "Description #1",
    "maintain_stock": false,
    "name": "Product #1",
    "quantity": 100,
    "warranty": null,
    "sort_order": null,
    "reorder_at": null,
    "disabled": false,
    "taxable": true,
    "product_category": null,
    "category_path": null,
    "upc_code": null,
    "discount_percent": null,
    "warranty_template_id": null,
    "qb_item_id": 1,
    "desired_stock_level": null,
    "price_wholesale": 0,
    "notes": null,
    "tax_rate_id": null,
    "physical_location": null,
    "serialized": false,
    "vendor_ids": [],
    "long_description": null,
    "location_quantities": [],
    "photos": []
  }
}
```

#### Get Categories

Returns a paginated list of Product Categories

Required permission: Products - List/Search

**Endpoint:** `GET /products/categories`

**Required Permission:** Required permission: Products - List/Search

**Response: 200**

successful

```json
{
  "categories": [
    {
      "id": 1,
      "account_id": 1,
      "ancestry": null,
      "name": "Root Category",
      "description": "Root Category",
      "device_product_id": null,
      "names_depth_cache": "Root Category"
    }
  ]
}
```

#### Create Product

Creates a Product Image

Required permission: Products - Edit

**Endpoint:** `POST /products/{id}/add_images`

**Required Permission:** Required permission: Products - Edit

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

**Response: 200**

successful

```json
{
  "message": "Success! Those will be added shortly in background workers."
}
```

**Response: 422**

Invalid request

```json
{
  "error": "Please pass 'url' & 'filename' or 'files([{}])' parameter."
}
```

#### Delete Product

Deletes a Product Image

**Endpoint:** `DELETE /products/{id}/delete_image`

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |
| photo_id  | integer | No       |             |

**Response: 200**

successful

```json
{
  "message": "Success! Image removed."
}
```

**Response: 404**

Invalid request

```json
{
  "message": "Photo Not Found."
}
```

#### Update Product

Updates a Location Quantity

Required permission: Products - Edit Quantities

**Endpoint:** `PUT /products/{id}/location_quantities`

**Required Permission:** Required permission: Products - Edit Quantities

**Path Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| id        | integer | Yes      |             |

**Request Body:**

| Parameter            | Type    | Required | Description |
| -------------------- | ------- | -------- | ----------- |
| location_quantity_id | integer | No       |             |
| quantity             | integer | No       |             |

**Response: 200**

successful

```json
{
  "product_id": 15,
  "id": 1,
  "quantity": 100,
  "price_cost_cents": null,
  "price_retail_cents": null,
  "location_id": 1,
  "tax_rate_id": null,
  "created_at": "2019-10-25T10:08:05.205Z",
  "updated_at": "2019-10-25T10:08:05.227Z",
  "reorder_at": null,
  "desired_stock_level": 0
}
```
