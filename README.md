# 📦 Todo Clean Architecture API

Backend construido con **NestJS + TypeORM + PostgreSQL + Redis**, siguiendo **Clean Architecture**, con migraciones automáticas y suite completa de tests (unitarios + e2e).

---

# 🚀 Características del proyecto

## 🧱 Arquitectura
- Clean Architecture (Domain / Application / Infrastructure / Interfaces)
- Use Cases como núcleo de la lógica de negocio
- Separación estricta de responsabilidades
- Controllers delgados (solo orquestación)
- Código escalable y mantenible

---

## 🗄️ Base de datos
- PostgreSQL 16 (Docker)
- TypeORM 0.3
- Migraciones automáticas en desarrollo y producción
- UUID como identificadores
- Índices y relaciones configuradas

---

## ⚡ Cache
- Redis 7 (Docker)
- Cache service listo para producción

---

## 🔐 Seguridad
- JWT Authentication
- API Key Guard obligatorio
- Guards combinados por endpoint
- Decorador @CurrentUser()
- Password hashing con bcrypt
- Rate limiting (protección de ataques)

---

## 🧪 Testing
- Unit tests (Use Cases, Repositories, Services, Guards)
- E2E tests (API completa)
- Jest configurado
- Cobertura de código disponible

---

# 🐳 Servicios requeridos (Docker)

🐘 PostgreSQL → localhost:5433  
🔴 Redis → localhost:6379  

## Levantar servicios

docker compose up -d

---

# ⚙️ Variables de entorno

DB_HOST=localhost  
DB_PORT=5433  
DB_USER=postgres  
DB_PASSWORD=root  
DB_NAME=postgres  

JWT_SECRET=d492aaa9409712ba82a9692369aa8bb6a08923277c3e77f4c987ad9834135874  

API_KEY=7f4fedffd417c5edd2b53e967d8d0334bf5322fe90a1e7c51b494c62  

RATE_LIMIT_TTL=60  
RATE_LIMIT_LIMIT=10  

REDIS_HOST=localhost  
REDIS_PORT=6379  

PORT=3000  
NODE_ENV=development  

---

# 📦 Instalación

yarn install  

---

# 🚀 Ejecución del proyecto

## Desarrollo

yarn start:dev  

✔ Ejecuta migraciones automáticamente  
✔ Levanta NestJS en modo watch  
✔ Conecta a PostgreSQL y Redis  
✔ Activa logging  
✔ Levanta Swagger Docs
---

## Producción

yarn build  
yarn start:prod  

---

# 🧱 Migraciones

## Ejecutar manualmente

yarn migration:run  

## Flujo automático

start → migration:run → start app  

---

# 🧪 TESTING

## 🧪 Ejecutar todos los tests

yarn test  

---

## 👀 Modo watch

yarn test:watch  

---

## 📊 Coverage

yarn test:cov  

---

## 🧪 E2E tests

yarn test:e2e  

---

## 🔍 Debug tests

yarn test:debug  

---

# 🧠 Qué se está testeando

## Unit tests
- Use Cases (Auth, Tasks)
- Repositories
- Mappers
- Services
- Guards

## E2E tests
- Auth flow completo
- CRUD de tareas
- JWT validation
- API Key protection
- Base de datos real

---

# 📌 Endpoints

## 🔐 Auth (protegido)
Headers requeridos:

x-api-key: <API_KEY> 

POST /api/auth/register  
POST /api/auth/login  

---

## 📋 Tasks (protegido)
Headers requeridos:

x-api-key: <API_KEY>
Authorization: Bearer <JWT>

POST /api/tasks  
GET /api/tasks  
GET /api/tasks?status=pending&page=1&limit=3
PATCH /api/tasks/:id  
DELETE /api/tasks/:id  

---

# 🧠 Flujo del sistema

Cliente  
↓  
Guards (JWT + API Key + Rate Limit)  
↓  
Controller  
↓  
Use Case  
↓  
Repository  
↓  
PostgreSQL (Docker)  
Redis (Cache)  

---

# 🧱 Stack tecnológico

- NestJS 11
- TypeORM
- PostgreSQL 16 (Docker)
- Redis 7 (Docker)
- JWT
- bcrypt
- Jest
- class-validator / class-transformer
- Clean Architecture
- Swagger

---

# ⚠️ Notas importantes

- PostgreSQL corre en Docker (puerto 5433)
- Redis obligatorio
- Migraciones automáticas en dev/prod
- API protegida con JWT + API KEY
- Rate limit activo
- Proyecto listo para producción

---

# 🚀 Estado del proyecto

✔ Auth funcional  
✔ Tasks CRUD funcional  
✔ Redis integrado  
✔ PostgreSQL en Docker  
✔ Migraciones automáticas  
✔ Seguridad completa  
✔ Tests unitarios y e2e  
✔ Clean Architecture aplicada correctamente  
✔ Swagger Docs