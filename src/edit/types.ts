import type { SiteContent } from "../data/content";

export type SectionKey = keyof SiteContent["sections"];

export type EditorTarget =
  | { kind: "profile" }
  | { kind: "hero" }
  | { kind: "about" }
  | { kind: "project"; id: string }
  | {
      kind: "journey";
      collection: "experience" | "education";
      id: string;
    }
  | { kind: "stack"; id: string }
  | { kind: "texts"; group: SectionKey }
  | { kind: "socials" }
  | { kind: "contact" }
  | { kind: "settings" };

export interface ImageRequest {
  title: string;
  value: string;
  onChange: (url: string) => void;
}
