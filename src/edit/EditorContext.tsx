import { createContext, useContext } from "react";
import type { EditorTarget, ImageRequest } from "./types";

export type AuthState = "checking" | "out" | "in";

export interface EditorContextValue {
  editing: boolean;
  target: EditorTarget | null;
  open: (target: EditorTarget) => void;
  close: () => void;
  requestImage: (request: ImageRequest) => void;
  requestEdit: () => void;
  exit: () => void;
  logout: () => Promise<void>;
  auth: AuthState;
  gateOpen: boolean;
  closeGate: () => void;
  authenticated: () => void;
  imageRequest: ImageRequest | null;
  closeImage: () => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const value = useContext(EditorContext);
  if (!value) {
    throw new Error("useEditor debe usarse dentro de EditorProvider");
  }
  return value;
}
