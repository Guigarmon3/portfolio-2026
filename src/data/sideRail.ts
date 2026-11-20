import type { Lang } from "./content";

export interface SideSectionCopy {
  note: Record<Lang, string>;
  quote: Record<Lang, string>;
}

/**
 * Copy del rail lateral. Es contenido de acompañamiento, no editable desde el
 * panel: si algún día se quiere tocar desde el editor, habría que moverlo al
 * modelo de contenido. De momento vive aquí para no ensuciar la API.
 */
export const sideRailCopy: Record<string, SideSectionCopy> = {
  top: {
    note: {
      es: "SYSTEM BOOT / Valencia, ES",
      en: "SYSTEM BOOT / Valencia, ES",
    },
    quote: {
      es: "Diseño y código, en la misma cabeza.",
      en: "Design and code, in the same head.",
    },
  },
  work: {
    note: {
      es: "Selección de proyectos / 2024—2026",
      en: "Selected work / 2024—2026",
    },
    quote: {
      es: "Cuatro proyectos, cuatro problemas distintos.",
      en: "Four projects, four different problems.",
    },
  },
  about: {
    note: {
      es: "Perfil y forma de trabajar",
      en: "Profile and way of working",
    },
    quote: {
      es: "Aprendo haciendo, y luego lo rompo.",
      en: "I learn by doing, then I break it.",
    },
  },
  stack: {
    note: {
      es: "Front, back y herramientas",
      en: "Front, back and tools",
    },
    quote: {
      es: "Herramientas, no religiones.",
      en: "Tools, not religions.",
    },
  },
  journey: {
    note: {
      es: "2019—2026 / educación y trabajo",
      en: "2019—2026 / education and work",
    },
    quote: {
      es: "De 2DAM al mundo real.",
      en: "From 2DAM to the real world.",
    },
  },
  contact: {
    note: {
      es: "Canal abierto / hablemos",
      en: "Open channel / let's talk",
    },
    quote: {
      es: "Hablemos de lo que quieres construir.",
      en: "Let's talk about what you want to build.",
    },
  },
};

export const sideRailStatus: Record<Lang, string> = {
  es: "DISPONIBLE",
  en: "AVAILABLE",
};

export const sideRailLabels: Record<Lang, { projects: string; time: string }> = {
  es: { projects: "PROYECTOS", time: "HORA LOCAL" },
  en: { projects: "PROJECTS", time: "LOCAL TIME" },
};
