export type Lang = "es" | "en";
export type L = Record<Lang, string>;
export type LList = Record<Lang, string[]>;

export type LinkMode = "none" | "github" | "external";

export interface Social {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  image: string;
  year: string;
  category: L;
  role: L;
  stack: string[];
  accent: string;
  subtitle: L;
  summary: L;
  bullets: LList;
  note: L;
  githubUrl: string;
  externalUrl: string;
  linkMode: LinkMode;
  featured: boolean;
  visible: boolean;
}

export interface JourneyItem {
  id: string;
  year: string;
  title: L;
  place: L;
  description: L;
}

export interface StackGroup {
  id: string;
  name: L;
  items: string[];
}

export interface SiteContent {
  version: 1;
  profile: {
    name: string;
    firstName: string;
    lastName: string;
    mark: string;
    role: L;
    eyebrow: L;
    tagline: L;
    availability: L;
    location: L;
    commuteNote: L;
    email: string;
    portrait: string;
    socials: Social[];
  };
  sections: {
    meta: { title: L; description: L };
    nav: {
      home: L;
      work: L;
      about: L;
      stack: L;
      journey: L;
      contact: L;
      menu: L;
      close: L;
    };
    hero: {
      scroll: L;
      timeLabel: L;
      ctaWork: L;
      ctaContact: L;
    };
    work: {
      label: L;
      title: L;
      hint: L;
      more: L;
      open: L;
      external: L;
      live: L;
    };
    about: {
      label: L;
      title: L;
      paragraphs: LList;
      quote: L;
      playerLabel: L;
      playerClass: L;
      nowLabel: L;
      now: L;
      sideQuestsLabel: L;
      sideQuests: LList;
    };
    stack: { label: L; title: L; hint: L; note: L };
    journey: {
      label: L;
      title: L;
      experience: L;
      education: L;
      nextLabel: L;
      nextTitle: L;
      nextText: L;
      nextCta: L;
    };
    contact: {
      label: L;
      title: L;
      big: L;
      emailLabel: L;
      copy: L;
      copied: L;
      availabilityLabel: L;
      socials: L;
      note: L;
    };
    footer: { rights: L; built: L; backTop: L; stackNote: L };
    modal: {
      role: L;
      year: L;
      stack: L;
      whatIDid: L;
      links: L;
      close: L;
      github: L;
      external: L;
    };
  };
  stack: StackGroup[];
  experience: JourneyItem[];
  education: JourneyItem[];
  projects: Project[];
  settings: {
    defaultLang: Lang;
    preloader: boolean;
    marquee: boolean;
    energy: "normal" | "extra";
  };
}

export interface Copy {
  meta: { title: string; description: string };
  nav: {
    home: string;
    work: string;
    about: string;
    stack: string;
    journey: string;
    contact: string;
    menu: string;
    close: string;
  };
  hero: {
    eyebrow: string;
    role: string;
    tagline: string;
    availability: string;
    location: string;
    commuteNote: string;
    scroll: string;
    timeLabel: string;
    ctaWork: string;
    ctaContact: string;
  };
  work: {
    label: string;
    title: string;
    hint: string;
    more: string;
    open: string;
    external: string;
    live: string;
  };
  about: {
    label: string;
    title: string;
    paragraphs: string[];
    quote: string;
    playerLabel: string;
    playerClass: string;
    nowLabel: string;
    now: string;
    sideQuestsLabel: string;
    sideQuests: string[];
  };
  stack: { label: string; title: string; hint: string; note: string };
  journey: {
    label: string;
    title: string;
    experience: string;
    education: string;
    nextLabel: string;
    nextTitle: string;
    nextText: string;
    nextCta: string;
  };
  contact: {
    label: string;
    title: string;
    big: string;
    emailLabel: string;
    copy: string;
    copied: string;
    availabilityLabel: string;
    socials: string;
    note: string;
  };
  footer: { rights: string; built: string; backTop: string; stackNote: string };
  modal: {
    role: string;
    year: string;
    stack: string;
    whatIDid: string;
    links: string;
    close: string;
    github: string;
    external: string;
  };
}

