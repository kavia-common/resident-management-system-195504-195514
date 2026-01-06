import React from "react";

/**
 * PUBLIC_INTERFACE
 * Reusable button component.
 */
export function Button({ variant = "default", size = "default", type = "button", className = "", ...props }) {
  const variantClass =
    variant === "primary"
      ? "btnPrimary"
      : variant === "danger"
        ? "btnDanger"
        : variant === "success"
          ? "btnSuccess"
          : "";

  const sizeClass = size === "small" ? "btnSmall" : "";

  return <button type={type} className={`btn ${variantClass} ${sizeClass} ${className}`.trim()} {...props} />;
}
