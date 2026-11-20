import type { L, LList } from "./content";

/*
 * Caso 00 · Cómo está hecha esta web.
 *
 * El contenido vive aparte del modelo editable del sitio a propósito: esto
 * describe el sistema, no es una sección que se cambie desde el CMS.
 */

export interface MadeOfChapter {
  id: string;
  index: string;
  kicker: L;
  title: L;
  body: LList;
  points?: LList;
  quote?: L;
  aside?: L;
}

export interface MadeOfNode {
  name: L;
  meta: L;
}

export interface MadeOfColumn {
  id: string;
  index: string;
  title: L;
  caption: L;
  meta: L;
  nodes: MadeOfNode[];
}

export interface MadeOfSpec {
  label: L;
  value: L;
}

export interface MadeOfCredit {
  label: L;
  value: L;
}

export interface MadeOfLink {
  label: L;
  url: string;
  primary?: boolean;
}

export const madeOf = {
  kicker: { es: "Caso 00 · Colofón", en: "Case 00 · Colophon" },
  eyebrow: { es: "Detrás de la web", en: "Behind the site" },
  close: { es: "Cerrar caso", en: "Close case" },
  title: {
    lead: { es: "Cómo está hecha", en: "How this site" },
    accent: { es: "esta web", en: "is built" },
  },
  lede: {
    es: "No es una plantilla ni un tema con el logo cambiado. Es un sistema pequeño: React en el cliente, un Worker en el borde, D1 para el contenido y un editor para tocarlo todo sin abrir el código. Aquí está el despiece.",
    en: "No template, no theme with a swapped logo. It's a small system: React on the client, a Worker at the edge, D1 for content, and an editor that lets you touch everything without opening the code. Here are the parts.",
  },
  meta: [
    {
      label: { es: "Rol", en: "Role" },
      value: { es: "Diseño y desarrollo", en: "Design & development" },
    },
    {
      label: { es: "Año", en: "Year" },
      value: { es: "2026", en: "2026" },
    },
    {
      label: { es: "Stack", en: "Stack" },
      value: { es: "React · TypeScript · Cloudflare", en: "React · TypeScript · Cloudflare" },
    },
    {
      label: { es: "Estado", en: "Status" },
      value: { es: "En producción", en: "Live" },
    },
  ],
  stamp: {
    top: { es: "Expediente", en: "Case file" },
    number: "00",
    meta: { es: "Valencia · 2026", en: "Valencia · 2026" },
    status: { es: "En línea", en: "Online" },
  },
  map: {
    label: { es: "Mapa del sistema", en: "System map" },
    title: { es: "Tres capas, una sola idea", en: "Three layers, one idea" },
    caption: {
      es: "El contenido vive en la web y la web vive en el borde. Esto es lo que hay entre una petición y lo que ves.",
      en: "Content lives on the web, and the web lives at the edge. This is what sits between a request and what you see.",
    },
    flow: ["GET /", "worker", "D1", "json", "react"],
    columns: [
      {
        id: "client",
        index: "01",
        title: { es: "Cliente", en: "Client" },
        caption: { es: "Lo que ves", en: "What you see" },
        meta: { es: "Navegador", en: "Browser" },
        nodes: [
          {
            name: { es: "React 19", en: "React 19" },
            meta: { es: "Interfaz y estado", en: "UI and state" },
          },
          {
            name: { es: "Vite 8", en: "Vite 8" },
            meta: { es: "Build y HMR", en: "Build and HMR" },
          },
          {
            name: { es: "TypeScript 5.9", en: "TypeScript 5.9" },
            meta: { es: "Tipos estrictos", en: "Strict types" },
          },
          {
            name: { es: "CSS propio", en: "Custom CSS" },
            meta: { es: "Sin framework visual", en: "No visual framework" },
          },
          {
            name: { es: "GSAP + Three.js", en: "GSAP + Three.js" },
            meta: { es: "Motion y 3D, bajo demanda", en: "Motion and 3D, on demand" },
          },
          {
            name: { es: "Editor in situ", en: "In-place editor" },
            meta: { es: "Un CMS dentro de la página", en: "A CMS inside the page" },
          },
        ],
      },
      {
        id: "server",
        index: "02",
        title: { es: "Servidor", en: "Server" },
        caption: { es: "Lo que responde", en: "What responds" },
        meta: { es: "Cloudflare Worker", en: "Cloudflare Worker" },
        nodes: [
          {
            name: { es: "Router propio", en: "Custom router" },
            meta: { es: "/api/* antes que los assets", en: "/api/* before the assets" },
          },
          {
            name: { es: "Sesión + scrypt", en: "Session + scrypt" },
            meta: { es: "Acceso al editor", en: "Editor access" },
          },
          {
            name: { es: "JSON validado", en: "Validated JSON" },
            meta: { es: "2 MB máximo por guardado", en: "2 MB max per save" },
          },
          {
            name: { es: "KV de subidas", en: "Upload KV" },
            meta: { es: "Imágenes en /uploads", en: "Images at /uploads" },
          },
          {
            name: { es: "Cabeceras seguras", en: "Security headers" },
            meta: { es: "nosniff · same-origin", en: "nosniff · same-origin" },
          },
          {
            name: { es: "Sin servidor fijo", en: "No fixed server" },
            meta: { es: "Todo corre en el edge", en: "Everything runs at the edge" },
          },
        ],
      },
      {
        id: "storage",
        index: "03",
        title: { es: "Persistencia", en: "Persistence" },
        caption: { es: "Lo que queda", en: "What remains" },
        meta: { es: "D1 + KV", en: "D1 + KV" },
        nodes: [
          {
            name: { es: "D1", en: "D1" },
            meta: { es: "Contenido versionado en SQLite", en: "Content versioned in SQLite" },
          },
          {
            name: { es: "KV", en: "KV" },
            meta: { es: "Imágenes y binarios", en: "Images and binaries" },
          },
          {
            name: { es: "content.json", en: "content.json" },
            meta: { es: "Semilla y red de seguridad", en: "Seed and safety net" },
          },
          {
            name: { es: "Assets estáticos", en: "Static assets" },
            meta: { es: "HTML, CSS y JS en el edge", en: "HTML, CSS and JS at the edge" },
          },
          {
            name: { es: "Sin CMS externo", en: "No external CMS" },
            meta: { es: "Sin candados de terceros", en: "No third-party lock-in" },
          },
          {
            name: { es: "Una fuente de verdad", en: "Single source of truth" },
            meta: { es: "El sitio y su base de datos", en: "The site and its database" },
          },
        ],
      },
    ],
  },
  chapters: [
    {
      id: "idea",
      index: "01",
      kicker: { es: "El encargo", en: "The brief" },
      title: { es: "Un portfolio que se pueda editar", en: "A portfolio you can edit" },
      body: {
        es: [
          "Quería una web que no se quedara quieta: un sitio donde cambiar un texto, una portada o un proyecto no significara abrir VS Code, buscar la cadena y volver a desplegar.",
          "También quería que el propio portfolio explicara cómo está hecho. No como una página de documentación aparte, sino como una capa más del mismo sistema: el caso que hay detrás del resto de casos.",
        ],
        en: [
          "I wanted a site that wouldn't sit still: a place where changing a line, a cover or a project didn't mean opening VS Code, hunting for a string and redeploying.",
          "I also wanted the portfolio to explain how it's made. Not as separate documentation, but as one more layer of the same system: the case behind the other cases.",
        ],
      },
      aside: {
        es: "Todo lo que lees aquí se guarda en la misma base de datos que alimenta la web.",
        en: "Everything you read here is stored in the same database that feeds the site.",
      },
    },
    {
      id: "sistema",
      index: "02",
      kicker: { es: "Cliente", en: "Client" },
      title: { es: "React, pero sin peso de más", en: "React, without the extra weight" },
      body: {
        es: [
          "El cliente es React 19 con Vite 8 y TypeScript en modo estricto. No hay librería de componentes ni sistema de diseño empaquetado: hay CSS propio con variables, una retícula y decisiones tomadas a mano.",
          "El objeto 3D del hero, los modales y el editor se cargan con lazy: el primer render no paga por cosas que quizá no uses. El resultado es un JS principal de 88 kB comprimidos.",
        ],
        en: [
          "The client is React 19 with Vite 8 and TypeScript in strict mode. There's no component library or packaged design system: there's custom CSS with variables, a grid and decisions made by hand.",
          "The hero's 3D object, the modals and the editor are lazy-loaded: the first render doesn't pay for things you may never use. The main JS bundle lands at 88 kB compressed.",
        ],
      },
      points: {
        es: [
          "Tipografía autoalojada con Fontsource; cero peticiones a Google Fonts.",
          "Movimiento con GSAP solo donde aporta, y respeto por prefers-reduced-motion.",
          "Focus trap, Escape y retorno de foco en cada diálogo.",
        ],
        en: [
          "Self-hosted fonts with Fontsource; zero requests to Google Fonts.",
          "GSAP motion only where it adds something, with prefers-reduced-motion respected.",
          "Focus trap, Escape and focus return in every dialog.",
        ],
      },
    },
    {
      id: "cms",
      index: "03",
      kicker: { es: "Servidor", en: "Server" },
      title: { es: "Un CMS que cabe en la página", en: "A CMS that fits in the page" },
      body: {
        es: [
          "El editor no es un panel aparte: se activa desde el pie y convierte la propia web en el formulario. Puedes editar textos, proyectos, portadas y ajustes viendo exactamente lo que verá el visitante.",
          "Detrás hay un Worker de Cloudflare con router propio. Valida el JSON, limita el tamaño, protege la sesión con scrypt y cookies HttpOnly, y sirve las imágenes subidas desde KV.",
        ],
        en: [
          "The editor isn't a separate dashboard: you open it from the footer and the site itself becomes the form. You can edit copy, projects, covers and settings while seeing exactly what a visitor will see.",
          "Behind it is a Cloudflare Worker with its own router. It validates JSON, caps payload size, protects the session with scrypt and HttpOnly cookies, and serves uploaded images from KV.",
        ],
      },
      points: {
        es: [
          "Guardado con validación y versión; nada de sobrescribir a ciegas.",
          "El contenido vive en D1; content.json queda como semilla y fallback.",
          "Login con código de un solo uso, límite de intentos y sesión de 12 horas.",
        ],
        en: [
          "Validated saves with a version; no blind overwrites.",
          "Content lives in D1; content.json stays as seed and fallback.",
          "One-time login code, attempt limits and a 12-hour session.",
        ],
      },
    },
    {
      id: "deploy",
      index: "04",
      kicker: { es: "Borde", en: "Edge" },
      title: { es: "Cloudflare, de principio a fin", en: "Cloudflare, end to end" },
      body: {
        es: [
          "El build es tsc --noEmit, Vite y un script que copia Meridiano dentro de /investing. Wrangler publica el Worker y los assets estáticos en la misma pasada; no hay servidor que mantener ni contenedor que despertar.",
          "El dominio vive en Cloudflare, www redirige 301 al dominio principal y las rutas /api/* y /uploads/* pasan primero por el Worker. El resto es HTML, CSS y JS servidos desde el edge.",
        ],
        en: [
          "The build runs tsc --noEmit, Vite and a script that copies Meridiano into /investing. Wrangler ships the Worker and the static assets in one pass; there's no server to maintain and no container to wake up.",
          "The domain lives on Cloudflare, www redirects 301 to the main domain, and /api/* and /uploads/* hit the Worker first. Everything else is HTML, CSS and JS served from the edge.",
        ],
      },
      points: {
        es: [
          "Assets con hash y caché larga; HTML siempre fresco.",
          "Observabilidad activada y versiones de despliegue identificables.",
          "Un solo comando: npm run deploy.",
        ],
        en: [
          "Hashed assets with long cache; always-fresh HTML.",
          "Observability on and identifiable deploy versions.",
          "One command: npm run deploy.",
        ],
      },
    },
    {
      id: "decisiones",
      index: "05",
      kicker: { es: "Criterio", en: "Taste" },
      title: { es: "Lo que decidí no hacer", en: "What I chose not to build" },
      body: {
        es: [
          "La mitad del trabajo fue elegir qué dejar fuera. Estas son las renuncias que más forma dieron al resultado.",
        ],
        en: [
          "Half the work was choosing what to leave out. These are the trade-offs that shaped the result the most.",
        ],
      },
      points: {
        es: [
          "Sin Next.js: el sitio es una sola página; un router completo habría sido más peso que problema resuelto.",
          "Sin Tailwind: prefería un sistema pequeño de tokens y clases legibles a una sopa de utilidades.",
          "Sin CMS de terceros: el contenido es mío, el esquema es mío y el editor vive donde se ve el resultado.",
          "Sin animación por defecto: el motion se activa cuando hay algo que contar, no para tapar huecos.",
          "Sin imágenes de stock: cada proyecto tendrá su portada real, aunque ahora algunas estén pendientes.",
        ],
        en: [
          "No Next.js: this is a single page; a full router would have been more weight than problem solved.",
          "No Tailwind: I preferred a small system of tokens and readable classes to a soup of utilities.",
          "No third-party CMS: the content is mine, the schema is mine, and the editor lives where the result is visible.",
          "No animation by default: motion turns on when there's something to say, not to cover empty space.",
          "No stock imagery: every project will get its real cover, even if a few are still pending.",
        ],
      },
    },
    {
      id: "aprendizajes",
      index: "06",
      kicker: { es: "Después", en: "After" },
      title: { es: "Lo que me llevo", en: "What I take with me" },
      body: {
        es: [
          "Este proyecto me obligó a juntar piezas que normalmente viven separadas: diseño de interfaz, accesibilidad, estado en React, API en el edge, SQL, autenticación, despliegue y copy. Y a mantener todo eso en un solo sitio que se pueda explicar.",
          "También aprendí que un portfolio no termina cuando se publica. El editor existe porque yo mismo iba a querer cambiar cosas; el colofón existe porque enseñar el mecanismo es parte del trabajo.",
        ],
        en: [
          "This project forced me to bring together pieces that usually live apart: interface design, accessibility, React state, an API at the edge, SQL, authentication, deployment and copy. And to keep all of it in one place I can explain.",
          "I also learned that a portfolio isn't finished when it ships. The editor exists because I was going to want to change things myself; the colophon exists because showing the mechanism is part of the work.",
        ],
      },
      quote: {
        es: "La mejor forma de demostrar que sabes construir algo es dejar que se vea cómo está construido.",
        en: "The best way to prove you can build something is to let people see how it's built.",
      },
      aside: {
        es: "Siguiente paso: portadas reales para los cuatro proyectos y una pasada de rendimiento en móvil.",
        en: "Next up: real covers for the four projects and a mobile performance pass.",
      },
    },
  ] satisfies MadeOfChapter[],
  specs: {
    label: { es: "Ficha técnica", en: "Spec sheet" },
    title: { es: "Los números, sin humo", en: "The numbers, no smoke" },
    note: {
      es: "Medidas del build actual. El objeto 3D y los modales no entran en la carga inicial.",
      en: "Measured on the current build. The 3D object and modals are not part of the initial load.",
    },
    items: [
      {
        label: { es: "JS principal", en: "Main JS" },
        value: { es: "288,48 kB · 88,49 kB gzip", en: "288.48 kB · 88.49 kB gzip" },
      },
      {
        label: { es: "CSS", en: "CSS" },
        value: { es: "79,07 kB · 17,09 kB gzip", en: "79.07 kB · 17.09 kB gzip" },
      },
      {
        label: { es: "Hero 3D", en: "3D hero" },
        value: { es: "545,17 kB · 135,05 kB gzip · lazy", en: "545.17 kB · 135.05 kB gzip · lazy" },
      },
      {
        label: { es: "Modal del caso", en: "Case modal" },
        value: { es: "21,36 kB · 7,55 kB gzip · lazy", en: "21.36 kB · 7.55 kB gzip · lazy" },
      },
      {
        label: { es: "Runtime", en: "Runtime" },
        value: { es: "Cloudflare Worker + Assets", en: "Cloudflare Worker + Assets" },
      },
      {
        label: { es: "Datos", en: "Data" },
        value: { es: "D1 · KV · content.json", en: "D1 · KV · content.json" },
      },
      {
        label: { es: "Tests", en: "Tests" },
        value: { es: "node:test · 10/10", en: "node:test · 10/10" },
      },
      {
        label: { es: "Accesibilidad", en: "Accessibility" },
        value: { es: "WCAG 2.2 · foco atrapado", en: "WCAG 2.2 · focus trap" },
      },
    ] satisfies MadeOfSpec[],
  },
  colophon: {
    label: { es: "Colofón", en: "Colophon" },
    title: {
      es: "Hecho a mano, puesto en el borde.",
      en: "Made by hand, shipped to the edge.",
    },
    body: {
      es: "Diseño, código, contenido y este texto: Guillermo García. Valencia, 2026.",
      en: "Design, code, content and this text: Guillermo García. Valencia, 2026.",
    },
    credits: [
      {
        label: { es: "Diseño y desarrollo", en: "Design & development" },
        value: { es: "Guillermo García", en: "Guillermo García" },
      },
      {
        label: { es: "Tipografías", en: "Typefaces" },
        value: {
          es: "Bricolage Grotesque · Fraunces · Inter Tight · JetBrains Mono · Pixelify Sans · Silkscreen",
          en: "Bricolage Grotesque · Fraunces · Inter Tight · JetBrains Mono · Pixelify Sans · Silkscreen",
        },
      },
      {
        label: { es: "Construido con", en: "Built with" },
        value: {
          es: "React 19 · TypeScript · Vite 8 · GSAP · Three.js · Cloudflare Workers · D1 · KV",
          en: "React 19 · TypeScript · Vite 8 · GSAP · Three.js · Cloudflare Workers · D1 · KV",
        },
      },
      {
        label: { es: "Gracias", en: "Thanks" },
        value: {
          es: "A quien prueba las cosas antes de que estén listas.",
          en: "To everyone who tests things before they're ready.",
        },
      },
    ] satisfies MadeOfCredit[],
    note: {
      es: "Este modal también forma parte del sistema: se descarga solo cuando lo vas a abrir.",
      en: "This modal is part of the system too: it only downloads when you're about to open it.",
    },
    close: { es: "Volver a la web", en: "Back to the site" },
  },
  links: {
    label: { es: "Enlaces", en: "Links" },
    items: [
      {
        label: { es: "Ver en vivo", en: "View live" },
        url: "https://guigarmon3.online/",
        primary: true,
      },
      {
        label: { es: "GitHub", en: "GitHub" },
        url: "https://github.com/Guigarmon3",
      },
      {
        label: { es: "Meridiano", en: "Meridiano" },
        url: "https://guigarmon3.online/investing/",
      },
    ] satisfies MadeOfLink[],
  },
};
