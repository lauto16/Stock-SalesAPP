# 🛒 TiendaClick

**TiendaClick** es una aplicación polimórfica de **gestión de inventario y ventas para cualquier rubro comercial**.  
Permite administrar productos, proveedores, categorías, ventas, entradas de stock y notificaciones, centralizando la operación del negocio y facilitando la **toma de decisiones mediante un sistema de estadísticas**.

El sistema está pensado para adaptarse tanto a pequeños comercios como a operaciones más grandes, ofreciendo control, trazabilidad y organización en un solo lugar.

---

## ¿Qué hace TiendaClick?

TiendaClick conecta un **backend en Django** con un **frontend en React** para ofrecer una experiencia completa de administración comercial:

- Gestión de inventario en tiempo real.
- Control de ventas y movimientos.
- Administración de proveedores.
- Manejo de categorías de productos.
- Registro de entradas de stock.
- Sistema de notificaciones.
- Gestión de métodos de pago.
- Autenticación y permisos.
- Estadísticas para análisis del negocio.
- Paneles y dashboards de control.

Todo corre sobre la misma IP local:

| Servicio  | Puerto |
|----------|--------|
| React     | `5173` |
| Django    | `8000` |

Por ende, para acceder a la app se debe ingresar a:

http://localhost:5173
ó
http://192.168.x.x:5173

---

## Arquitectura General

El proyecto está dividido en dos grandes capas:

- **Backend (Django + APIs)**
- **Frontend (React + Hooks + Módulos)**

Cada parte está organizada por dominio funcional, permitiendo escalar el sistema sin perder orden.

---

## Funcionalidades Core del Dominio

Basado en la estructura del proyecto, TiendaClick incluye los siguientes módulos principales:

### Backend (APIs)

- `AuthAPI` — Autenticación y control de acceso.
- `InventoryAPI` — Gestión de inventario y stock.
- `SalesAPI` — Registro y control de ventas.
- `ProvidersAPI` — Administración de proveedores.
- `CategoryAPI` — Organización por categorías.
- `EntryAPI` — Entradas de productos y movimientos.
- `NotificationAPI` — Sistema de notificaciones.
- `StatsAPI` — Estadísticas y análisis del negocio.
- `PaymentMethodAPI` — Métodos de pago.
- `BlameAPI` — Trazabilidad y registro de acciones.
- `StockSalesApp` — App principal de Django

---

### Frontend (React)

- `inventory` — Vista y control de inventario.
- `sales` — Interfaz de ventas.
- `providers` — Gestión de proveedores.
- `categories` — Administración de categorías.
- `entries` — Registro de entradas.
- `notifications` — Centro de notificaciones.
- `stats` — Visualización de estadísticas.
- `auth` — Login y autenticación.
- `dashboard` — Panel principal.
- `offers` — Ofertas y promociones.
- `permissions_manager` — Gestión de permisos.
- `pin_manager` — Seguridad por PIN.
- `profile` — Perfil de usuario.
- `sideNav` — Navegación lateral.
- `hooks` — Lógica reutilizable.
- `global` — Componentes globales.

---

## Tecnologías

- **Backend:** Django, Python
- **Frontend:** React, Vite

---

## Instrucciones para comenzar

### ▶ Backend

*(Pendiente de documentación)*

---

### ▶ Frontend

1) Ingresar a Frontend/
2) Ejecutar
   ```bash
    npm i
   ```
4) Ingresar a Frontend/TiendaClick
5) Ejecutar
   ```bash
    npm i
   ```
7) Ejecutar
   ```bash
    npm run dev
   ```

## Licencia

[En español](LICENCIA)
[En ingles](LICENSE)

---
