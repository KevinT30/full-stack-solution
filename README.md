# MediCare Pro - Sistema de Gestión de Citas Médicas

Sistema completo de gestión de citas médicas con autenticación de roles (Admin, Médico, Paciente), programación inteligente y prevención de conflictos de horarios.

## �️ Tecnologías Utilizadas

- **Frontend**: React + TypeScript + TanStack Router + Tailwind CSS
- **Backend**: TanStack Start (SSR/SSG)
- **Base de Datos**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: Radix UI + shadcn/ui
- **Build Tool**: Vite
- **Package Manager**: npm (compatible con Railway)
- **Despliegue**: Railway (con Nixpacks)

## 📋 Prerrequisitos

- Node.js 20+
- npm o bun
- Cuenta en Supabase
- Cuenta en GitHub
- Cuenta en Railway

## 🚀 Instalación y Configuración Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/KevinT30/full-stack-solution.git
cd full-stack-solution
```

### 2. Instalar Dependencias

```bash
npm install
```

> **Nota**: El proyecto usa npm exclusivamente para evitar conflictos de lockfile en Railway.

### 3. Configurar Supabase

#### Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Crea un nuevo proyecto
3. Espera a que se configure (puede tomar unos minutos)

#### Ejecutar Migraciones

Las migraciones ya están incluidas en el repositorio. Para aplicarlas:

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Iniciar sesión en Supabase
supabase login

# Vincular tu proyecto local
supabase link --project-ref TU_PROJECT_REF

# Aplicar migraciones
supabase db push
```

> Reemplaza `TU_PROJECT_REF` con el ID de tu proyecto Supabase (lo encuentras en Settings > API).

#### Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
VITE_SUPABASE_PROJECT_ID=tu_project_id
```

> **Importante**: Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 5. Build de Producción

```bash
npm run build
npm run preview  # Para probar el build localmente
```

## 🌐 Despliegue en Railway

### Paso 1: Preparar el Repositorio

1. Asegúrate de que todos los cambios estén commiteados:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Paso 2: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Haz clic en **New Project**
3. Selecciona **Deploy from GitHub repo**
4. Autoriza a Railway para acceder a tus repositorios
5. Selecciona el repositorio `full-stack-solution`

### Paso 3: Configurar Variables de Entorno

En el dashboard de Railway, ve a **Variables** y agrega estas variables de entorno:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_PUBLISHABLE_KEY=tu_publishable_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

> **Nota**: Las variables `VITE_*` no son necesarias en Railway ya que el código usa `process.env` para el servidor.

### Paso 4: Configurar Build Settings (Opcional)

Railway detectará automáticamente la configuración desde `nixpacks.toml`, pero si necesitas ajustes:

- **Build Command**: `npm install --omit=dev --frozen-lockfile && npm run build`
- **Start Command**: `node dist/server/server.js`
- **Node Version**: 20
> **Nota**: Eliminamos los archivos de Bun para evitar conflictos de lockfile en Railway.
### Paso 5: Desplegar

1. Haz clic en **Deploy** en Railway
2. Espera a que se complete el build (puede tomar 5-10 minutos)
3. Una vez desplegado, ve a **Settings** > **Networking**
4. Haz clic en **Generate Domain** para obtener una URL pública

Tu aplicación estará disponible en algo como `https://full-stack-solution-production.up.railway.app`

## 🔧 Configuración Avanzada

### Migraciones de Base de Datos

Si necesitas actualizar el esquema de la base de datos:

1. Crea nuevas migraciones en `supabase/migrations/`
2. Prueba localmente con `supabase db reset`
3. Push a producción con `supabase db push`

### Roles y Permisos

El sistema incluye tres roles principales:

- **Admin**: Acceso completo al sistema
- **Doctor**: Gestión de citas y pacientes asignados
- **Patient**: Programación de citas y vista de historial

Los permisos se manejan a través de Row Level Security (RLS) en Supabase.

### Personalización

- **UI**: Los componentes están en `src/components/ui/`
- **Rutas**: Configuradas en `src/routes/`
- **Estilos**: Tailwind CSS en `src/styles.css`

## 🐛 Solución de Problemas

### Error de Build en Railway

Si el build falla:

1. Revisa los logs en Railway
2. Asegúrate de que `nixpacks.toml` esté presente
3. Verifica que las variables de entorno estén configuradas correctamente

### Problemas con Supabase

