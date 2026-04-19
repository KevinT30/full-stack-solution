# MediCare Pro - Sistema de Gestión de Citas Médicas

Sistema completo de gestión de citas médicas con autenticación de roles (Admin, Médico, Paciente), programación inteligente y prevención de conflictos de horarios.

## 🚀 Despliegue en Railway

### 1. Exportar a GitHub
- Ve al panel de Lovable → **GitHub** (arriba a la derecha)
- Click en **Connect to GitHub** → **Create Repository**
- El código se subirá a tu cuenta de GitHub

### 2. Crear proyecto en Railway
1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en **New Project** → **Deploy from GitHub repo**
3. Selecciona el repositorio de MediCare Pro
4. Railway detectará automáticamente que es un proyecto Node.js + Vite

### 3. Configurar Variables de Entorno
En el dashboard de Railway → **Variables**, agrega estas variables:

```
VITE_SUPABASE_URL=https://lznzrtqextqfyhzybgkb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bnpydHFleHRxZnloenliZ2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDAwNjgsImV4cCI6MjA5MjExNjA2OH0.Ho3-Ym1iEtHj5fC9LktM70gbKZa3IiAk5BtkmhK1YIU
VITE_SUPABASE_PROJECT_ID=lznzrtqextqfyhzybgkb
```

> ⚠️ **IMPORTANTE**: Estas son las credenciales de tu proyecto Supabase. Para producción, considera rotar las API keys en tu dashboard de Supabase.

### 4. Configurar Build y Start Commands
En Railway → **Settings**:

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start` (o `node .output/server/index.mjs`)
- **Port:** Railway asigna `$PORT` automáticamente

### 5. Generar Dominio
Railway → **Settings** → **Networking** → **Generate Domain**

Tu app estará disponible en `https://tuprojecto.up.railway.app`

---

## 📦 Instalación Local

```bash
# Clonar repositorio
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
