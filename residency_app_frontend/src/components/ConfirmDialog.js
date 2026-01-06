import React from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

/**
 * PUBLIC_INTERFACE
 * Confirmation dialog modal.
 */
export function ConfirmDialog({ isOpen, title, message, confirmText = "Confirm", danger = false, onConfirm, onClose }) {
  const confirmVariant = danger ? "danger" : "primary";
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      initialFocusSelector='button[data-confirm="true"]'
      footerLeft={
        <Button onClick={onClose} className="">
          Cancel
        </Button>
      }
      footerRight={
        <Button variant={confirmVariant} data-confirm="true" onClick={onConfirm}>
          {confirmText}
        </Button>
      }
    >
      <p className="pageSubtitle" style={{ margin: 0 }}>
        {message}
      </p>
    </Modal>
  );
}
