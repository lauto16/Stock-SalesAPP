<p align="center">
  <img src="logo.ico" width="300">
</p>

# TiendaClick

**TiendaClick** is a polymorphic **inventory and sales management application for any commercial sector**.  
It allows you to manage products, suppliers, categories, sales, stock entries, and notifications, centralizing business operations and enabling **data-driven decision-making through a statistics system**.

The system is designed to adapt to both small businesses and larger operations, offering control, traceability, and organization in one place.

---

## What does TiendaClick do?

TiendaClick connects a **Django backend** with a **React frontend** to provide a complete business management experience:

- Real-time inventory management.
- Sales and transaction control.
- Supplier management.
- Product category handling.
- Stock entry records.
- Notification system.
- Payment method management.
- Authentication and permissions.
- Business analytics and statistics.
- Control panels and dashboards.

Everything runs on the same local IP:

| Service | Port |
|--------|------|
| React  | `5173` |
| Django | `8000` |

Therefore, to access the app, go to:

http://localhost:5173  
or  
http://192.168.x.x:5173

---

## General Architecture

The project is divided into two main layers:

- **Backend (Django + APIs)**
- **Frontend (React + Hooks + Modules)**

Each part is organized by functional domain, allowing the system to scale without losing structure.

---

## Core Domain Features

Based on the project structure, TiendaClick includes the following main modules:

### Backend (APIs)

- `AuthAPI` — Authentication and access control.
- `InventoryAPI` — Inventory and stock management.
- `SalesAPI` — Sales registration and control.
- `ProvidersAPI` — Supplier management.
- `CategoryAPI` — Category organization.
- `EntryAPI` — Product entries and stock movements.
- `NotificationAPI` — Notification system.
- `StatsAPI` — Business statistics and analytics.
- `PaymentMethodAPI` — Payment methods.
- `BlameAPI` — Action traceability and logging.
- `StockSalesApp` — Main Django app.

---

### Frontend (React)

- `inventory` — Inventory view and control.
- `sales` — Sales interface.
- `providers` — Supplier management.
- `categories` — Category administration.
- `entries` — Entry registration.
- `notifications` — Notification center.
- `stats` — Statistics visualization.
- `auth` — Login and authentication.
- `dashboard` — Main dashboard.
- `offers` — Offers and promotions.
- `permissions_manager` — Permission management.
- `pin_manager` — PIN-based security.
- `profile` — User profile.
- `sideNav` — Side navigation.
- `hooks` — Reusable logic.
- `global` — Global components.

---

## Technologies

- **Backend:** Django, Python
- **Frontend:** React, Vite

---

## Getting Started

### ▶ Backend
⚠️ **IMPORTANT**

This project automatically runs `migrate --noinput` on production startup.  
**DO NOT add fields without a `default` or `null=True`**, or the system will fail in the background.

To start working on the backend, run the following commands in a CMD terminal:

```bash
   cd Backend
   ```

   ```bash
   pip install virtualenv
   ```
   ```bash
   virtualenv venv
   # alternativa: py -m virtualenv venv
   ```
   ```bash
   cd venv/Scripts
   ```
   ```bash
   activate
   ```

   ```bash
   cd ..
   ```
   
   ```bash
   pip install -r requirements.txt
   ```

   ```bash
   echo { "key": "" } > PERSONAL_IDENTIFIER.json
   ```

   ```bash
   py manage.py makemigrations
   ```
   ```bash
   py manage.py migrate
   ```
   ```bash
   py installer_db_population_manager.py
   ```
   
   ```bash
   py manage.py createsuperuser
   ```
   ```bash
   # <pin> has to be a 4 digit pin
   py update_pin.py <pin>
   ```

   ```bash
   py manage.py runserver 0.0.0.0:8000
   ```

---

### ▶ Frontend

To start working on the frontend, run the following commands in a CMD terminal:

   ```bash
   cd Frontend
   ```
   ```bash
   npm i
   ```

   ```bash
   cd TiendaClick
   ```
   ```bash
   npm i
   ```

   ```bash
   npm run dev
   ```
---

## Licencia

[In spanish](LICENCIA)
[In english](LICENSE)

---
