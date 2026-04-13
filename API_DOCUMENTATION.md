# Donation Platform API Documentation

This API handles the core functionality of the Donation Management Platform.
It allows users to register, authenticate, and interact with donation posts.

Donors can create and manage donation entries, while charities can browse,
filter, and claim available donations. The system ensures proper tracking of
quantities to prevent over-claiming and maintains clear communication between users.

Authentication is handled using JSON Web Tokens (JWT), and access to certain
endpoints is restricted based on user roles (`donor`, `charity`, `admin`).

## Base URL

```txt
http://localhost:5000/api/v1
```

Most protected routes require a JWT token in the `Authorization` header:

```txt
Authorization: Bearer YOUR_TOKEN_HERE
```

Errors are returned in this format:

```json
{
  "message": "Error message here"
}
```

## Test Accounts

### Admin

Admin accounts are created from the database or the seed script.

```json
{
  "name": "Islam Gacem",
  "email": "islam@gmail.com",
  "password": "12345678",
  "role": "admin"
}
```

### Donors

```json
{
  "name": "Adem",
  "email": "adem@gmail.com",
  "password": "12345678",
  "phone": "0555000001",
  "role": "donor"
}
```

```json
{
  "name": "Fares",
  "email": "fares@gmail.com",
  "password": "87654321",
  "phone": "0555000002",
  "role": "donor"
}
```

### Charities

Charity accounts start as `pending`. An admin must approve them before they can claim donations.

```json
{
  "name": "Haithem",
  "email": "haithem@gmail.com",
  "password": "aaaaaaaa",
  "phone": "0555000003",
  "role": "charity",
  "organization": "KhirCharity",
  "registrationNumber": "KHR2026001"
}
```

```json
{
  "name": "Amine",
  "email": "amine@gmail.com",
  "password": "abcdefgh",
  "phone": "0555000004",
  "role": "charity",
  "organization": "YatimCharity",
  "registrationNumber": "YTM2026002"
}
```

More charity examples:

```txt
KefalaCharity
WihdaCharity
```

## Authentication

### Register

Creates a donor or charity account.

```http
POST /auth/register
```

Authentication: not required

Request body for a donor:

```json
{
  "name": "Adem",
  "email": "adem@gmail.com",
  "password": "12345678",
  "phone": "0555000001",
  "role": "donor"
}
```

Request body for a charity:

```json
{
  "name": "Haithem",
  "email": "haithem@gmail.com",
  "password": "aaaaaaaa",
  "phone": "0555000003",
  "role": "charity",
  "organization": "KhirCharity",
  "registrationNumber": "KHR2026001"
}
```

Success response:

```json
{
  "_id": "USER_ID",
  "name": "Adem",
  "email": "adem@gmail.com",
  "phone": "0555000001",
  "role": "donor",
  "status": "approved",
  "createdAt": "2026-04-12T20:00:00.000Z",
  "updatedAt": "2026-04-12T20:00:00.000Z"
}
```

Rules:

- `name`, `email`, and `password` are required.
- Password must contain at least 8 characters.
- Charity accounts require `organization` and `registrationNumber`.
- Donor accounts are approved immediately.
- Charity accounts are pending until an admin approves them.

### Login

Logs in a user and returns a JWT token.

```http
POST /auth/login
```

Authentication: not required

Request body:

```json
{
  "email": "adem@gmail.com",
  "password": "12345678"
}
```

Admin request body:

```json
{
  "email": "islam@gmail.com",
  "password": "12345678"
}
```

Success response:

```json
{
  "user": {
    "_id": "USER_ID",
    "name": "Adem",
    "email": "adem@gmail.com",
    "phone": "0555000001",
    "role": "donor",
    "status": "approved"
  },
  "token": "JWT_TOKEN"
}
```

Use the returned token in protected requests:

```txt
Authorization: Bearer JWT_TOKEN
```

### Get Current User

Returns the logged-in user.

```http
GET /auth/me
```

Authentication: required

Success response:

```json
{
  "id": "USER_ID",
  "role": "donor",
  "name": "Adem",
  "email": "adem@gmail.com",
  "status": "approved"
}
```

### Update Profile

Updates basic profile fields.

```http
PUT /auth/profile
```

Authentication: required

Allowed fields:

- `name`
- `phone`
- `organization`
- `registrationNumber`

Request body:

```json
{
  "name": "Adem",
  "phone": "0555111122"
}
```

Success response:

```json
{
  "_id": "USER_ID",
  "name": "Adem",
  "email": "adem@gmail.com",
  "phone": "0555111122",
  "role": "donor",
  "status": "approved"
}
```

