import { useCallback, useMemo, useState } from "react";

function makeToastId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * PUBLIC_INTERFACE
 * Toast state management hook.
 * @returns {{toasts: any[], pushToast: Function, removeToast: Function}}
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ title, message, variant = "info", durationMs = 3200 }) => {
      const id = makeToastId();
      const toast = { id, title, message, variant };
      setToasts((prev) => [toast, ...prev].slice(0, 4));
      window.setTimeout(() => removeToast(id), durationMs);
      return id;
    },
    [removeToast]
  );

  return useMemo(() => ({ toasts, pushToast, removeToast }), [toasts, pushToast, removeToast]);
}
