# Guillermo García — Portfolio 2026

Portfolio personal bilingüe (ES/EN) para presentar mi trabajo como desarrollador de software. Reúne proyectos, trayectoria, herramientas y contacto en una experiencia de una sola página, con navegación por secciones, estética de noche suave y movimiento medido.

## Qué es

Una web de presentación personal que funciona como carta de trabajo y como escaparate de la forma en que entiendo el desarrollo: producto cuidado, interfaces claras y detalle en la interacción.

- **Seis bloques:** Inicio, Trabajo, Sobre mí, Stack, Trayectoria y Contacto.
- **Bilingüe:** todo el contenido existe en español e inglés, y el idioma se conserva entre visitas.
- **Navegación por secciones:** en escritorio se avanza bloque a bloque; en móvil el scroll es natural.
- **Contenido editable:** el contenido se puede actualizar desde la propia web mediante un modo de edición privado, sin depender de un panel externo.
- **Proyectos con ficha:** cada trabajo puede abrirse en una vista ampliada con contexto, decisiones y enlaces.

## Diseño y movimiento

La dirección visual combina una noche suave con guiños arcade y tipografía editorial. El inicio incluye un nudo escultórico en 3D y un campo de líneas generativo que reacciona con sutileza al puntero. El resto de la web mantiene esa misma atmósfera con transiciones breves, revelados al hacer scroll y un cursor propio en escritorio.

La experiencia se adapta a pantallas pequeñas y respeta `prefers-reduced-motion`: quien prefiere menos movimiento recibe una versión más tranquila, sin animaciones innecesarias.

## Stack

- Vite + React + TypeScript
- Three.js para la pieza 3D del hero
- GSAP para las entradas del hero
- Canvas 2D para el fondo generativo, sin librerías externas
- Express para el contenido, las imágenes y el acceso privado al editor
- Fontsource para Bricolage Grotesque, Fraunces, Inter Tight y JetBrains Mono

## Arquitectura

El frontend es una aplicación React organizada por secciones y por capas: componentes de interfaz, contexto de idioma y contenido, hooks de scroll y revelado, y un sistema de estilos centralizado con variables CSS.

La edición vive dentro de la propia web. Los cambios se preparan en un borrador y solo se publican al guardar. La API se encarga de persistir el contenido, gestionar las imágenes y proteger el acceso mediante una sesión privada con verificación en dos pasos.

## Accesibilidad y detalle

- Contraste medido, foco visible y navegación con teclado.
- Textos alternativos y estructura semántica en las secciones.
- Cursor propio y scroll por bloques desactivados durante la edición.
- Preloader una vez por sesión y preferencias de movimiento respetadas.

---

Diseñado y desarrollado por Guillermo García.
