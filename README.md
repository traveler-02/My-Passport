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

## PASO 2 — Pegar la configuración de Firebase (un solo archivo)

Abre **`public/firebase-config.js`** — este es el ÚNICO lugar donde va la
configuración de Firebase. Tanto `index.html` como `dashboard.html` la cargan
desde aquí (`<script src="/firebase-config.js"></script>`), así que nunca
queda duplicada ni puede desincronizarse entre páginas.

```javascript
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

### Desplegar las reglas de seguridad de Firestore

Este repo incluye `firestore.rules` (acceso solo-dueño: cada usuario solo
puede leer/escribir sus propios documentos bajo `/users/{uid}/...`).
Despliégalas con:

```
firebase deploy --only firestore:rules
```

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

## PASO 4b — Alternativa: desplegar en Render

**Importante:** Render NO ejecuta funciones estilo Netlify
(`netlify/functions/`) — necesita un servidor normal escuchando en un
puerto. Por eso este repo incluye `server.js` (Express), que sirve el
sitio estático y expone el mismo endpoint `/.netlify/functions/analyze`
con exactamente la misma lógica (compartida en `lib/analyzeCore.js`), así
que el comportamiento es idéntico en ambas plataformas.

1. Ve a https://dashboard.render.com → **"New +"** → **"Web Service"**
2. Conecta tu repo de GitHub `my-passport`
3. Configuración:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (ya configurado para correr `node server.js`)
4. Agrega las mismas variables de entorno que en el Paso 5 (`ANTHROPIC_API_KEY`, `FIREBASE_PROJECT_ID`, `ALLOWED_ORIGINS` — usa tu dominio real de Render, ej. `https://tu-app.onrender.com`)
5. **Create Web Service**

Solo necesitas UNA de las dos plataformas (Netlify o Render), no ambas —
usa la que ya tengas configurada como dominio en vivo.

---

## PASO 5 — Agregar variables de entorno

1. **Netlify:** tu proyecto → **Site configuration** → **Environment variables**.
   **Render:** tu servicio → **Environment**.
2. Agrega estas variables:
   - **`ANTHROPIC_API_KEY`** (obligatoria) — tu API key de Anthropic (empieza con `sk-ant-...`)
   - **`FIREBASE_PROJECT_ID`** (recomendada) — el `projectId` de tu proyecto Firebase (el mismo valor que en `firebase-config.js`). El servidor lo usa para verificar que el token de sesión del usuario es legítimo antes de llamar a Claude.
   - **`ALLOWED_ORIGINS`** (recomendada) — el/los dominios donde vive tu app, separados por coma, ej. `https://tu-app.netlify.app` o `https://tu-app.onrender.com`. El endpoint `analyze` solo acepta peticiones desde estos orígenes (más `localhost` para desarrollo).
3. Guarda → vuelve a desplegar (**Trigger deploy** en Netlify, o Render lo hace automáticamente al guardar variables)

### ¿Dónde obtengo la API key de Anthropic?
→ https://console.anthropic.com → API Keys → Create Key

### Nota de seguridad

`netlify/functions/analyze.js` ahora **exige** un token de sesión de
Firebase válido (se envía automáticamente desde el dashboard) antes de
llamar a la API de Claude, y solo acepta peticiones desde los orígenes en
`ALLOWED_ORIGINS`. Antes de este cambio, cualquier persona en internet podía
invocar el endpoint directamente y consumir tu API key sin límite.

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
