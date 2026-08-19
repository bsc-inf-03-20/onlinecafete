# Online Cafeteria API Spec

This document turns the cafeteria design into a route-by-route API contract before coding starts.

## Base Rules

- Base path: `/api`
- All requests and responses are JSON unless noted.
- Auth uses bearer tokens in the `Authorization` header.
- IDs are MongoDB ObjectId strings.
- Error format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Common Enums

### UserRole

- `customer`
- `admin`
- `delivery`

### OrderStatus

- `draft`
- `pending`
- `confirmed`
- `preparing`
- `ready_for_delivery`
- `out_for_delivery`
- `delivered`
- `cancelled`

### PaymentStatus

- `unpaid`
- `pending`
- `paid`
- `failed`
- `refunded`

### DeliveryStatus

- `not_assigned`
- `assigned`
- `picked_up`
- `in_transit`
- `delivered`
- `failed`

## Auth Routes

### `POST /api/auth/register`

Create a new customer account.

Request body:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPassword123!",
  "phone": "+27123456789"
}
```

Rules:

- `fullName` required
- `email` required and unique
- `password` required and hashed before storage
- `phone` optional

Success response `201`:

```json
{
  "id": "66c2f1e3f1f1f1f1f1f1f1f1",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "role": "customer",
  "token": "jwt-token-here"
}
```

Errors:

- `400` invalid payload
- `409` email already exists

### `POST /api/auth/login`

Authenticate a user and return a token.

Request body:

```json
{
  "email": "jane@example.com",
  "password": "StrongPassword123!"
}
```

Success response `200`:

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "66c2f1e3f1f1f1f1f1f1f1f1",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer"
  }
}
```

Errors:

- `401` invalid credentials
- `400` validation error

### `POST /api/auth/logout`

Invalidate the current session if session storage is used, or act as a client-side token discard endpoint if JWT-only.

Success response `200`:

```json
{
  "message": "Logged out successfully"
}
```

### `GET /api/auth/me`

Return the current authenticated user.

Success response `200`:

```json
{
  "id": "66c2f1e3f1f1f1f1f1f1f1f1",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+27123456789",
  "role": "customer",
  "isActive": true
}
```

Auth:

- required bearer token

Errors:

- `401` missing or invalid token

## Users Routes

### `GET /api/users/me`

Return profile details for the current user.

Auth:

- required bearer token

### `PATCH /api/users/me`

Update current profile details.

Request body:

```json
{
  "fullName": "Jane A. Doe",
  "phone": "+27123456789"
}
```

Rules:

- only editable fields may be sent
- unknown fields are rejected

Success response `200`:

```json
{
  "id": "66c2f1e3f1f1f1f1f1f1f1f1",
  "fullName": "Jane A. Doe",
  "email": "jane@example.com",
  "phone": "+27123456789",
  "role": "customer"
}
```

### `GET /api/users/:id`

Admin-only route to fetch a user by ID.

Auth:

- required bearer token
- admin role only

Errors:

- `403` insufficient role
- `404` user not found

## Menu Routes

### `GET /api/menu/categories`

List all active categories.

Query params:

- `includeInactive` optional, admin only

Success response `200`:

```json
[
  {
    "id": "66c2f1e3f1f1f1f1f1f1f1a",
    "name": "Meals",
    "slug": "meals",
    "isActive": true
  }
]
```

### `POST /api/menu/categories`

Create a category.

Admin-only.

Request body:

```json
{
  "name": "Meals"
}
```

Success response `201`:

```json
{
  "id": "66c2f1e3f1f1f1f1f1f1f1a",
  "name": "Meals",
  "slug": "meals",
  "isActive": true
}
```

### `PATCH /api/menu/categories/:id`

Update category name or active state.

Admin-only.

Request body:

```json
{
  "name": "Hot Meals",
  "isActive": true
}
```

### `GET /api/menu/items`

List menu items.

Query params:

- `categoryId` optional
- `availableOnly` optional, defaults to `true` for customers
- `search` optional

Success response `200`:

```json
[
  {
    "id": "66c2f1e3f1f1f1f1f1f1f1b",
    "name": "Chicken Wrap",
    "description": "Grilled chicken wrap",
    "price": 65.0,
    "imageUrl": "/images/chicken-wrap.jpg",
    "categoryId": "66c2f1e3f1f1f1f1f1f1f1a",
    "isAvailable": true,
    "prepTimeMinutes": 15
  }
]
```

### `GET /api/menu/items/:id`

Fetch a single menu item.

### `POST /api/menu/items`

Create a menu item.

Admin-only.

Request body:

```json
{
  "name": "Chicken Wrap",
  "description": "Grilled chicken wrap",
  "price": 65.0,
  "imageUrl": "/images/chicken-wrap.jpg",
  "categoryId": "66c2f1e3f1f1f1f1f1f1f1a",
  "isAvailable": true,
  "prepTimeMinutes": 15
}
```

