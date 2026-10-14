import type { ReactNode } from "react";
import { useEditor } from "./EditorContext";

interface EditButtonProps {
  label?: string;
  onClick: () => void;
  className?: string;
}

export function EditButton({
  label = "Editar",
  onClick,
  className = "",
}: EditButtonProps) {
  const { editing } = useEditor();
  if (!editing) return null;

  return (
    <button
      type="button"
      className={`edit-btn${className ? ` ${className}` : ""}`}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3 11.5V13h1.5L12.8 4.7a1.1 1.1 0 0 0 0-1.5l-.4-.4a1.1 1.1 0 0 0-1.5 0L3 11.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="m10.2 4.4 1.4 1.4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}

interface AddButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function AddButton({ label, onClick, className = "" }: AddButtonProps) {
  const { editing } = useEditor();
  if (!editing) return null;

  return (
    <button
      type="button"
      className={`edit-add${className ? ` ${className}` : ""}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
    >
      <span aria-hidden="true">+</span>
      {label}
    </button>
  );
}

export function EditBar({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  const { editing } = useEditor();
  if (!editing) return null;

  return (
    <div className="edit-bar">
      {label ? <span className="edit-bar__label">{label}</span> : null}
      {children}
    </div>
  );
}
