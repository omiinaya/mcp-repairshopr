# Documentation Analysis Report

## Overview

This report documents the analysis of 29 API documentation files in the `docs/api/` directory for the RepairShopr API. The analysis covers common patterns, edge cases, metadata extraction points, and endpoint relationships.

## List of All 29 API Documentation Files

1. [`appointment-type.md`](docs/api/appointment-type.md) - Appointment Type endpoints
2. [`appointment.md`](docs/api/appointment.md) - Appointment endpoints
3. [`asset.md`](docs/api/asset.md) - Asset endpoints
4. [`call.md`](docs/api/call.md) - Call endpoints
5. [`canned-response.md`](docs/api/canned-response.md) - Canned Response endpoints
6. [`contact.md`](docs/api/contact.md) - Contact endpoints
7. [`contract.md`](docs/api/contract.md) - Contract endpoints
8. [`customer.md`](docs/api/customer.md) - Customer endpoints
9. [`estimate.md`](docs/api/estimate.md) - Estimate endpoints
10. [`index.md`](docs/api/index.md) - API index/navigation
11. [`invoice.md`](docs/api/invoice.md) - Invoice endpoints
12. [`invoiceline-item.md`](docs/api/invoiceline-item.md) - Invoice Line Item endpoints
13. [`item.md`](docs/api/item.md) - Item endpoints
14. [`lead.md`](docs/api/lead.md) - Lead endpoints
15. [`line-item.md`](docs/api/line-item.md) - Line Item endpoints
16. [`new-ticket-form.md`](docs/api/new-ticket-form.md) - New Ticket Form endpoints
17. [`payment-method.md`](docs/api/payment-method.md) - Payment Method endpoints
18. [`payment-profile.md`](docs/api/payment-profile.md) - Payment Profile endpoints
19. [`payment.md`](docs/api/payment.md) - Payment endpoints
20. [`phone.md`](docs/api/phone.md) - Phone endpoints
21. [`portal-user.md`](docs/api/portal-user.md) - Portal User endpoints
22. [`product-serial.md`](docs/api/product-serial.md) - Product Serial endpoints
23. [`product.md`](docs/api/product.md) - Product endpoints
24. [`purchase-order.md`](docs/api/purchase-order.md) - Purchase Order endpoints
25. [`rmm-alert.md`](docs/api/rmm-alert.md) - RMM Alert endpoints
26. [`schedule.md`](docs/api/schedule.md) - Schedule endpoints
27. [`search.md`](docs/api/search.md) - Search endpoints
28. [`setting.md`](docs/api/setting.md) - Setting endpoints
29. [`ticket-timer.md`](docs/api/ticket-timer.md) - Ticket Timer endpoints
30. [`ticket.md`](docs/api/ticket.md) - Ticket endpoints
31. [`timelog.md`](docs/api/timelog.md) - Timelog endpoints
32. [`user-device.md`](docs/api/user-device.md) - User Device endpoints
33. [`user.md`](docs/api/user.md) - User endpoints
34. [`vendor.md`](docs/api/vendor.md) - Vendor endpoints
35. [`wiki-page.md`](docs/api/wiki-page.md) - Wiki Page endpoints
36. [`worksheet-result.md`](docs/api/worksheet-result.md) - Worksheet Result endpoints

## Common Markdown Structure Pattern

All documentation files follow a consistent structure:

````markdown
# RepairShopr API Documentation - [Resource Name]

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### [Resource Name]

#### [Operation Name]

[Description text]

[Additional permission notes]

**Endpoint:** `[METHOD] /path`

**Required Permission:** [Permission string]

[Optional Query Parameters section]

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| ...       | ...  | ...      | ...         |

[Optional Path Parameters section]

[Optional Request Body section]

**Response: [Status Code]**

[Description]

```json
{...}
```
````

[Multiple response sections possible]

````

### Key Structural Elements

1. **Header**: Always starts with `# RepairShopr API Documentation - [Resource Name]`
2. **Note Block**: Contains auto-generation notice
3. **Section Header**: `## API Endpoints`
4. **Resource Header**: `### [Resource Name]`
5. **Operation Headers**: `#### [Operation Name]`
6. **Endpoint Declaration**: `**Endpoint:** `METHOD /path``
7. **Permission Declaration**: `**Required Permission:** [permission]`
8. **Parameter Tables**: Markdown tables for query/path/body parameters
9. **Response Sections**: Multiple response blocks with status codes and JSON examples

## Edge Cases and Formatting Variations

### 1. Permission Format Variations