Rules:

- `name` required
- `price` must be positive
- `categoryId` must exist
- `isAvailable` defaults to `true`

### `PATCH /api/menu/items/:id`

Update a menu item.

Admin-only.

### `DELETE /api/menu/items/:id`

Remove or soft-disable a menu item.

Admin-only.

Recommendation:

- prefer soft delete by setting `isAvailable = false`

## Orders Routes

### `POST /api/orders`

Create an order for the current user.

Auth:

- required bearer token

Request body:

```json
{
  "items": [
    {
      "menuItemId": "66c2f1e3f1f1f1f1f1f1f1b",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "line1": "12 Main Road",
    "city": "Johannesburg",
    "province": "Gauteng",
    "postalCode": "2000"
  },
  "notes": "No onions"
}
```

Rules:

- items required
- each item quantity must be positive
- order price is calculated server-side
- client cannot submit final prices

Success response `201`:

```json
{
  "id": "66c2f1e3f1f1f1f1f1f1f1c",
  "orderNumber": "ORD-20260819-0001",
  "status": "pending",
  "paymentStatus": "unpaid",
  "deliveryStatus": "not_assigned",
  "subtotal": 130,
  "deliveryFee": 20,
  "tax": 0,
  "total": 150,
  "items": [
    {
      "menuItemId": "66c2f1e3f1f1f1f1f1f1f1b",
      "nameSnapshot": "Chicken Wrap",
      "unitPriceSnapshot": 65,
      "quantity": 2,
      "lineTotal": 130
    }
  ]
}
```

### `GET /api/orders`

List orders for the current user.

Admin may view all orders.

Query params:

- `status` optional
- `paymentStatus` optional
- `deliveryStatus` optional
- `page` optional
- `limit` optional

### `GET /api/orders/:id`

Fetch a single order.

Rules:

- customers may only access their own orders
- admins may access any order

### `PATCH /api/orders/:id/cancel`

Cancel an order if it is still cancellable.

Rules:

- allowed only when order is `pending` or `confirmed`
- not allowed after preparation starts unless business rules allow it

### `PATCH /api/orders/:id/status`

Update order processing status.

Admin or kitchen staff only.

Request body:

```json
{
  "status": "preparing"
}
```

Allowed transitions should be enforced in code.

## Payments Routes

### `POST /api/payments/initialize`

Create a payment initiation record for an order.

Auth:

- required bearer token

Request body:

```json
{
  "orderId": "66c2f1e3f1f1f1f1f1f1f1c",
  "method": "card"
}
```

Success response `201`:

```json
{
  "paymentId": "66c2f1e3f1f1f1f1f1f1f1d",
  "orderId": "66c2f1e3f1f1f1f1f1f1f1c",
  "status": "pending",
  "amount": 150,
  "currency": "ZAR"
}
```

### `POST /api/payments/webhook`

Payment provider callback endpoint.

Rules:

- verify signature
- update payment record
- update related order payment status

### `GET /api/payments/:id`

Fetch payment details.

Customers can only view their own payment records.

## Delivery Routes

### `POST /api/deliveries/assign`

Assign an order to a delivery user.

Admin or dispatcher only.

Request body:

```json
{
  "orderId": "66c2f1e3f1f1f1f1f1f1f1c",
  "driverId": "66c2f1e3f1f1f1f1f1f1f1e"
}
```

### `GET /api/deliveries`

List deliveries.

Query params:

- `status`
- `driverId`
- `orderId`

### `GET /api/deliveries/:id`

Fetch a single delivery record.

### `PATCH /api/deliveries/:id/status`

Update delivery progress.

Delivery staff or admin only.

Request body:

```json
{
  "status": "in_transit"
}
```

## Admin Routes

These are not separate modules yet, but the following capabilities should be role-protected:

- manage users
- manage menu categories and items
- manage orders
- manage deliveries
- view reporting summaries

### Suggested admin summary endpoints

- `GET /api/admin/dashboard`
- `GET /api/admin/orders-summary`
- `GET /api/admin/sales-summary`
- `GET /api/admin/users`

## Validation Rules

- reject unknown fields on write routes
- validate ObjectId strings early
- ensure price and quantity are numeric and positive
- ensure status changes are valid transitions
- never trust client-submitted totals

## Error Cases to Standardize

- `400` validation failure
- `401` unauthorized
- `403` forbidden
- `404` not found
- `409` conflict
- `422` business rule violation

## Implementation Order

1. Auth and users
2. Menu categories and items
3. Orders
4. Payments
5. Delivery
6. Admin summaries

## Notes

- This spec is intentionally route-first so implementation can follow endpoint by endpoint.
- The current todo feature should eventually be replaced by the cafeteria modules above.
