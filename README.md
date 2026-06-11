# My Passport 🛂
**Tu pasaporte digital inteligente** — Cumplimiento legal de viaje con IA

---

## Estructura del proyecto

```
my-passport/
├── public/
│   ├── index.html              ← Portada (login con Firebase)
│   └── pages/
│       └── dashboard.html      ← App principal (pasaporte + viajes + checklist)
├── netlify/
│   └── functions/
│       └── analyze.js          ← Función serverless (llama a Claude de forma segura)
├── netlify.toml                ← Configuración de Netlify
└── README.md
```

---

## PASO 1 — Crear proyecto en Firebase (gratis)

1. Ve a https://console.firebase.google.com
2. Clic en **"Add project"** → nombre: `my-passport`
3. Desactiva Google Analytics (opcional) → **Create project**

### Activar Authentication
1. Panel izquierdo → **Authentication** → **Get started**
2. Pestaña **Sign-in method** → Habilita:
   - **Google** → toggle ON → guarda
   - **Email/Password** → toggle ON → guarda

### Activar Firestore
1. Panel izquierdo → **Firestore Database** → **Create database**
2. Selecciona **Start in test mode** → elige región → **Done**

### Obtener la configuración
1. Panel izquierdo → ⚙️ **Project settings**
2. Sección **"Your apps"** → clic en `</>` (Web)
3. Nombre: `my-passport-web` → **Register app**
4. Copia el objeto `firebaseConfig` que aparece

---

## PASO 2 — Pegar la configuración de Firebase en los archivos

Abre **`public/index.html`** y busca esta sección:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  ...
};
```
Reemplázala con tu configuración real.

Haz lo mismo en **`public/pages/dashboard.html`** (misma sección).

---

## PASO 3 — Subir a GitHub

1. Ve a https://github.com/new
2. Nombre del repo: `my-passport` (puede ser privado)
3. Sube todos los archivos manteniendo la estructura de carpetas

---

## PASO 4 — Conectar con Netlify (gratis)

1. Ve a https://app.netlify.com → **"Add new site"** → **"Import from Git"**
2. Conecta tu cuenta de GitHub → selecciona el repo `my-passport`
3. Configuración de build:
   - **Base directory:** (vacío)
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
4. Clic en **Deploy site**

---

## PASO 5 — Agregar variables de entorno en Netlify

1. En tu proyecto de Netlify → **Site configuration** → **Environment variables**
2. Clic en **"Add a variable"**:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** tu API key de Anthropic (empieza con `sk-ant-...`)
3. **Save** → luego clic en **Deploys** → **Trigger deploy**

### ¿Dónde obtengo la API key de Anthropic?
→ https://console.anthropic.com → API Keys → Create Key

---

## PASO 6 — Configurar dominio de Firebase Auth

Para que el login con Google funcione en tu dominio de Netlify:

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Clic en **"Add domain"**
3. Agrega tu dominio de Netlify: `tu-app.netlify.app`

---

## ¡Listo! La app funciona así:

```
Usuario en el navegador
        ↓
  index.html (login)
  Firebase Auth (Google o Email)
        ↓
  dashboard.html
  Firestore guarda: perfil, salud, visas, viajes
        ↓
  Usuario pulsa "Generar checklist"
        ↓
  Llamada a /.netlify/functions/analyze
  (el navegador NUNCA toca la API de Anthropic directamente)
        ↓
  Función serverless → Claude API (con tu key segura)
        ↓
  JSON con checklist → se renderiza en el dashboard
```

---

## Funcionalidades incluidas

- ✅ Login con Google o Email/Password (Firebase Auth)
- ✅ Pasaporte digital visual (verde/dorado, estilo físico)
- ✅ Perfil completo: datos, foto, N° pasaporte, vencimiento
- ✅ Historial médico: vacunas, medicamentos crónicos, tipo de sangre
- ✅ Residencias y visas activas
- ✅ Itinerario de viajes con destino, escala, fechas, motivo
- ✅ Checklist legal IA con nivel de riesgo (verde/amarillo/rojo)
- ✅ Franja MRZ generada con datos reales del perfil
- ✅ 10 idiomas: ES, EN, FR, DE, IT, PT, ZH, JA, AR, RU
- ✅ RTL automático para árabe
- ✅ Datos guardados en Firestore (persisten entre sesiones)
- ✅ API key de Anthropic protegida (nunca expuesta al cliente)

---

## Próximas funcionalidades a agregar

- 🔔 Alertas por email (Netlify Scheduled Functions + Resend)
- 📸 Foto de perfil desde Google
- 📄 Exportar checklist como PDF
- 🔔 Notificaciones push si cambia una ley 72h antes del vuelo