- **Standard format**: `Required permission: [Permission Name]`
- **Multiple permissions**: `Required permissions: "Permission A" and "Permission B"`
- **No permissions**: `No special permissions required.` or `Required permission: None`
- **Conditional permissions**: `Users with permission "X" may see... Otherwise, results scoped to current user.`

### 2. Parameter Section Variations

- **Missing sections**: Some endpoints have no query parameters, path parameters, or request body
- **Empty tables**: Some endpoints have parameter tables with no rows
- **Mixed parameter locations**: Some endpoints have both query and path parameters
- **Nested parameters**: Some request bodies contain nested objects (e.g., `apply_payments` object in payment creation)

### 3. Response Variations

- **Multiple responses**: Most endpoints have 200, 404, and 422 responses
- **Different success codes**: Some use 200, others use 201 for creation
- **Empty responses**: Some responses have no JSON body (e.g., 204 No Content)
- **Error responses**: 401 (Unauthorized), 404 (Not Found), 422 (Unprocessable Entity)
- **No example JSON**: Some responses lack example JSON blocks

### 4. Endpoint Path Variations

- **Simple paths**: `/customers`, `/tickets`
- **ID-based paths**: `/customers/{id}`, `/tickets/{id}`
- **Nested paths**: `/customers/{customer_id}/phones`, `/tickets/{id}/comments`
- **Action paths**: `/tickets/{id}/print`, `/invoices/{id}/email`
- **Special paths**: `/me`, `/search`, `/settings`

### 5. Description Variations

- **Empty descriptions**: Some operation sections have blank description lines
- **Multi-line descriptions**: Some descriptions span multiple lines
- **Additional context**: Some include notes about Single-Customer Users or other restrictions

### 6. HTTP Method Variations

- **Standard methods**: GET, POST, PUT, DELETE
- **Patch method**: Used for partial updates (e.g., `PATCH /canned_responses/{id}`)
- **Inconsistent naming**: Some operations use "Create" for POST, others use resource name

## Metadata Extraction Points

### 1. Resource Name

**Location**: Extracted from the main header (`# RepairShopr API Documentation - [Resource Name]`)

**Examples**:
- `appointment-type.md` → "Appointment Type"
- `customer.md` → "Customer"
- `ticket.md` → "Ticket"

**Extraction Strategy**: Parse the first line, remove the prefix, and trim whitespace.

### 2. Operation Name

**Location**: Fourth-level header (`#### [Operation Name]`)

**Examples**:
- `#### Get Customers`
- `#### Create Ticket`
- `#### Update Appointment`

**Extraction Strategy**: Extract text from `####` headers within the resource section.

### 3. Description

**Location**: Text between operation header and endpoint declaration

**Extraction Strategy**: Collect all text between `####` header and `**Endpoint:**` line, handling multi-line descriptions.

### 4. HTTP Method

**Location**: Inside `**Endpoint:**` declaration

**Pattern**: `**Endpoint:** `METHOD /path``

**Extraction Strategy**: Extract the HTTP method (GET, POST, PUT, PATCH, DELETE) from the endpoint line.

### 5. Path

**Location**: Inside `**Endpoint:**` declaration

**Pattern**: `**Endpoint:** `METHOD /path``

**Extraction Strategy**: Extract the path portion, including path parameters like `{id}`.

### 6. Permission

**Location**: `**Required Permission:**` line

**Variations**:
- `**Required Permission:** Required permission: Global Admin`
- `**Required Permission:** Required permissions: "A" and "B"`
- `**Required Permission:** No special permissions required.`

**Extraction Strategy**: Extract the permission text, handling multiple permissions and "None" cases.

### 7. Query Parameters

**Location**: Markdown table under `**Query Parameters:**` header

**Table Structure**:
```markdown
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes/No | description |
````

**Extraction Strategy**: Parse the table rows, extracting name, type, required (Yes/No), and description.

### 8. Path Parameters

**Location**: Markdown table under `**Path Parameters:**` header

**Table Structure**: Same as query parameters

**Extraction Strategy**: Parse the table rows, marking `paramType` as 'path'.

### 9. Request Body Parameters

**Location**: Markdown table under `**Request Body:**` header

**Table Structure**: Same as query parameters

**Extraction Strategy**: Parse the table rows, marking `paramType` as 'body'.

### 10. Response Status Codes

**Location**: `**Response: [Code]**` headers

**Extraction Strategy**: Extract the numeric status code from the response header.

### 11. Response Descriptions

**Location**: Text between `**Response: [Code]**` and JSON code block

**Extraction Strategy**: Collect text between response header and ```json block.

