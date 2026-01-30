# RepairShopr API Documentation - User

> **Note:** This file was automatically generated from the RepairShopr API swagger.json.

## API Endpoints

### User

#### Get Mes


Returns the current user


**Endpoint:** `GET /me`


**Response: 200**


successful


```json
{
  "user_token": "3746f72b-9852-4d1a-84e9-eedb5c50abcd",
  "user_email": "joedoe@example.com",
  "user_name": "Joe Doe",
  "user_id": 1,
  "admin": true,
  "can_use_app": true,
  "two_factor_required": false,
  "subdomain": "testsubdomainwi1",
  "default_location": null,
  "enable_multi_locations": false,
  "locations_allowed": [],
  "permissions": {
    "asset": {
      "read": true,
      "write": true,
      "delete": true
    },
    "customer": {
      "read": true,
      "write": true,
      "delete": true
    },
    "ticket": {
      "read": true,
      "write": true,
      "delete": true
    },
    "invoice": {
      "read": true,
      "write": true,
      "delete": true
    },
    "payment": {
      "read": true,
      "write": true,
      "delete": true
    },
    "worksheet": {
      "add": true,
      "manage": true,
      "delete": true
    },
    "script": {
      "execute": true
    }
  }
}
```


#### Get Users


Returns a paginated list of Users


**Endpoint:** `GET /users`


**Response: 200**


successful


```json
{
  "users": [
    [
      1,
      "Joe Doe"
    ]
  ]
}
```


#### Create Otp Login


Authorize a User with One Time Password


**Endpoint:** `POST /otp_login`


**Request Body:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | No |  |



**Response: 200**


successful


```json
{
  "login": true,
  "session_token": "1cbe0553-9fcd-4035-8e69-52792e16d489",
  "token_expiration": "2019-12-01T11:39:33.042Z",
  "instructions": "Save the session token somewhere safe and send that with the api_key for all future web requests. It goes in a header called Authorization2FAToken."
}
```


**Response: 401**


Invalid request


```json
{
  "login": false,
  "instructions": "Your multi-factor authentication attempt failed for the 6th time, please open RepairShopr in browser and recover MFA."
}
```


#### Get User by ID


Retrieves an existing User by ID


**Endpoint:** `GET /users/{id}`


**Path Parameters:**


| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes |  |


**Response: 200**


successful


```json
{
  "user": {
    "id": 1,
    "email": "username@example.com",
    "full_name": "User Name",
    "created_at": "2019-11-01T11:39:20.554Z",
    "updated_at": "2019-11-01T11:39:20.554Z",
    "group": "Admins",
    "admin": true,
    "color": "55b932"
  }
}
```

