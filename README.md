# Wabotti Web

Plataforma SaaS para gestión de clínicas estéticas y salones de belleza.

## 🚀 Getting Started

### 1. Prerequisites
- Docker & Docker Compose (Required)
- Node.js 18+ (Optional, for local development outside Docker)

### 2. Quick Start
We provide a unified script to manage the development environment (Docker + Migrations + Seed + Dev Server).

```bash
# Start Development Environment
./start.dev.sh
```

This script will:
1. Start Postgres (Port 5433), Redis, and MailHog via `docker-compose.dev.yml`.
2. Wait for the database to be ready.
3. Apply migrations (`npm run db:migrate`).
4. Seed the database with demo data (`npm run db:seed`).
5. Start the Next.js development server (`npm run dev`).

### 3. Production Deployment
For production, we use a secure, optimized Docker setup that bundles the application:

```bash
# Build and Run Production Stack
docker compose -f docker-compose.prod.yml up --build -d
```

**Production Features:**
- **Secure**: No database ports exposed to host.
- **Resilient**: Restart policy set to `always`.
- **Optimized**: Uses `output: standalone` for minimal image size.

### 4. Manual Commands (Development)
If you prefer running commands manually:

```bash
# Start Infrastructure Only
docker compose -f docker-compose.dev.yml up -d

# Seed Database
npm run db:seed

# Start Dev Server
npm run dev
```

### 5. Resetting Environments (Clear Database)
To completely wipe the database and Redis data (useful for a fresh start):

**Development:**
```bash
# Stops containers and removes volumes (postgres_data, redis_data)
docker compose -f docker-compose.dev.yml down -v
```

**Production:**
```bash
# Stops containers and removes volumes (postgres_data_prod, redis_data_prod)
docker compose -f docker-compose.prod.yml down -v
```

---

## 🔑 Demo Credentials

Consulta el listado completo de roles y usuarios de prueba en [docs/setup-seed.md](./docs/setup-seed.md).

> El script de semilla limpia los datos existentes para asegurar un estado consistente. Si necesitas restablecerlos, simplemente ejecuta `npm run db:seed`.

---

## 🌐 Test Sites (Templating Engine)

- **Main Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Demo Clinic Site (Public)**: [http://clinica-aurora.localhost:3000](http://clinica-aurora.localhost:3000)

---

## 📦 Storage Configuration

The application uses an abstract storage provider that supports both **Local Filesystem** and **AWS S3**.

### S3 Auto-Detection
The system automatically switches to S3 storage if the following environment variables are present in your `.env` file:

```env
STORAGE_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
STORAGE_S3_REGION=us-east-1 (optional, defaults to us-east-1)
```

### CloudFront CDN (Optional)
To serve assets via CloudFront instead of directly from S3, add:
```env
STORAGE_CLOUDFRONT_DOMAIN=https://your-distribution-domain.net
```
This enables the system to generate public URLs pointing to your CDN.

### Forcing Local Storage
To force local storage even if S3 variables are present (useful for development), set:
```env
STORAGE_TYPE=local
```

---

## Architecture Modules
- **Module 1**: Company Core (Users, Roles, Locations)
- **Module 2**: Services & Resources (Professionals, Facilities)
- **Module 3**: Web Pages (11ty-style Templating Engine)