- Verifica que las migraciones se aplicaron correctamente
- Revisa los permisos RLS en tu dashboard de Supabase
- Asegúrate de que las API keys sean válidas

### Puerto en Desarrollo

Si el puerto 3000 está ocupado:

```bash
npm run dev -- --port 3001
```

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno.

## 🤝 Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit tus cambios: `git commit -m 'Agrega nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

---

¡Tu sistema de gestión médica está listo para usar! Si tienes preguntas, revisa la documentación de [TanStack Start](https://tanstack.com/start) y [Supabase](https://supabase.com/docs).
git clone https://github.com/tuusuario/medicare-pro.git
cd medicare-pro

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start
```

---

## 🏗️ Arquitectura

### Tech Stack
- **Frontend:** React 19 + TanStack Start + TanStack Router
- **Backend:** Node.js (preset node-server)
- **Database:** PostgreSQL (Supabase/Lovable Cloud)
- **Auth:** JWT + Row Level Security (RLS)
- **Styling:** Tailwind CSS v4 + Radix UI

### Estructura de Carpetas
```
src/
  components/         # Componentes UI reutilizables
  routes/             # Rutas de la aplicación (file-based routing)
    _app.tsx          # Layout protegido de la app
    _app.dashboard.tsx
    _app.patients.tsx
    _app.doctors.tsx
    _app.appointments.tsx
    auth.tsx          # Login/registro
  lib/                # Utilidades y contextos
    auth-context.tsx  # Contexto de autenticación
  integrations/       # Configuraciones de terceros
    supabase/         # Cliente y tipos de Supabase

supabase/
  migrations/         # Esquema de base de datos
```

---

## 🔐 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso total: pacientes, médicos, citas, configuración |
| **doctor** | Ver sus citas, agenda, historial de pacientes asignados |
| **patient** | Ver solo sus propias citas y historial médico |

### Primer Usuario Admin
Para crear el primer usuario administrador, ejecuta este SQL en Supabase SQL Editor:

```sql
-- Crear un usuario y asignarle rol de admin
-- Reemplaza 'user-uuid-aqui' con el UUID del usuario registrado
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-aqui', 'admin');
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales
- **profiles:** Datos de usuario (nombre, avatar)
- **user_roles:** Asignación de roles (admin, doctor, patient)
- **doctors:** Información de médicos (especialidad, licencia, duración consulta)
- **patients:** Datos de pacientes (fecha nacimiento, tipo sangre, alergias)
- **doctor_schedules:** Horarios de atención por día de semana
- **appointments:** Citas médicas con estados (pending, confirmed, cancelled, attended, no_show)

### Vistas
- **doctors_public:** Vista pública de médicos (oculta datos sensibles)

### Funciones de Seguridad
- **has_role(user_id, role):** Verifica si un usuario tiene un rol específico
- **handle_new_user():** Trigger que crea automáticamente perfil y rol de paciente

---

## ⚙️ Configuración de Railway (Avanzado)

### Health Checks
Railway usa health checks para verificar que tu app está funcionando. La app expone:
- `GET /` → Redirige a dashboard (si autenticado) o login
- `GET /api/health` → Endpoint de health check (si decides agregarlo)

### Logs
Para ver los logs en Railway:
1. Ve al dashboard de tu proyecto
2. Click en **Logs** → selecciona el servicio

### Redeploy
Si necesitas forzar un redeploy:
1. Railway → **Deployments**
2. Click en los **...** del deploy más reciente
3. Selecciona **Redeploy**

---

## 🐛 Troubleshooting

### Error "Cannot find module"
Si ves errores de módulos no encontrados después del build:
```bash
rm -rf node_modules .output
npm install
npm run build
```

### Error de puerto en Railway
Asegúrate de que la app use `process.env.PORT` si está disponible. En TanStack Start con preset node-server, esto se maneja automáticamente.

### RLS Policies bloqueando requests
Si ves errores 403 de Supabase:
- Verifica que las RLS policies estén configuradas correctamente
- Revisa que el usuario tenga el rol necesario

---

## 📄 Licencia

MIT - Libre para uso personal y comercial.

---

## 🤝 Soporte

Para soporte técnico o preguntas:
- Documentación de TanStack Start: https://tanstack.com/start
- Documentación de Supabase: https://supabase.com/docs
- Railway Docs: https://docs.railway.app
