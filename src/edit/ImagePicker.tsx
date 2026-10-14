import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { createPortal } from "react-dom";
import { isSafeUrl, safeImageUrl } from "../lib/site";
import { useEditor } from "./EditorContext";

const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_BYTES = 12 * 1024 * 1024;

export function ImagePicker() {
  const { imageRequest, closeImage } = useEditor();
  const [tab, setTab] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrl = useRef("");

  useEffect(() => {
    if (!imageRequest) return;
    setTab("file");
    setUrl(imageRequest.value);
    setPreview(safeImageUrl(imageRequest.value));
    setFile(null);
    setBusy(false);
    setError(null);
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = "";
    };
  }, [imageRequest]);

  useEffect(() => {
    if (!imageRequest) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeImage();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [imageRequest, closeImage]);

  if (!imageRequest) return null;

  const pickFile = (next: File | null) => {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = "";
    }
    setError(null);
    if (!next) {
      setFile(null);
      setPreview(safeImageUrl(imageRequest.value));
      return;
    }
    if (!ACCEPTED.includes(next.type)) {
      setError("Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("La imagen supera los 12 MB.");
      return;
    }
    objectUrl.current = URL.createObjectURL(next);
    setFile(next);
    setPreview(objectUrl.current);
  };

  const upload = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });
      const payload = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || `API ${response.status}`);
      }
      imageRequest.onChange(payload.url);
      closeImage();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo subir la imagen.",
      );
    } finally {
      setBusy(false);
    }
  };

  const applyUrl = () => {
    const value = url.trim();
    if (!value) {
      setError("Escribe una URL o elige un archivo.");
      return;
    }
    if (!isSafeUrl(value) || !safeImageUrl(value)) {
      setError("Usa una URL http(s) o una ruta local que empiece por /uploads/.");
      return;
    }
    imageRequest.onChange(value);
    closeImage();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const next = event.dataTransfer.files?.[0] ?? null;
    if (next) pickFile(next);
  };

  return createPortal(
    <div
      className="edit-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-picker-title"
    >
      <div className="edit-modal__backdrop" onClick={closeImage} />
      <div className="edit-modal__card edit-image-picker">
        <header className="edit-modal__head">
          <div>
            <p className="edit-modal__eyebrow">Imagen</p>
            <h2 className="edit-modal__title" id="image-picker-title">
              {imageRequest.title}
            </h2>
          </div>
          <button
            type="button"
            className="edit-modal__close"
            onClick={closeImage}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="edit-tabs" role="tablist" aria-label="Origen de la imagen">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "file"}
            className={`edit-tab${tab === "file" ? " is-active" : ""}`}
            onClick={() => setTab("file")}
          >
            Archivo local
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "url"}
            className={`edit-tab${tab === "url" ? " is-active" : ""}`}
            onClick={() => setTab("url")}
          >
            URL
          </button>
        </div>

        <div className="edit-image-picker__preview">
          {preview ? (
            <img src={preview} alt="Vista previa" />
          ) : (
            <span>Vista previa</span>
          )}
        </div>

        {tab === "file" ? (
          <div
            className="edit-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="edit-dropzone__input"
              onChange={(event) => {
                pickFile(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
            <p className="edit-dropzone__title">
              {file ? file.name : "Arrastra una imagen o elígela del equipo"}
            </p>
            <p className="edit-dropzone__hint">
              JPG, PNG, WebP, GIF o AVIF · máximo 12 MB
            </p>
            <button
              type="button"
              className="cfg-btn cfg-btn--small"
              onClick={() => fileRef.current?.click()}
            >
              Elegir archivo
            </button>
          </div>
        ) : (
          <div className="cfg-field">
            <label className="cfg-field__label" htmlFor="image-url">
              URL de la imagen
            </label>
            <input
              id="image-url"
              className="cfg-input"
              value={url}
              placeholder="https://… o /uploads/…"
              spellCheck={false}
              onChange={(event) => {
                const value = event.target.value;
                setUrl(value);
                setPreview(safeImageUrl(value));
                setError(null);
              }}
            />
            <span className="cfg-field__hint">
              Se guarda la URL tal cual. Para archivos locales, usa la pestaña
              “Archivo local”.
            </span>
          </div>
        )}

        {error ? (
          <p className="cfg-alert" role="alert">
            {error}
          </p>
        ) : null}

        <footer className="edit-modal__foot">
          <button
            type="button"
            className="cfg-btn cfg-btn--ghost"
            onClick={closeImage}
          >
            Cancelar
          </button>
          {tab === "file" ? (
            <button
              type="button"
              className="cfg-btn cfg-btn--primary"
              onClick={() => void upload()}
              disabled={!file || busy}
            >
              {busy ? "Subiendo…" : "Subir y usar"}
            </button>
          ) : (
            <button
              type="button"
              className="cfg-btn cfg-btn--primary"
              onClick={applyUrl}
            >
              Aplicar URL
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
