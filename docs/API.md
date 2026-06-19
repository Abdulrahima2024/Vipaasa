# Vipaasa Organics API Reference

This document provides a comprehensive reference of all implemented API endpoints for Vipaasa Organics backend services. All endpoints (except public routes) require authentication via a JWT bearer token passed in the `Authorization` header.

## Base URL
* Local Dev: `http://localhost:4000`

---

## Authentication Module (`/api/auth`)

### POST `/api/auth/login`
Authenticates a user and returns a session JWT token.
* **Request Body**:
  ```json
  {
    "email": "customer@vipaasa.com",
    "password": "Password123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "user-uuid",
      "email": "customer@vipaasa.com",
      "role": "CUSTOMER"
    }
  }
  ```

### POST `/api/auth/register`
Registers a new customer.
* **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "Password123!",
    "fullName": "John Doe",
    "phoneNumber": "9876543210"
  }
  ```

### POST `/api/auth/forgot-password`
Initiates a password recovery workflow.

### POST `/api/auth/send-verification-otp`
Sends a verification OTP via email or SMS.

### POST `/api/auth/verify-otp`
Verifies a previously sent OTP.

### POST `/api/auth/reset-password`
Resets the password after verifying the OTP code.

---

## User Profile & Addresses Module (`/api/users`)

### GET `/api/users/profile`
Retrieves the profile information for the authenticated user.
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "email": "customer@vipaasa.com",
      "profile": {
        "firstName": "Alice",
        "lastName": "Smith"
      }
    }
  }
  ```

### PUT `/api/users/profile`
Updates profile info.

### POST `/api/users/change-password`
Changes user account password.

### GET `/api/users/rewards`
Retrieves reward points accumulated by the customer.

### GET `/api/users/eco-impact`
Retrieves eco impact statistics (e.g. plastic saved, water saved).

### GET `/api/users/addresses`
Retrieves the user's saved addresses.
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "address-uuid",
        "addressLine1": "Flat 101, Green Meadows",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India",
        "isDefault": true
      }
    ]
  }
  ```

### POST `/api/users/addresses`
Saves a new address.

### PUT `/api/users/addresses/:id`
Updates an existing address.

### DELETE `/api/users/addresses/:id`
Deletes a saved address.

---

## Products & Catalog Module (`/api`)

### GET `/api/categories`
Retrieves the list of active hierarchical categories.

### GET `/api/products`
Retrieves a paginated list of active, priced catalog products.
* **Query Parameters**:
  * `limit` (default: 8)
  * `page` (default: 1)
  * `category` (optional)

### GET `/api/products/search`
Searches priced catalog items by name/category.
* **Query Parameters**:
  * `q` (search text query)

### GET `/api/products/:id`
Retrieves detailed information of a single product, including all variants and pricing.

### GET `/api/products/stats` *(Admin only)*
Retrieves catalog overview metrics.

### POST `/api/products` *(Admin only)*
Creates a new product with variant definitions and base prices.

### DELETE `/api/products/:id` *(Admin only)*
Deletes (soft-deletes) a product from catalog.

### PATCH `/api/products/:id` *(Admin only)*
Updates product details and variant properties.

---

## Cart Module (`/api/cart`)

### GET `/api/cart`
Retrieves the active cart for the authenticated user.
* **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "cart-uuid",
      "items": [
        {
          "id": "item-uuid",
          "quantity": 2,
          "variant": {
            "name": "250g",
            "pricing": {
              "basePrice": "150.00"
            },
            "product": {
              "name": "Artisanal Wheat Flour"
            }
          }
        }
      ]
    }
  }
  ```

### POST `/api/cart/items`
Adds an item variant to the cart. If the item already exists, increments quantity.

### PUT `/api/cart/items/:id`
Updates the quantity of a specific item in the cart.

### DELETE `/api/cart/items/:id`
Removes an item from the cart.

### DELETE `/api/cart`
Clears all items in the user's cart.

---

## Checkout & Orders Module (`/api`)

### POST `/api/checkout`
Executes user checkout. Places a pending order, books warehouse inventory, and clears cart items.
* **Request Body**:
  ```json
  {
    "shippingAddressId": "address-uuid",
    "billingAddressId": "address-uuid"
  }
  ```

### GET `/api/orders`
Retrieves a chronological list of orders placed by the customer.

### GET `/api/orders/:id`
Retrieves full details of a specific order, including tracking histories and product lists.

### PATCH `/api/orders/:id/cancel`
Cancels a pending order and releases reserved warehouse stock.

### GET `/api/admin/orders` *(Admin only)*
Retrieves all orders placed in the system.

---

## Reports & Dashboards (`/api/reports`)

### GET `/api/reports/dashboard` *(Admin only)*
Retrieves administrative dashboard performance KPIs and recent orders.
* **Query Parameters**:
  * `filter` (values: `today` | `week` | `month`)
* **Response (200 OK)**:
  ```json
  {
    "filter": "month",
    "kpis": {
      "totalOrders": 12,
      "todayOrders": "0.4 (avg)",
      "revenue": "₹2,500",
      "pendingDeliveries": 10
    },
    "recentOrders": [
      {
        "id": "ORD-20260619-000001",
        "customer": "Alice Smith",
        "initials": "AS",
        "color": "bg-green-100 text-green-700",
        "date": "Jun 19, 2026",
        "total": "₹1,250",
        "status": "PENDING",
        "statusColor": "bg-gray-100 text-gray-700",
        "paymentMethod": "UPI",
        "email": "customer@vipaasa.com",
        "phone": "7777777777",
        "shippingAddress": "Flat 101, Green Meadows, Bengaluru, Karnataka, 560001",
        "items": [
          {
            "name": "green leaves (250g Pack)",
            "quantity": 2,
            "price": "₹150"
          }
        ]
      }
    ]
  }
  ```