export function buildCopy(data: SiteContent, lang: Lang): Copy {
  const s = data.sections;
  const p = data.profile;
  return {
    meta: { title: s.meta.title[lang], description: s.meta.description[lang] },
    nav: {
      home: s.nav.home[lang],
      work: s.nav.work[lang],
      about: s.nav.about[lang],
      stack: s.nav.stack[lang],
      journey: s.nav.journey[lang],
      contact: s.nav.contact[lang],
      menu: s.nav.menu[lang],
      close: s.nav.close[lang],
    },
    hero: {
      eyebrow: p.eyebrow[lang],
      role: p.role[lang],
      tagline: p.tagline[lang],
      availability: p.availability[lang],
      location: p.location[lang],
      commuteNote: p.commuteNote[lang],
      scroll: s.hero.scroll[lang],
      timeLabel: s.hero.timeLabel[lang],
      ctaWork: s.hero.ctaWork[lang],
      ctaContact: s.hero.ctaContact[lang],
    },
    work: {
      label: s.work.label[lang],
      title: s.work.title[lang],
      hint: s.work.hint[lang],
      more: s.work.more[lang],
      open: s.work.open[lang],
      external: s.work.external[lang],
      live: s.work.live[lang],
    },
    about: {
      label: s.about.label[lang],
      title: s.about.title[lang],
      paragraphs: s.about.paragraphs[lang],
      quote: s.about.quote[lang],
      playerLabel: s.about.playerLabel[lang],
      playerClass: s.about.playerClass[lang],
      nowLabel: s.about.nowLabel[lang],
      now: s.about.now[lang],
      sideQuestsLabel: s.about.sideQuestsLabel[lang],
      sideQuests: s.about.sideQuests[lang],
    },
    stack: {
      label: s.stack.label[lang],
      title: s.stack.title[lang],
      hint: s.stack.hint[lang],
      note: s.stack.note[lang],
    },
    journey: {
      label: s.journey.label[lang],
      title: s.journey.title[lang],
      experience: s.journey.experience[lang],
      education: s.journey.education[lang],
      nextLabel: s.journey.nextLabel[lang],
      nextTitle: s.journey.nextTitle[lang],
      nextText: s.journey.nextText[lang],
      nextCta: s.journey.nextCta[lang],
    },
    contact: {
      label: s.contact.label[lang],
      title: s.contact.title[lang],
      big: s.contact.big[lang],
      emailLabel: s.contact.emailLabel[lang],
      copy: s.contact.copy[lang],
      copied: s.contact.copied[lang],
      availabilityLabel: s.contact.availabilityLabel[lang],
      socials: s.contact.socials[lang],
      note: s.contact.note[lang],
    },
    footer: {
      rights: s.footer.rights[lang],
      built: s.footer.built[lang],
      backTop: s.footer.backTop[lang],
      stackNote: s.footer.stackNote[lang],
    },
    modal: {
      role: s.modal.role[lang],
      year: s.modal.year[lang],
      stack: s.modal.stack[lang],
      whatIDid: s.modal.whatIDid[lang],
      links: s.modal.links[lang],
      close: s.modal.close[lang],
      github: s.modal.github[lang],
      external: s.modal.external[lang],
    },
  };
}

