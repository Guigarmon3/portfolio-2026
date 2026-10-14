import type { JourneyItem, Project, StackGroup } from "../data/content";

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function blankProject(index = 0): Project {
  return {
    id: uid("proyecto"),
    title: `Proyecto ${index + 1}`,
    image: "",
    year: String(new Date().getFullYear()),
    category: { es: "Proyecto personal", en: "Personal project" },
    role: { es: "Desarrollo web", en: "Web development" },
    stack: [],
    accent: "#c9f26b",
    subtitle: { es: "", en: "" },
    summary: { es: "", en: "" },
    bullets: { es: [], en: [] },
    note: { es: "", en: "" },
    githubUrl: "",
    externalUrl: "",
    linkMode: "none",
    featured: false,
    visible: true,
  };
}

export function blankJourney(
  kind: "experience" | "education",
): JourneyItem {
  const isExperience = kind === "experience";
  return {
    id: uid(kind),
    year: String(new Date().getFullYear()),
    title: {
      es: isExperience ? "Nuevo puesto" : "Nuevos estudios",
      en: isExperience ? "New role" : "New studies",
    },
    place: { es: "", en: "" },
    description: { es: "", en: "" },
  };
}

export function blankStackGroup(index = 0): StackGroup {
  return {
    id: uid("grupo"),
    name: {
      es: `Grupo ${index + 1}`,
      en: `Group ${index + 1}`,
    },
    items: [],
  };
}
