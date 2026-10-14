import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useEditor } from "./EditorContext";

type Step = "password" | "code";

export function LoginGate() {
  const { auth, authenticated, closeGate } = useEditor();
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGate();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [closeGate]);

  const requestCode = async (event?: FormEvent) => {
    event?.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            challenge?: string;
            sent?: boolean;
            debugCode?: string;
            expiresIn?: number;
            error?: string;
          }
        | null;
      if (!response.ok || !payload?.challenge) {
        throw new Error(payload?.error || `API ${response.status}`);
      }
      setChallenge(payload.challenge);
      setStep("code");
      setCode("");
      setDebugCode(payload.debugCode ?? "");
      setNotice(
        payload.sent
          ? "Código enviado a tu móvil por ntfy."
          : "Código generado. Revisa la consola del servidor (modo debug).",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo iniciar el acceso.",
      );
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || code.length !== 6 || !challenge) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, code }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { authenticated?: boolean; error?: string }
        | null;
      if (!response.ok || !payload?.authenticated) {
        throw new Error(payload?.error || `API ${response.status}`);
      }
      authenticated();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "El código no es válido.",
      );
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="edit-modal edit-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-gate-title"
    >
      <div className="edit-modal__backdrop" onClick={closeGate} />
      <div className="edit-modal__card edit-gate__card">
        <header className="edit-gate__head">
          <span className="edit-gate__mark">GG</span>
          <button
            type="button"
            className="edit-modal__close"
            onClick={closeGate}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <p className="edit-modal__eyebrow">Acceso privado</p>
        <h1 className="edit-gate__title" id="edit-gate-title">
          {step === "password" ? "Editar la web" : "Confirma el código"}
        </h1>
        <p className="edit-gate__lead">
          {step === "password"
            ? "Introduce la contraseña. Después recibirás un código de 6 dígitos en el móvil por ntfy y tendrás que confirmarlo."
            : "El código caduca en 5 minutos. Escríbelo tal cual aparece en la notificación."}
        </p>

        {auth === "checking" ? (
          <p className="edit-gate__notice">Comprobando sesión…</p>
        ) : step === "password" ? (
          <form className="edit-gate__form" onSubmit={requestCode}>
            <label className="cfg-field">
              <span className="cfg-field__label">Contraseña</span>
              <input
                className="cfg-input"
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Escribe la contraseña"
              />
            </label>
            {error ? (
              <p className="cfg-alert" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="cfg-btn cfg-btn--primary cfg-btn--wide"
              disabled={busy || !password}
            >
              {busy ? "Comprobando…" : "Continuar"}
            </button>
          </form>
        ) : (
          <form className="edit-gate__form" onSubmit={verify}>
            <label className="cfg-field">
              <span className="cfg-field__label">Código de 6 dígitos</span>
              <input
                className="cfg-input edit-gate__code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
              />
            </label>
            {notice ? (
              <p className="edit-gate__notice">{notice}</p>
            ) : null}
            {debugCode ? (
              <p className="edit-gate__debug">
                Modo debug: el código es <b>{debugCode}</b>
              </p>
            ) : null}
            {error ? (
              <p className="cfg-alert" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="cfg-btn cfg-btn--primary cfg-btn--wide"
              disabled={busy || code.length !== 6}
            >
              {busy ? "Verificando…" : "Entrar en modo edición"}
            </button>
            <div className="edit-gate__links">
              <button
                type="button"
                className="edit-gate__link"
                onClick={() => {
                  setStep("password");
                  setChallenge("");
                  setCode("");
                  setDebugCode("");
                  setError(null);
                  setNotice(null);
                }}
              >
                ← Volver
              </button>
              <button
                type="button"
                className="edit-gate__link"
                onClick={() => void requestCode()}
                disabled={busy}
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}

        <p className="edit-gate__foot">
          Solo tú puedes entrar: contraseña + código de un solo uso. La sesión
          se cierra al cerrar el navegador o al pulsar “Cerrar sesión”.
        </p>
      </div>
    </div>,
    document.body,
  );
}