export const defaultContent: SiteContent = {
  version: 1,
  profile: {
    name: "Guillermo García",
    firstName: "Guillermo",
    lastName: "García",
    mark: "GG",
    role: { es: "Front-end · Back-end · Motion", en: "Front-end · Back-end · Motion" },
    eyebrow: {
      es: "Desarrollador de software · 2DAM",
      en: "Software developer · 2DAM",
    },
    tagline: {
      es: "Diseño y programo productos digitales que se sienten vivos: rápidos, claros y con un detalle que te hace mirar dos veces.",
      en: "I design and build digital products that feel alive: fast, clear, and with a detail that makes you look twice.",
    },
    availability: { es: "Disponible para trabajar", en: "Available for work" },
    location: {
      es: "Valencia o remoto",
      en: "Valencia or remote",
    },
    commuteNote: {
      es: "Sin coche por ahora; me organizo para llegar a donde haga falta.",
      en: "No car for now; I organise my way to wherever I need to be.",
    },
    email: "guigarmon3@proton.me",
    portrait: "",
    socials: [
      { label: "GitHub", url: "https://github.com/Guigarmon3" },
      { label: "Instagram", url: "https://instagram.com/raspvio" },
    ],
  },
  sections: {
    meta: {
      title: {
        es: "Guillermo García — Desarrollador de software",
        en: "Guillermo García — Software developer",
      },
      description: {
        es: "Portfolio de Guillermo García, desarrollador de software en Valencia. Abierto a cualquier tipo de proyecto, con interfaces cuidadas y ganas de aprender en equipo.",
        en: "Portfolio of Guillermo García, software developer in Valencia. Open to any kind of project, with considered interfaces and a hunger to learn with a team.",
      },
    },
    nav: {
      home: { es: "Inicio", en: "Home" },
      work: { es: "Trabajo", en: "Work" },
      about: { es: "Sobre mí", en: "About" },
      stack: { es: "Stack", en: "Stack" },
      journey: { es: "Trayectoria", en: "Journey" },
      contact: { es: "Contacto", en: "Contact" },
      menu: { es: "Menú", en: "Menu" },
      close: { es: "Cerrar", en: "Close" },
    },
    hero: {
      scroll: { es: "Desliza para empezar", en: "Scroll to start" },
      timeLabel: { es: "Hora local", en: "Local time" },
      ctaWork: { es: "Ver proyectos", en: "See projects" },
      ctaContact: { es: "Hablemos", en: "Let's talk" },
    },
    work: {
      label: { es: "01 — Trabajo seleccionado", en: "01 — Selected work" },
      title: {
        es: "Proyectos con los que he aprendido de verdad",
        en: "Projects I've actually learned from",
      },
      hint: {
        es: "Abre un caso para ver decisiones, stack y enlaces. Sin capturas: el código habla.",
        en: "Open a case to see decisions, stack and links. No screenshots: the code speaks.",
      },
      more: { es: "Más en el arcade", en: "More in the arcade" },
      open: { es: "Ver caso", en: "View case" },
      external: { es: "Abrir proyecto", en: "Open project" },
      live: { es: "LIVE", en: "LIVE" },
    },
    about: {
      label: { es: "02 — Sobre mí", en: "02 — About" },
      title: {
        es: "De los mods de Minecraft a productos completos.",
        en: "From Minecraft mods to complete products.",
      },
      paragraphs: {
        es: [
          "Empecé a programar por amigos que hacían mods de Minecraft. Ver que se podía cambiar un juego con código me pareció magia; descubrir que además se podía vivir de ello, ya fue otra cosa.",
          "Con los años entendí que los proyectos solo te dan herramientas. Lo que de verdad enseña es la gente con la que trabajas y cómo se trabaja. Por eso busco un equipo, no solo un puesto. No me caso con un lenguaje ni con un tipo de proyecto: me adapto a lo que haga falta.",
          "También sé usar la IA con criterio: le doy contexto, la guío y la llevo a lo que necesito en lugar de aceptar lo primero que devuelve. Con ella ya he afinado proyectos que usan React, TypeScript y Git, entre otros.",
        ],
        en: [
          "I got into programming through friends who made Minecraft mods. Seeing that you could change a game with code felt like magic; finding out you could also make a living from it was even better.",
          "Over time I understood that projects only give you tools. What really teaches you is the people you work with and the way they work. That's why I'm looking for a team, not just a job. I don't marry a language or a type of project: I adapt to whatever is needed.",
          "I also know how to use AI with judgement: I give it context, guide it and push it to do exactly what I need instead of accepting the first thing it returns. I've already used it to refine projects built with React, TypeScript and Git, among others.",
        ],
      },
      quote: {
        es: "No quiero saber hacerlo todo. Quiero aprenderlo bien.",
        en: "I don't want to know how to do everything. I want to learn it properly.",
      },
      playerLabel: { es: "Player card", en: "Player card" },
      playerClass: {
        es: "Abierto a cualquier proyecto · Me adapto",
        en: "Open to any project · I adapt",
      },
      nowLabel: { es: "Ahora", en: "Now" },
      now: {
        es: "Construyendo Stashly y buscando el primer equipo.",
        en: "Building Stashly and looking for my first team.",
      },
      sideQuestsLabel: { es: "Misiones secundarias", en: "Side quests" },
      sideQuests: {
        es: [
          "Mods de Minecraft",
          "Interfaces que se sienten bien",
          "IA con criterio",
          "Git sin miedo",
        ],
        en: [
          "Minecraft mods",
          "Interfaces that feel right",
          "AI with judgement",
          "Git without fear",
        ],
      },
    },
    stack: {
      label: { es: "03 — Herramientas", en: "03 — Tooling" },
      title: { es: "Mi caja de herramientas", en: "My toolbox" },
      hint: {
        es: "Cosas que he llegado a usar en proyectos reales. No es una lista cerrada.",
        en: "Things I've actually used on real projects. Not a closed list.",
      },
      note: {
        es: "¿Falta tu tecnología favorita? Perfecto: la caja sigue creciendo y me encantaría ampliar cada estante. Aprendo rápido, con café y sin dramas.",
        en: "Missing your favourite tech? Perfect: the box keeps growing and I'd love to fill every shelf. I learn fast, with coffee and zero drama.",
      },
    },
    journey: {
      label: { es: "04 — Trayectoria", en: "04 — Journey" },
      title: { es: "Cómo he llegado hasta aquí", en: "How I got here" },
      experience: { es: "Experiencia", en: "Experience" },
      education: { es: "Estudios", en: "Education" },
      nextLabel: { es: "Siguiente nivel", en: "Next level" },
      nextTitle: {
        es: "Buscando mi primer equipo",
        en: "Looking for my first team",
      },
      nextText: {
        es: "Quiero aprender de un equipo con más experiencia, aportar desde el primer commit y preguntar cuando haga falta.",
        en: "I want to learn from a team with more experience, contribute from the first commit and ask when I need to.",
      },
      nextCta: { es: "Hablemos", en: "Let's talk" },
    },
    contact: {
      label: { es: "05 — Contacto", en: "05 — Contact" },
      title: {
        es: "¿Construimos algo que se recuerde?",
        en: "Shall we build something worth remembering?",
      },
      big: { es: "Hablemos", en: "Let's talk" },
      emailLabel: { es: "Escríbeme", en: "Email me" },
      copy: { es: "Copiar email", en: "Copy email" },
      copied: { es: "Copiado", en: "Copied" },
      availabilityLabel: { es: "Disponibilidad", en: "Availability" },
      socials: { es: "Enlaces", en: "Links" },
      note: {
        es: "Si tienes un proyecto, una práctica o una vacante junior, escríbeme sin rodeos. Respondo a todo.",
        en: "If you have a project, an internship or a junior role, just write. I reply to everything.",
      },
    },
    footer: {
      rights: { es: "© 2026 Guillermo García", en: "© 2026 Guillermo García" },
      built: {
        es: "Diseñado y construido por mí. Sin plantillas.",
        en: "Designed and built by me. No templates.",
      },
      backTop: { es: "Volver arriba", en: "Back to top" },
      stackNote: {
        es: "React · TypeScript · Vite · mucho café",
        en: "React · TypeScript · Vite · lots of coffee",
      },
    },
    modal: {
      role: { es: "Rol", en: "Role" },
      year: { es: "Año", en: "Year" },
      stack: { es: "Stack", en: "Stack" },
      whatIDid: { es: "Qué hice", en: "What I did" },
      links: { es: "Enlaces", en: "Links" },
      close: { es: "Cerrar caso", en: "Close case" },
      github: { es: "GitHub", en: "GitHub" },
      external: { es: "Abrir proyecto", en: "Open project" },
    },
  },
  stack: [
    {
      id: "front",
      name: { es: "Front-end", en: "Front-end" },
      items: ["TypeScript", "React", "Vue 3", "Tailwind CSS", "CSS"],
    },
    {
      id: "back",
      name: { es: "Back-end", en: "Back-end" },
      items: ["Node.js", "Express", "Java", "PHP", "Python"],
    },
    {
      id: "data",
      name: { es: "Datos", en: "Data" },
      items: ["MySQL", "PostgreSQL", "SQLite"],
    },
    {
      id: "tools",
      name: { es: "Herramientas", en: "Tools" },
      items: ["Git", "Docker", "Linux", "Vite", "Figma"],
    },
  ],
  experience: [
    {
      id: "own-projects",
      year: "2024 — 2026",
      title: {
        es: "Desarrollador de proyectos propios",
        en: "Developer of my own projects",
      },
      place: { es: "Proyectos propios · Autodidacta", en: "Own projects · Self-taught" },
      description: {
        es: "Diseño, programo y despliego mis propios productos: de la base de datos a la última animación. Stashly, Compra y Disfruta y MinedCounter son el resultado.",
        en: "I design, build and ship my own products: from the database to the last animation. Stashly, Compra y Disfruta and MinedCounter are the result.",
      },
    },
  ],
  education: [
    {
      id: "dam",
      year: "2024 — 2026",
      title: {
        es: "2DAM · Desarrollo de Aplicaciones Multiplataforma",
        en: "2DAM · Multiplatform Application Development",
      },
      place: { es: "Formación reglada · Valencia", en: "Formal education · Valencia" },
      description: {
        es: "Programación, bases de datos, entornos y desarrollo web. La base para pasar de los ejercicios a los productos.",
        en: "Programming, databases, environments and web development. The foundation to move from exercises to products.",
      },
    },
  ],
  projects: [
    {
      id: "stashly",
      title: "Stashly",
      year: "2026",
      category: { es: "Producto personal", en: "Personal product" },
      role: {
        es: "Diseño, front-end y back-end",
        en: "Design, front-end and back-end",
      },
      stack: [
        "Vue 3",
        "TypeScript",
        "Vite",
        "Tailwind v4",
        "Pinia",
        "Express",
        "SQLite",
        "Cheerio",
      ],
      accent: "#E6C36A",
      image: "",
      subtitle: {
        es: "Wishlist con scraping propio",
        en: "Wishlist with its own scraper",
      },
      summary: {
        es: "Una aplicación para guardar los productos que quieres comprar, organizarlos por carpetas y seguir su precio. Todo autocontenido: sin APIs de terceros, sin servicios externos.",
        en: "An app to save the products you want to buy, organise them into folders and track their price. Fully self-contained: no third-party APIs, no external services.",
      },
      bullets: {
        es: [
          "Scraper en servidor con Cheerio que extrae título, imagen, precio y tienda desde una URL, usando JSON-LD como primera fuente.",
          "Autenticación propia con bcrypt y sesiones httpOnly; API REST y base de datos SQLite en el mismo proceso.",
          "Historial de precios, detección de duplicados, papelera con restauración y exportación completa en JSON.",
        ],
        en: [
          "Server-side scraper built with Cheerio that pulls title, image, price and store from a URL, using JSON-LD as the primary source.",
          "Custom auth with bcrypt and httpOnly sessions; REST API and SQLite database in the same process.",
          "Price history, duplicate detection, trash with restore, and full JSON export.",
        ],
      },
      note: {
        es: "Código disponible bajo petición.",
        en: "Code available on request.",
      },
      githubUrl: "",
      externalUrl: "",
      linkMode: "none",
      featured: true,
      visible: true,
    },
    {
      id: "compra-y-disfruta",
      title: "Compra y Disfruta",
      year: "2025",
      category: {
        es: "Proyecto intermodular · 2DAM",
        en: "Intermodular project · 2DAM",
      },
      role: { es: "Desarrollo web · Base de datos", en: "Web development · Database" },
      stack: ["PHP", "MySQL", "JavaScript", "Java"],
      accent: "#FF7A66",
      image: "",
      subtitle: {
        es: "Venta de entradas de cine con panel de administración",
        en: "Cinema ticketing with an admin panel",
      },
      summary: {
        es: "Aplicación web para gestionar la cartelera y vender entradas de un cine: películas, sesiones, salas, horarios y butacas. Incluye un panel privado para administrar todo el catálogo.",
        en: "A web app to manage the programme and sell cinema tickets: films, screenings, rooms, schedules and seats. It includes a private panel to manage the whole catalogue.",
      },
      bullets: {
        es: [
          "Modelo de datos relacional en MySQL para películas, salas, sesiones, butacas y entradas.",
          "Panel de administración con CRUD completo y control de acceso.",
          "Flujo de compra con selección de sesión y butaca, validado en servidor.",
        ],
        en: [
          "Relational MySQL data model for films, rooms, screenings, seats and tickets.",
          "Admin panel with full CRUD and access control.",
          "Purchase flow with screening and seat selection, validated server-side.",
        ],
      },
      note: { es: "", en: "" },
      githubUrl: "https://github.com/Guigarmon3/COMPRA-Y-DISFRUTA",
      externalUrl: "",
      linkMode: "github",
      featured: true,
      visible: true,
    },
    {
      id: "minedcounter",
      title: "MinedCounter",
      year: "2026",
      category: { es: "Herramienta · Java", en: "Tool · Java" },
      role: { es: "Desarrollo Java · Modding", en: "Java development · Modding" },
      stack: ["Java", "Forge", "Gradle"],
      accent: "#82C7FF",
      image: "",
      subtitle: {
        es: "Mod de Minecraft que cuenta lo que minas",
        en: "A Minecraft mod that counts what you mine",
      },
      summary: {
        es: "Mod para Minecraft 1.21.8 (Forge) que registra cuántos bloques has minado en la sesión y en el mundo. Sin telemetría y sin enviar nada a ningún servidor.",
        en: "A Minecraft 1.21.8 (Forge) mod that tracks how many blocks you have mined in the session and in the world. No telemetry, nothing sent to any server.",
      },
      bullets: {
        es: [
          "Escucha los eventos de rotura de bloque y persiste los contadores por mundo.",
          "Separa estadísticas de sesión y globales, con reinicio manual.",
          "Empaquetado y versionado para Forge 1.21.8.",
        ],
        en: [
          "Listens to block-break events and persists counters per world.",
          "Separate session and all-time stats, with manual reset.",
          "Packaged and versioned for Forge 1.21.8.",
        ],
      },
      note: { es: "", en: "" },
      githubUrl: "https://github.com/Guigarmon3/MinedCouter-1.21.8-forge",
      externalUrl: "",
      linkMode: "github",
      featured: true,
      visible: true,
    },
    {
      id: "restaurante-montes",
      title: "Restaurante Montes",
      year: "2024",
      category: { es: "Web de restaurante", en: "Restaurant website" },
      role: { es: "Front-end", en: "Front-end" },
      stack: ["HTML", "CSS", "JavaScript"],
      accent: "#F3A6D4",
      image: "",
      subtitle: { es: "Web de restaurante", en: "Restaurant website" },
      summary: {
        es: "Web de restaurante construida con HTML, CSS y JavaScript, con diseño responsive y una carta fácil de leer.",
        en: "Restaurant website built with HTML, CSS and JavaScript, with a responsive layout and an easy-to-read menu.",
      },
      bullets: {
        es: ["Maquetación responsive", "Carta y secciones informativas", "Interacción con JavaScript"],
        en: ["Responsive layout", "Menu and information sections", "JavaScript interaction"],
      },
      note: { es: "", en: "" },
      githubUrl: "https://github.com/Guigarmon3/Restaurante-Montes",
      externalUrl: "",
      linkMode: "github",
      featured: false,
      visible: true,
    },
    {
      id: "ruleta-casino",
      title: "Ruleta de casino",
      year: "2025",
      category: { es: "Java · POO", en: "Java · OOP" },
      role: { es: "Desarrollo Java", en: "Java development" },
      stack: ["Java"],
      accent: "#F2D06B",
      image: "",
      subtitle: {
        es: "Ruleta de casino en Java",
        en: "Casino roulette in Java",
      },
      summary: {
        es: "Ejercicio de programación orientada a objetos que simula una ruleta de casino.",
        en: "Object-oriented programming exercise that simulates a casino roulette.",
      },
      bullets: {
        es: ["Clases y objetos", "Lógica de apuestas", "Interfaz de consola"],
        en: ["Classes and objects", "Betting logic", "Console interface"],
      },
      note: { es: "", en: "" },
      githubUrl: "https://github.com/Guigarmon3/Ruleta-de-Casino-POO-Java",
      externalUrl: "",
      linkMode: "github",
      featured: false,
      visible: true,
    },
    {
      id: "baraja-espanola",
      title: "Baraja española",
      year: "2025",
      category: { es: "Java · Estructuras", en: "Java · Data structures" },
      role: { es: "Desarrollo Java", en: "Java development" },
      stack: ["Java"],
      accent: "#B79CFF",
      image: "",
      subtitle: { es: "Baraja española en Java", en: "Spanish deck in Java" },
      summary: {
        es: "Ejercicio de estructuras de datos con una baraja española.",
        en: "Data structures exercise built around a Spanish deck.",
      },
      bullets: {
        es: ["Estructuras de datos", "Barajado y reparto", "Lógica de juego"],
        en: ["Data structures", "Shuffling and dealing", "Game logic"],
      },
      note: { es: "", en: "" },
      githubUrl: "https://github.com/Guigarmon3/Baraja-Spanish-POO",
      externalUrl: "",
      linkMode: "github",
      featured: false,
      visible: true,
    },
  ],
  settings: {
    defaultLang: "es",
    preloader: true,
    marquee: true,
    energy: "extra",
  },
};
