# Guillermo García — Portfolio 2026

Portfolio personal bilingüe (ES/EN) construido desde cero con Vite, React y TypeScript. Estética de noche suave, tipografía editorial, objeto 3D y movimiento medido. Todo el contenido se edita dentro de la propia web, sin panel aparte, con acceso privado por contraseña y un código de un solo uso enviado al móvil por ntfy.

## Stack

- Vite 8 + React 19 + TypeScript
- Three.js para el nudo escultórico del hero
- GSAP para la entrada del hero
- Canvas 2D para el campo generativo del hero (sin librerías)
- Express 5 para la API de autenticación, subidas y guardado del contenido
- Fontsource: Bricolage Grotesque, Fraunces, Inter Tight y JetBrains Mono

## Comandos

```bash
npm install
npm run dev        # web en http://localhost:5173
npm run server     # API en http://127.0.0.1:8787
npm run dev:full   # API + web a la vez (recomendado)
npm run build      # typecheck + build en dist/
npm run start      # sirve dist/ y la API desde Express
npm run typecheck
npm run auth:setup # crea/renueva la contraseña y el topic de ntfy
npm run ntfy:info  # muestra el topic y los datos para suscribirte
npm run ntfy:test  # envía una notificación de prueba al móvil
```

Para editar en desarrollo necesitas la API y Vite a la vez:

```bash
npm run dev:full
# web:    http://localhost:5173
# editar: http://localhost:5173/?edit=1
```

## Edición en contexto

La edición vive dentro de la web. En cada sección aparece una barra con **Textos de la sección** y los botones de añadir; cada elemento muestra su botón de editar al pasar el cursor (en táctil, siempre visible). Las imágenes se cambian pulsando sobre ellas o desde el campo de imagen del formulario.

- Entra con el botón **Editar esta web** del pie o abriendo `/?edit=1`. `/config` redirige a `/?edit=1`.
- El acceso pide la contraseña y, después, un código de 6 dígitos que llega al móvil por ntfy.
- Los cambios se acumulan en un borrador y se publican con **Guardar cambios** (o `Ctrl + S`). Nada cambia en la web hasta guardar.
- Si la web está abierta en otra pestaña, se actualiza sola mediante `BroadcastChannel`.
- Al salir con cambios pendientes se pide confirmación para descartarlos.

### Contraseña y ntfy

La contraseña no se guarda en texto plano: solo existe como hash `scrypt` en `server/data/credentials.json`, junto al topic privado de ntfy. Ese archivo y `server/uploads/` están fuera de git.

Para crear las credenciales por primera vez:

```bash
# PowerShell
$env:ADMIN_PASSWORD="una-contraseña-larga"; npm run auth:setup
```

El script genera un topic aleatorio y lo imprime una sola vez. Si quieres conservar el topic al cambiar la contraseña:

```bash
$env:ADMIN_PASSWORD="otra-contraseña-larga"; $env:NTFY_TOPIC="gg-tu-topic"; npm run auth:setup -- --force
```

### Recibir los códigos en el móvil

1. Instala la app **ntfy** (Android: Play Store o F-Droid; iOS: App Store).
2. En el ordenador, ejecuta `npm run ntfy:info`. Te muestra el servidor, el topic y el enlace de suscripción.
3. En la app, pulsa **+** y elige suscribirte a un topic. Usa el servidor `https://ntfy.sh` y pega el topic exacto.
4. Envía una prueba con `npm run ntfy:test`. Debería llegar una notificación en unos segundos.
5. Si no llega: revisa que el topic esté copiado sin espacios, que la app tenga permiso de notificaciones y que el móvil no tenga ntfy limitada en segundo plano.

El topic es privado: quien lo tenga puede leer los códigos. No lo publiques. Si se filtra, genera credenciales nuevas con `npm run auth:setup -- --force`.

En desarrollo, `AUTH_DEBUG=1` muestra el código en la consola de la API y lo devuelve a la web para poder probar el flujo. No lo actives en producción.

Si defines `SITE_URL` (por ejemplo `https://tu-dominio.com`), la notificación de ntfy se puede pulsar para abrir directamente el modo edición en esa URL.

### Imágenes

- **Archivo local:** se sube a `server/uploads/` con validación por tipo real (magic bytes), límite de 12 MB y nombre aleatorio. El contenido guarda solo la ruta `/uploads/...`.
- **URL:** se guarda tal cual y se carga desde el origen externo.
- Formatos admitidos: JPG, PNG, WebP, GIF y AVIF.

### API y sesión

- Las sesiones duran 12 horas y viven en memoria: al reiniciar el servidor hay que volver a entrar.
- Los retos de 2FA caducan a los 5 minutos y tienen un máximo de 5 intentos.
- El login tiene límite de intentos por IP.
- La cookie de sesión es `httpOnly`, `SameSite=Lax` y se marca `Secure` en producción.

## Estructura

```
src/
  components/     Header, Hero, HeroObject, Work, ProjectModal, About, Stack, Journey, Contact…
  edit/           Edición en contexto: toolbar, drawers, formularios, login, selector de imagen y estilos
  config/         Campos y estilos compartidos del editor
  data/content.ts Modelo, valores por defecto y copy ES/EN
  hooks/          Scroll por bloques y reveal por IntersectionObserver
  lib/            Contexto de idioma, contenido y utilidades
  styles/         Sistema de diseño completo en global.css
server/
  index.mjs       API Express: auth, 2FA, subidas, contenido y servido de dist/
  data/           Contenido publicado y credenciales (fuera de git)
  uploads/        Imágenes subidas desde el editor (fuera de git)
scripts/
  setup-credentials.mjs  Genera el hash scrypt y el topic de ntfy
public/
  favicon.svg
  og.png
```

## Dónde tocar el contenido

- Contenido normal: la propia web en modo edición (recomendado).
- Valores iniciales y tipos: `src/data/content.ts`.
- Colores, tipografía y espaciado: variables CSS al inicio de `src/styles/global.css`.
- Metadatos base y JSON-LD: `index.html`. Los títulos y descripciones se actualizan desde el editor.

## Notas

- El idioma se guarda en `localStorage` (`gg-lang`) y se detecta del navegador la primera vez.
- El preloader solo se muestra una vez por sesión (`sessionStorage`, `gg-loaded`).
- Respeta `prefers-reduced-motion`: desactiva el movimiento del 3D, el cursor propio y las entradas.
- En escritorio el scroll va por bloques: una rueda = una sección. En móvil es scroll natural. El modo edición desactiva el snap y el cursor propio.
- Stashly es privado; el caso indica «código disponible bajo petición».
- Para desplegar: `npm run build` y `npm run start`. Si usas un host solo estático, la edición no funcionará; necesitas el proceso Node de `server/index.mjs`.
- En producción, arranca con `NODE_ENV=production` para que la cookie de sesión se marque como `Secure` (requiere HTTPS).
- Haz una copia de `server/data/credentials.json` y de `server/uploads/` si vas a mover el proyecto de servidor.
