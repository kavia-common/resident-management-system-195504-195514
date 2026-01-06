import React from "react";

/**
 * PUBLIC_INTERFACE
 * Renders toast notifications.
 */
export function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="toastHost" role="status" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => {
        const dotClass =
          t.variant === "success"
            ? "toastDot toastDotSuccess"
            : t.variant === "error"
              ? "toastDot toastDotError"
              : "toastDot";
        return (
          <div className="toast" key={t.id}>
            <div className={dotClass} aria-hidden="true" />
            <div>
              <p className="toastTitle">{t.title}</p>
              {t.message ? <p className="toastMsg">{t.message}</p> : null}
            </div>
            <button className="toastClose" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
