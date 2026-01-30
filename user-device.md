# RepairShopr API Documentation - User Device

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### User Device

#### Create User Device


Creates a User Device


**Endpoint:** `POST /user_devices`


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| device_uuid | string | No |  |
| device_name | string | No |  |
| registration_token_gcm | string | No |  |
| system_name | string | No |  |
| model | string | No |  |
| screen_size | string | No |  |



**Response: 200**


successful


```json
{
  "user_id": 1,
  "registration_token_gcm": "new_token",
  "id": 5,
  "device_uuid": "u12345",
  "account_id": null,
  "name": null,
  "device_name": null,
  "system_name": null,
  "model": null,
  "screen_size": null,
  "disabled": false,
  "created_at": "2019-11-04T08:18:32.476Z",
  "updated_at": "2019-11-04T08:18:32.490Z"
}
```


**Response: 422**


Invalid request


```json
{
  "message": "Missing params device_uuid"
}
```


#### Get User Device by ID


Retrieves an existing User Device by UUID


**Endpoint:** `GET /user_devices/{id}`


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | User Device UUID |


**Response: 200**


successful


```json
{
  "user_id": 1,
  "registration_token_gcm": "new_token",
  "id": 5,
  "device_uuid": "u12345",
  "account_id": null,
  "name": null,
  "device_name": null,
  "system_name": null,
  "model": null,
  "screen_size": null,
  "disabled": false,
  "created_at": "2019-11-04T08:18:32.476Z",
  "updated_at": "2019-11-04T08:18:32.490Z"
}
```


#### Update User Device


Updates an existing User Device by UUID


**Endpoint:** `PUT /user_devices/{id}`


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Device UUID |


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| registration_token_gcm | string | No |  |



**Response: 200**


successful


```json
{
  "user_id": 1,
  "registration_token_gcm": "new_token",
  "id": 5,
  "device_uuid": "u12345",
  "account_id": null,
  "name": null,
  "device_name": null,
  "system_name": null,
  "model": null,
  "screen_size": null,
  "disabled": false,
  "created_at": "2019-11-04T08:18:32.476Z",
  "updated_at": "2019-11-04T08:18:32.490Z"
}
```