## Admin And Charity Approval

### Get Charities

Returns charity accounts. Admin only.

```http
GET /auth/charities
```

Authentication: admin required

Optional query:

```http
GET /auth/charities?status=pending
```

Allowed status filters:

- `pending`
- `approved`
- `rejected`

Success response:

```json
[
  {
    "_id": "CHARITY_USER_ID",
    "name": "Haithem",
    "email": "haithem@gmail.com",
    "phone": "0555000003",
    "role": "charity",
    "organization": "KhirCharity",
    "registrationNumber": "KHR2026001",
    "status": "pending"
  }
]
```

### Update Charity Status

Approves, rejects, or resets a charity account to pending.

```http
PUT /auth/charities/:id/status
```

Authentication: admin required

Request body:

```json
{
  "status": "approved"
}
```

Allowed statuses:

- `approved`
- `rejected`
- `pending`

Success response:

```json
{
  "_id": "CHARITY_USER_ID",
  "name": "Haithem",
  "email": "haithem@gmail.com",
  "role": "charity",
  "organization": "KhirCharity",
  "registrationNumber": "KHR2026001",
  "status": "approved"
}
```

When the status becomes `approved` or `rejected`, the charity receives a notification.

## Donations

Donation routes use `/posts` in the backend.

Allowed donation types:

- `food`
- `clothes`
- `toys`
- `electronics`
- `books`
- `medicines`
- `furniture`
- `school_supplies`
- `hygiene`
- `baby_items`
- `household`
- `other`
- `others`

### Get Available Donations

Returns available donations. This route is public.

```http
GET /posts
```

Authentication: not required

Optional query parameters:

- `type`: filter by donation type
- `search`: search inside name and description
- `sort`: `newest`, `oldest`, `a-z`, `z-a`, or `quantity`

Example:

```http
GET /posts?type=food&search=rice&sort=quantity
```

Success response:

```json
[
  {
    "_id": "DONATION_ID",
    "donor": {
      "_id": "DONOR_ID",
      "name": "Adem",
      "email": "adem@gmail.com"
    },
    "name": "Rice bags",
    "donationType": "food",
    "quantity": 20,
    "remainingQty": 20,
    "description": "Clean rice bags ready for pickup.",
    "status": "available",
    "contactPhone": "0555000001",
    "contactEmail": "adem@gmail.com"
  }
]
```

### Get One Donation

Returns a donation by id.

```http
GET /posts/:id
```

Authentication: not required

Success response:

```json
{
  "_id": "DONATION_ID",
  "donor": {
    "_id": "DONOR_ID",
    "name": "Adem",
    "email": "adem@gmail.com",
    "phone": "0555000001"
  },
  "name": "Rice bags",
  "donationType": "food",
  "quantity": 20,
  "remainingQty": 20,
  "description": "Clean rice bags ready for pickup.",
  "status": "available",
  "contactPhone": "0555000001",
  "contactEmail": "adem@gmail.com"
}
```

### Get My Donations

Returns donations created by the logged-in donor.

```http
GET /posts/my
```

Authentication: donor required

Success response:

```json
[
  {
    "_id": "DONATION_ID",
    "donor": "DONOR_ID",
    "name": "Winter clothes",
    "donationType": "clothes",
    "quantity": 12,
    "remainingQty": 12,
    "description": "Jackets and sweaters in good condition.",
    "status": "available"
  }
]
```

### Create Donation

Creates a donation. Donor only.

```http
POST /posts
```

Authentication: donor required

Request body:

```json
{
  "name": "School notebooks",
  "donationType": "school_supplies",
  "quantity": 40,
  "description": "New notebooks for children.",
  "contactPhone": "0555000001",
  "contactEmail": "adem@gmail.com"
}
```

Success response:

```json
{
  "_id": "DONATION_ID",
  "donor": "DONOR_ID",
  "name": "School notebooks",
  "donationType": "school_supplies",
  "quantity": 40,
  "remainingQty": 40,
  "description": "New notebooks for children.",
  "status": "available",
  "contactPhone": "0555000001",
  "contactEmail": "adem@gmail.com"
}
```

Rules:

- `name`, `donationType`, and `quantity` are required.
- `quantity` must be at least 1.
- `contactEmail` must be a valid email if provided.
- `remainingQty` is created automatically from `quantity`.

### Update Donation

Updates a donation created by the logged-in donor.

```http
PUT /posts/:id
```

Authentication: donor required

Request body:

```json
{
  "name": "School notebooks and pens",
  "quantity": 50,
  "description": "New notebooks and blue pens."
}
```

Success response:

```json
{
  "_id": "DONATION_ID",
  "donor": "DONOR_ID",
  "name": "School notebooks and pens",
  "donationType": "school_supplies",
  "quantity": 50,
  "remainingQty": 50,
  "description": "New notebooks and blue pens.",
  "status": "available"
}
```

This donation cannot be edited after any quantity has been claimed.

### Delete Donation

Deletes a donation created by the logged-in donor.

```http
DELETE /posts/:id
```

Authentication: donor required

Success response:

```json
{
  "message": "Donation deleted successfully"
}
```

This donation cannot be deleted after claims have started.

### Get Claims For My Donation

Returns claims made on one of the donor's donations.

```http
GET /posts/:id/claims
```

Authentication: donor required

Success response:

```json
[
  {
    "_id": "CLAIM_ID",
    "donation": "DONATION_ID",
    "charity": {
      "_id": "CHARITY_USER_ID",
      "name": "Haithem",
      "email": "haithem@gmail.com",
      "organization": "KhirCharity"
    },
    "quantity": 5,
    "status": "pending",
    "notes": "We can pick this up tomorrow."
  }
]
```

## Claims

Claims use `/claims` in the backend.

Only approved charities can create claims. If a charity is still `pending` or `rejected`, the backend blocks the request.

### Claim A Donation

Creates a claim for part or all of a donation.

```http
POST /claims
```

Alternative route:

```http
POST /claims/claim
```

Authentication: approved charity required

Request body:

```json
{
  "donationId": "DONATION_ID",
  "quantity": 5,
  "notes": "KhirCharity can collect the items this week."
}
```

Success response:

```json
{
  "message": "Donation claimed successfully",
  "transaction": {
    "_id": "CLAIM_ID",
    "donation": "DONATION_ID",
    "charity": "CHARITY_USER_ID",
    "quantity": 5,
    "status": "pending",
    "notes": "KhirCharity can collect the items this week."
  }
}
```

After the claim:

- The requested quantity is removed from `remainingQty`.
- If `remainingQty` becomes `0`, the donation status becomes `completed`.
- The donor receives a notification saying the donation was claimed.
- If there is not enough quantity, the charity receives a failure notification.

### Get All Claims

Returns all claims. Admin only.

```http
GET /claims
```

Authentication: admin required

Optional query:

```http
GET /claims?status=pending
```

Allowed status filters:

- `pending`
- `confirmed`
- `rejected`

Success response:

```json
[
  {
    "_id": "CLAIM_ID",
    "donation": {
      "_id": "DONATION_ID",
      "name": "Rice bags",
      "donationType": "food"
    },
    "charity": {
      "_id": "CHARITY_USER_ID",
      "name": "Haithem",
      "email": "haithem@gmail.com",
      "organization": "KhirCharity"
    },
    "quantity": 5,
    "status": "pending",
    "notes": "KhirCharity can collect the items this week."
  }
]
```

### Get My Claims

Returns claims created by the logged-in charity.

```http
GET /claims/my
```

Authentication: charity required

Success response:

```json
[
  {
    "_id": "CLAIM_ID",
    "donation": {
      "_id": "DONATION_ID",
      "name": "Rice bags",
      "donationType": "food"
    },
    "charity": "CHARITY_USER_ID",
    "quantity": 5,
    "status": "pending",
    "notes": "KhirCharity can collect the items this week."
  }
]
```

### Get One Claim

Returns one claim by id.

```http
GET /claims/:id
```

Authentication: required

Who can view it:

- Admin
- The charity that created the claim
- The donor who owns the donation

Success response:

```json
{
  "_id": "CLAIM_ID",
  "donation": {
    "_id": "DONATION_ID",
    "name": "Rice bags",
    "donor": "DONOR_ID"
  },
  "charity": {
    "_id": "CHARITY_USER_ID",
    "name": "Haithem",
    "email": "haithem@gmail.com",
    "organization": "KhirCharity"
  },
  "quantity": 5,
  "status": "pending",
  "notes": "KhirCharity can collect the items this week."
}
```

### Update Claim Status

Updates a claim status. Admin only.

```http
PUT /claims/:id/status
```

Authentication: admin required

Request body:

```json
{
  "status": "confirmed"
}
```

Allowed statuses:

- `pending`
- `confirmed`
- `rejected`

Success response:

```json
{
  "_id": "CLAIM_ID",
  "donation": {
    "_id": "DONATION_ID",
    "name": "Rice bags",
    "donationType": "food"
  },
  "charity": "CHARITY_USER_ID",
  "quantity": 5,
  "status": "confirmed",
  "notes": "KhirCharity can collect the items this week."
}
```