### 12. Response Examples

**Location**: JSON code blocks after response descriptions

**Extraction Strategy**: Parse the JSON content within `json` blocks.

## Endpoint Relationships

### Direct Relationships

1. **Customer → Contact**
   - Customer has many contacts
   - Contact belongs to a customer (`customer_id` field)

2. **Customer → Phone**
   - Customer has many phones
   - Phone belongs to a customer (`customer_id` field)

3. **Customer → Asset**
   - Customer has many assets
   - Asset belongs to a customer (`customer_id` field)

4. **Customer → Invoice**
   - Customer has many invoices
   - Invoice belongs to a customer (`customer_id` field)

5. **Customer → Estimate**
   - Customer has many estimates
   - Estimate belongs to a customer (`customer_id` field)

6. **Customer → Payment**
   - Customer has many payments
   - Payment belongs to a customer (`customer_id` field)

7. **Customer → Payment Profile**
   - Customer has many payment profiles
   - Payment Profile belongs to a customer (`customer_id` field)

8. **Customer → Contract**
   - Customer has many contracts
   - Contract belongs to a customer (`customer_id` field)

9. **Customer → Lead**
   - Lead can be converted to a customer
   - Lead has `customer_id` field

10. **Ticket → Customer**
    - Ticket belongs to a customer (`customer_id` field)
    - Customer has many tickets

11. **Ticket → Invoice**
    - Ticket can be linked to an invoice (`ticket_id` field)
    - Invoice can have a ticket reference

12. **Ticket → Timelog**
    - Ticket has many timelogs
    - Timelog belongs to a ticket

13. **Ticket → Worksheet Result**
    - Ticket has many worksheet results
    - Worksheet Result belongs to a ticket

14. **Ticket → Line Item**
    - Ticket has many line items
    - Line Item belongs to a ticket

15. **Ticket → Comment**
    - Ticket has many comments
    - Comment belongs to a ticket

16. **Ticket → Timer**
    - Ticket has many timers
    - Timer belongs to a ticket

17. **Invoice → Line Item**
    - Invoice has many line items
    - Line Item belongs to an invoice

18. **Estimate → Line Item**
    - Estimate has many line items
    - Line Item belongs to an estimate

19. **Estimate → Invoice**
    - Estimate can be converted to an invoice
    - `POST /estimates/{id}/convert_to_invoice`

20. **Product → Product Serial**
    - Product has many serial numbers
    - Product Serial belongs to a product

21. **Purchase Order → Vendor**
    - Purchase Order belongs to a vendor (`vendor_id` field)
    - Vendor has many purchase orders

22. **Purchase Order → Line Item**
    - Purchase Order has many line items
    - Line Item belongs to a purchase order

23. **Appointment → Customer**
    - Appointment belongs to a customer (`customer_id` field)
    - Customer has many appointments

24. **Appointment → Ticket**
    - Appointment can be linked to a ticket (`ticket_id` field)

25. **RMM Alert → Asset**
    - RMM Alert belongs to an asset (`asset_id` field)
    - Asset has many RMM alerts

26. **RMM Alert → Ticket**
    - RMM Alert can be linked to a ticket (`ticket_id` field)

27. **Schedule → Customer**
    - Schedule belongs to a customer (`customer_id` field)
    - Customer has many schedules

28. **User → Ticket**
    - User can be assigned to tickets (`user_id` field)
    - User has many assigned tickets

29. **User → Timelog**
    - User has many timelogs
    - Timelog belongs to a user

30. **Contact → Customer**
    - Contact belongs to a customer (`customer_id` field)
    - Customer has many contacts

### Nested Resource Endpoints

Many endpoints use nested paths to express relationships:

- `/customers/{customer_id}/phones` - Phone endpoints scoped to a customer
- `/customers/{customer_id}/payment_profiles` - Payment Profile endpoints scoped to a customer
- `/tickets/{id}/comments` - Comment endpoints scoped to a ticket
- `/tickets/{id}/timer_entry` - Timer endpoints scoped to a ticket
- `/tickets/{id}/worksheet_results` - Worksheet Result endpoints scoped to a ticket
- `/invoices/{id}/line_items` - Line Item endpoints scoped to an invoice
- `/estimates/{id}/line_items` - Line Item endpoints scoped to an estimate
- `/products/{product_id}/product_serials` - Product Serial endpoints scoped to a product

### Action Endpoints

Some endpoints represent actions rather than CRUD operations:

- `/tickets/{id}/print` - Print a ticket
- `/tickets/{id}/email` - Email a ticket (not present, but similar pattern exists)
- `/invoices/{id}/print` - Print an invoice
- `/invoices/{id}/email` - Email an invoice
- `/estimates/{id}/print` - Print an estimate
- `/estimates/{id}/email` - Email an estimate
- `/estimates/{id}/convert_to_invoice` - Convert estimate to invoice
- `/rmm_alerts/{id}/mute` - Mute an RMM alert
- `/portal_users/create_invitation` - Create an invitation
- `/new_ticket_forms/{id}/process_form` - Process a ticket form

## Example Parsed Structure

Here's an example of how a single endpoint would be parsed:

### Original Markdown (from [`customer.md`](docs/api/customer.md:9-43))

````markdown
#### Get Customers

Returns a paginated list of customers

Required permission: Customers - List/Search
Single-Customer Users can only access own customer (self).

**Endpoint:** `GET /customers`

**Required Permission:** Required permission: Customers - List/Search

**Query Parameters:**

| Parameter        | Type    | Required | Description                                                               |
| ---------------- | ------- | -------- | ------------------------------------------------------------------------- |
| sort             | string  | No       | A customer field to order by. Examples "firstname ASC", "city DESC".      |
| query            | string  | No       | Search query                                                              |
| firstname        | string  | No       | Any customers with a first name like the parameter                        |
| lastname         | string  | No       | Any customers with a last name like the parameter                         |
| business_name    | string  | No       | Any customers with a business name like the parameter                     |
| id               | array   | No       | Any customers with ID included in the list                                |
| not_id           | array   | No       | Any customers with ID not included in the list                            |
| email            | string  | No       |                                                                           |
| include_disabled | string  | No       | Whether or not the returned list of customers includes disabled customers |
| page             | integer | No       | Returns provided page of results, each 'page' contains 25 results         |

**Response: 200**

successful

```json
{
  "customers": [...]
}
```
````

````

### Parsed Structure

```typescript
{
  resource: "Customer",
  operation: "Get Customers",
  description: "Returns a paginated list of customers\n\nRequired permission: Customers - List/Search\nSingle-Customer Users can only access own customer (self).",
  method: "GET",
  path: "/customers",
  permission: "Required permission: Customers - List/Search",
  parameters: [
    {
      name: "sort",
      type: "string",
      required: false,
      description: "A customer field to order by. Examples \"firstname ASC\", \"city DESC\".",
      paramType: "query"
    },
    {
      name: "query",
      type: "string",
      required: false,
      description: "Search query",
      paramType: "query"
    },
    {
      name: "firstname",
      type: "string",
      required: false,
      description: "Any customers with a first name like the parameter",
      paramType: "query"
    },
    {
      name: "lastname",
      type: "string",
      required: false,
      description: "Any customers with a last name like the parameter",
      paramType: "query"
    },
    {
      name: "business_name",
      type: "string",
      required: false,
      description: "Any customers with a business name like the parameter",
      paramType: "query"
    },
    {
      name: "id",
      type: "array",
      required: false,
      description: "Any customers with ID included in the list",
      paramType: "query"
    },
    {
      name: "not_id",
      type: "array",
      required: false,
      description: "Any customers with ID not included in the list",
      paramType: "query"
    },
    {
      name: "email",
      type: "string",
      required: false,
      description: "",
      paramType: "query"
    },
    {
      name: "include_disabled",
      type: "string",
      required: false,
      description: "Whether or not the returned list of customers includes disabled customers",
      paramType: "query"
    },
    {
      name: "page",
      type: "integer",
      required: false,
      description: "Returns provided page of results, each 'page' contains 25 results",
      paramType: "query"
    }
  ],
  responses: [
    {
      statusCode: 200,
      description: "successful",
      example: {
        "customers": [...]
      }
    }
  ]
}
````

## Summary

The RepairShopr API documentation follows a consistent but flexible structure. The parser must handle:

1. **Multiple permission formats** (single, multiple, none, conditional)
2. **Optional parameter sections** (query, path, body may be missing)
3. **Multiple response codes** (200, 201, 204, 401, 404, 422)
4. **Nested resource paths** (e.g., `/customers/{id}/phones`)
5. **Action endpoints** (e.g., `/tickets/{id}/print`)
6. **Empty descriptions and tables**
7. **Multi-line descriptions**
8. **Complex relationships** between resources

The parsing strategy should be robust enough to handle these variations while extracting all necessary metadata for building a comprehensive API index and retrieval system.
