# Catering Counter Marketplace

A full-stack React, Node.js, Express, and MongoDB website for catering providers to promote Indian dishes and for users to order them.

## Features

- JWT authentication for users and admins
- User registration, login, profile, menu browsing, cart, checkout, and order history
- Admin registration, login, product upload, product management, and order viewing
- Indian food menu categorized into North, South, East, and West
- MongoDB models for users, products, carts, and orders

## Run Locally

1. Install dependencies:

```powershell
npm.cmd run install:all
```

2. Create `server/.env` from `server/.env.example` and set your MongoDB connection string.

3. Seed the starter Indian menu:

```powershell
npm.cmd run seed
```

4. Start both apps:

```powershell
npm.cmd run dev
```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:5000`

## Default Roles

The registration screen lets you create either a customer account or an admin account. Admin users can upload products and view all orders.
