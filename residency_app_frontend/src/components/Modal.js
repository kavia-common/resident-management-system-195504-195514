import React, { useEffect, useRef } from "react";
import { Button } from "./Button";

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  );
}

/**
 * PUBLIC_INTERFACE
 * Accessible modal dialog.
 */
export function Modal({ title, isOpen, onClose, children, footerLeft, footerRight, initialFocusSelector }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const el = dialogRef.current;
    if (!el) return;

    // Save previous focus and restore on close.
    const previous = document.activeElement;

    // Focus initial element.
    const focusNow = () => {
      const focusables = getFocusableElements(el);
      if (initialFocusSelector) {
        const target = el.querySelector(initialFocusSelector);
        if (target && typeof target.focus === "function") {
          target.focus();
          return;
        }
      }
      if (focusables[0]) focusables[0].focus();
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = getFocusableElements(el);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(focusNow, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previous && typeof previous.focus === "function") previous.focus();
    };
  }, [isOpen, onClose, initialFocusSelector]);

  if (!isOpen) return null;

  return (
    <div
      className="modalOverlay"
      role="presentation"
      onMouseDown={(e) => {
        // Close if click started on overlay (not inside dialog).
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={dialogRef}>
        <div className="modalHeader">
          <h2 className="modalTitle">{title}</h2>
          <button className="iconBtn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="modalBody">{children}</div>
        <div className="modalFooter">
          <div className="btnRow">{footerLeft}</div>
          <div className="btnRow">
            {footerRight ? footerRight : <Button onClick={onClose}>Close</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
