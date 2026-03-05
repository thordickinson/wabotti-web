# Configuración de Desarrollo y Datos de Semilla (Seed)

Este documento detalla la configuración inicial del entorno de desarrollo y los datos precargados mediante el script de semilla.

## Roles del Sistema

El sistema utiliza los siguientes roles jerárquicos:

| Rol | Descripción | Alcance |
| :--- | :--- | :--- |
| **SUPERADMIN** | Administrador global del sistema | Acceso a todas las empresas (SaaS Admin) |
| **OWNER** | Dueño de la clínica/empresa | Acceso total a los datos de su tenant |
| **ADMIN** | Administrador de clínica | Gestión de agenda y configuraciones locales |
| **STAFF** | Profesional / Personal | Acceso a agenda y citas asignadas |
| **VIEWER** | Observador | Solo lectura de reportes y agenda |

## Cuentas de Prueba (Seed)

El script `seed.ts` genera las siguientes credenciales para pruebas locales. La contraseña para todas estas cuentas es: **`password123`**.

| Email | Nombre | Rol | Empresa |
| :--- | :--- | :--- | :--- |
| `superadmin@wabotti.com` | Super Admin | SUPERADMIN | Wabotti HQ |
| `admin@clinica-aurora.com` | Dra. Clínica Admin | OWNER | Clínica Aurora |
| `pro1@clinica-aurora.com` | María Profesional | STAFF | Clínica Aurora |
| `pro2@clinica-aurora.com` | Laura Profesional | STAFF | Clínica Aurora |

## Cómo Reiniciar la Base de Datos

Para aplicar cambios en el esquema y recargar los datos de prueba, utiliza:

```bash
# Sincronizar esquema y borrar datos actuales
npx prisma db push --accept-data-loss

# Ejecutar el script de semilla
npm run db:seed
```

## Estructura de Datos de Prueba

- **Empresas**: Una sede central (HQ) y una clínica demo ("Clínica Aurora").
- **Infraestructura**: 1 sede en Polanco con 2 profesionales asignados.
- **Servicios**: "Limpieza Facial Profunda" configurado con página web demo.
- **Citas**: Se generan citas en estados `PENDING`, `CONFIRMED`, `COMPLETED` y `NO_SHOW` para pruebas de interfaz.