Quantity behavior:

- If a claim becomes `rejected`, its quantity is added back to the donation.
- If a rejected claim becomes `pending` or `confirmed`, the backend tries to reserve the quantity again.
- If there is not enough remaining quantity, the backend returns an error.

## Notifications

Notifications belong to the logged-in user.

Notification types:

- `charity_approved`
- `charity_rejected`
- `donation_claimed`
- `donation_failed_insufficient_quantity`

### Get Notifications

Returns notifications for the logged-in user.

```http
GET /notifications
```

Authentication: required

Success response:

```json
[
  {
    "_id": "NOTIFICATION_ID",
    "user": "USER_ID",
    "type": "donation_claimed",
    "message": "KhirCharity claimed 5 units from \"Rice bags\". 15 units remain.",
    "isRead": false,
    "createdAt": "2026-04-12T20:30:00.000Z",
    "updatedAt": "2026-04-12T20:30:00.000Z"
  }
]
```

### Mark Notification As Read

Marks one notification as read.

```http
PATCH /notifications/:id/read
```

Authentication: required

Success response:

```json
{
  "message": "Notification marked as read"
}
```

### Delete Notification

Deletes one notification.

```http
DELETE /notifications/:id
```

Authentication: required

Success response:

```json
{
  "message": "Notification deleted successfully"
}
```

## Common Status Codes

```txt
200 OK
201 Created
400 Bad request
401 Not authenticated
403 Not authorized
404 Not found
409 Conflict
429 Too many requests
500 Server error
```

## Responses And Error Cases

These responses are written in the same JSON style returned by the backend.

### Shared Protected Route Errors

Any route that requires login can return:

```json
{"message": "No token"}
```

```json
{"message": "Invalid token"}
```

```json
{"message": "Token expired"}
```

```json
{"message": "User not found"}
```

```json
{"message": "Authorization problem"}
```

Any route restricted to a specific role can return:

```json
{"message": "Action not authorized"}
```

Any rate-limited route can return:

```json
{"message": "Too many requests, please try again later"}
```

Login and register can return this rate-limit response:

```json
{"message": "Too many auth attempts, please try again later"}
```

Any route can return a server error:

```json
{"message": "Server error message"}
```

### Endpoint-Specific Errors

Register can return:

```json
{"message": "Name, email, and password are required"}
```

```json
{"message": "Please enter a valid email"}
```

```json
{"message": "Password must be at least 8 characters long"}
```

```json
{"message": "Organization and registration number are required for charities"}
```

```json
{"message": "Email already registered"}
```

Login can return:

```json
{"message": "Email and password are required"}
```

```json
{"message": "User not found"}
```

```json
{"message": "Wrong password"}
```

Profile update can return:

```json
{"message": "No valid profile fields provided"}
```

Charity status routes can return:

```json
{"message": "Invalid charity status"}
```

```json
{"message": "Charity not found"}
```

Donation routes can return:

```json
{"message": "Donation name, type, and quantity are required"}
```

```json
{"message": "Donation name is required"}
```

```json
{"message": "Invalid donation type"}
```

```json
{"message": "Quantity must be a number greater than or equal to 1"}
```

```json
{"message": "Please enter a valid contact email"}
```

```json
{"message": "Donation not found"}
```

```json
{"message": "Access denied"}
```

```json
{"message": "Cannot edit donation after it has been partially claimed"}
```

```json
{"message": "Cannot delete donation after claims started"}
```

Claim routes can return:

```json
{"message": "Donation id is required"}
```

```json
{"message": "Donation not available"}
```

```json
{"message": "Not enough quantity available"}
```

```json
{"message": "Charity not verified yet"}
```

```json
{"message": "Invalid claim status"}
```

```json
{"message": "Claim not found"}
```

```json
{"message": "Not enough quantity available to restore this claim"}
```

Notification routes can return:

```json
{"message": "Notification not found"}
```

```json
{"message": "Access denied"}
```

## Rate Limits

The backend uses `express-rate-limit`.

Current limits:

- General API routes: 500 requests per 15 minutes.
- Auth routes: 30 login/register requests per 15 minutes.
- Notifications: 200 notification fetches per 15 minutes.

`429 Too many requests` means the limit was reached. Restart the backend or wait for the 15-minute window to pass.

## Manual Test Flow

1. Register donor Adem.
2. Register charity Haithem from KhirCharity.
3. Login as Islam Gacem admin.
4. Approve KhirCharity.
5. Login as Adem and create a donation.
6. Login as Haithem and claim part of the donation.
7. Login as Adem and check notifications.
8. Login as Islam Gacem and confirm or reject the claim.
