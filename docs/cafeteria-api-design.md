# Online Cafeteria API Design

## Goal

Build a backend for an online cafeteria that supports:

- account creation and login
- browsing menu items
- placing orders
- payment tracking
- delivery assignment and status updates
- admin management

The current repo is a NestJS + MongoDB app, so this design keeps that stack and grows it into a production-style API.

## Core Principles

- Keep the API REST-first and predictable.
- Separate customer flows from admin flows.
- Model business state explicitly with enums and timestamps.
- Validate all inputs at the edge.
- Store payment and delivery state separately from the order itself, but link them by ID.

## Proposed Modules

### 1. Auth Module

Responsibilities:

- register users
- log in users
- issue and verify tokens
- protect routes by role

Key concepts:

- `User`
- `Role`
- `Session` or JWT-based auth

Recommended roles:

- `customer`
- `admin`
- `delivery`

### 2. Users Module

Responsibilities:

- store account profile data
- manage addresses
- view/update profile

Key concepts:

- `User`
- `Address`

### 3. Menu Module

Responsibilities:

- create and manage menu categories
- create and manage cafeteria items
- mark items as available/unavailable

Key concepts:

- `Category`
- `MenuItem`

### 4. Orders Module

Responsibilities:

- create orders from cart items
- calculate totals
- track order progress
- allow cancellation when valid

Key concepts:

- `Order`
- `OrderItem`
- `OrderStatus`

### 5. Payments Module

Responsibilities:

- record payment attempts
- store payment provider references
- update payment status

Key concepts:

- `Payment`
- `PaymentStatus`
- `PaymentMethod`

### 6. Delivery Module

Responsibilities:

- assign delivery personnel
- track delivery progress
- update delivery status

Key concepts:

- `Delivery`
- `DeliveryStatus`
- `DeliveryAssignment`

### 7. Admin Module

Responsibilities:

- manage menu
- view users and orders
- update statuses
- view reports

## Data Model

### User

Fields:

- `id`
- `fullName`
- `email`
- `passwordHash`
- `phone`
- `role`
- `addresses`
- `isActive`
- `createdAt`
- `updatedAt`

### Category

Fields:

- `id`
- `name`
- `slug`
- `isActive`
- `createdAt`
- `updatedAt`

### MenuItem

Fields:

- `id`
- `name`
- `description`
- `price`
- `imageUrl`
- `categoryId`
- `isAvailable`
- `prepTimeMinutes`
- `createdAt`
- `updatedAt`

### Order

Fields:

- `id`
- `userId`
- `orderNumber`
- `items`
- `subtotal`
- `deliveryFee`
- `tax`
- `total`
- `status`
- `paymentStatus`
- `deliveryStatus`
- `deliveryAddress`
- `notes`
- `createdAt`
- `updatedAt`

### OrderItem

Fields:

- `menuItemId`
- `nameSnapshot`
- `unitPriceSnapshot`
- `quantity`
- `lineTotal`

Snapshots are important so later menu changes do not rewrite past orders.

### Payment

Fields:

- `id`
- `orderId`
- `provider`
- `providerReference`
- `amount`
- `currency`
- `status`
- `paidAt`
- `createdAt`

### Delivery

Fields:

- `id`
- `orderId`
- `driverId`
- `status`
- `assignedAt`
- `pickedUpAt`
- `deliveredAt`
- `trackingNotes`

## Status Flows

### OrderStatus

Suggested values:

- `draft`
- `pending`
- `confirmed`
- `preparing`
- `ready_for_delivery`
- `out_for_delivery`
- `delivered`
- `cancelled`

### PaymentStatus

Suggested values:

- `unpaid`
- `pending`
- `paid`
- `failed`
- `refunded`

### DeliveryStatus

Suggested values:

- `not_assigned`
- `assigned`
- `picked_up`
- `in_transit`
- `delivered`
- `failed`

## API Shape

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Users

- `GET /users/me`
- `PATCH /users/me`
- `GET /users/:id` for admin

### Menu

- `GET /menu/categories`
- `POST /menu/categories` for admin
- `GET /menu/items`
- `GET /menu/items/:id`
- `POST /menu/items` for admin
- `PATCH /menu/items/:id` for admin
- `DELETE /menu/items/:id` for admin

### Orders

- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/cancel`
- `PATCH /orders/:id/status` for admin/staff

### Payments

- `POST /payments/initialize`
- `POST /payments/webhook`
- `GET /payments/:id`
- `GET /orders/:id/payment`

### Delivery

- `POST /deliveries/assign`
- `GET /deliveries`
- `GET /deliveries/:id`
- `PATCH /deliveries/:id/status`

## Request Flow

### Customer Order Flow

1. Customer registers or logs in.
2. Customer browses menu items.
3. Customer creates an order.
4. System calculates totals from current menu prices.
5. Payment is initialized.
6. Payment success updates order to `paid`.
7. Kitchen confirms and prepares the order.
8. Delivery is assigned.
9. Driver updates delivery status until completion.

### Admin Flow

1. Admin adds or updates menu items.
2. Admin views incoming orders.
3. Admin updates order preparation status.
4. Admin assigns delivery staff.
5. Admin reviews payments and operational history.

## Validation Rules

- `email` must be valid and unique.
- `password` must meet minimum strength.
- `price` must be a positive number.
- `quantity` must be a positive integer.
- `order items` must reference valid available menu items.
- status changes must follow allowed transitions only.

## Security Notes

- Hash passwords before saving.
- Never trust price values from the client during order creation.
- Use role guards on admin and delivery routes.
- Keep payment provider webhooks verified with signatures.
- Sanitize text fields where user content can be displayed back in HTML.

## Implementation Plan

### Phase 1

- Replace the starter demo with auth, users, menu items, and orders.
- Add shared utilities for validation, error handling, and response shaping.
- Create the main Mongo schemas and DTOs.

### Phase 2

- Add payments and webhook handling.
- Add delivery assignment and status updates.

### Phase 3

- Add admin dashboards and reporting endpoints.
- Add tests for critical flows.

## Suggested Folder Structure

```text
src/
  auth/
  users/
  menu/
  orders/
  payments/
  deliveries/
  common/
  app.module.ts
  main.ts
```

## First Build Recommendation

Start with these three modules:

1. `auth`
2. `menu`
3. `orders`

That gives the cafeteria its essential user, product, and purchasing flow before payment and delivery are layered on top.
