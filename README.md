
http://localhost:5173

http://localhost:8000


---

## 🧩 Arquitectura General

El proyecto está dividido en dos grandes capas:

- **Backend (Django + APIs)**
- **Frontend (React + Hooks + Módulos)**

Cada parte está organizada por dominio funcional, permitiendo escalar el sistema sin perder orden.

---

## ⚙️ Funcionalidades Core del Dominio

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
- `StockSalesApp` — Núcleo de integración entre stock y ventas.

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

## 🧠 Enfoque del Sistema

TiendaClick está diseñado con un enfoque modular y escalable:

- Separación clara de responsabilidades.
- APIs desacopladas del frontend.
- Componentes reutilizables.
- Orientado a múltiples rubros comerciales.
- Preparado para crecer en funcionalidades.

---

## 📦 Tecnologías

- **Backend:** Django, Python
- **Frontend:** React, Vite
- **Arquitectura:** Modular, basada en dominios
- **Comunicación:** API REST

---

## 🛠️ Instrucciones para comenzar

### ▶ Backend

*(Pendiente de documentación)*

---

### ▶ Frontend

*(Pendiente de documentación)*

---

## 📈 Objetivo del Proyecto

Brindar una plataforma flexible para que cualquier comercio pueda:

- Controlar su stock.
- Registrar ventas.
- Analizar resultados.
- Optimizar decisiones.
- Centralizar su operación diaria.

---

## 📄 Licencia

Definir licencia del proyecto.

---
