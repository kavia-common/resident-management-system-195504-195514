import React from "react";

/**
 * PUBLIC_INTERFACE
 * Form field wrapper providing label, hint, and error text.
 */
export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div>
      <label className="fieldLabel" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <div className="fieldError" role="alert">
          {error}
        </div>
      ) : hint ? (
        <div className="fieldHint">{hint}</div>
      ) : null}
    </div>
  );
}
