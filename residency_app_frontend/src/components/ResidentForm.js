import React, { useMemo, useState } from "react";
import { Button } from "./Button";
import { Field } from "./Field";

const STATUSES = ["Active", "Pending", "Moved out"];

function toFormValue(resident) {
  return {
    name: resident?.name || "",
    age: resident?.age ?? "",
    contact: resident?.contact || "",
    unit: resident?.unit || "",
    status: resident?.status || "Active",
    moveInDate: resident?.moveInDate || "",
    notes: resident?.notes || ""
  };
}

function validate(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  if (values.age === "" || values.age === null) {
    errors.age = "Age is required.";
  } else if (!Number.isFinite(Number(values.age)) || Number(values.age) <= 0) {
    errors.age = "Age must be a positive number.";
  }

  if (!values.contact.trim()) errors.contact = "Contact is required.";
  if (!values.unit.trim()) errors.unit = "Unit/room is required.";

  if (values.moveInDate) {
    // Basic YYYY-MM-DD check: rely on input type=date but validate anyway.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.moveInDate)) {
      errors.moveInDate = "Move-in date must be a valid date.";
    }
  }

  if (values.status && !STATUSES.includes(values.status)) {
    errors.status = "Invalid status.";
  }

  return errors;
}

/**
 * PUBLIC_INTERFACE
 * Controlled form for creating/updating residents.
 */
export function ResidentForm({ initialResident, onSubmit, onCancel, submitLabel }) {
  const [values, setValues] = useState(() => toFormValue(initialResident));
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const showError = (key) => Boolean(touched[key] && errors[key]);

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onBlur = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      age: true,
      contact: true,
      unit: true,
      status: true,
      moveInDate: true,
      notes: true
    });

    if (!isValid) return;

    setSubmitError("");
    try {
      await onSubmit({
        ...values,
        age: Number(values.age),
        moveInDate: values.moveInDate ? values.moveInDate : null
      });
    } catch (err) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid2">
        <Field label="Full name *" htmlFor="name" error={showError("name") ? errors.name : ""}>
          <input
            id="name"
            className="input"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => onBlur("name")}
            autoComplete="name"
            required
          />
        </Field>

        <Field label="Age *" htmlFor="age" error={showError("age") ? errors.age : ""}>
          <input
            id="age"
            className="input"
            inputMode="numeric"
            value={values.age}
            onChange={(e) => setField("age", e.target.value)}
            onBlur={() => onBlur("age")}
            required
          />
        </Field>

        <Field label="Contact *" htmlFor="contact" error={showError("contact") ? errors.contact : ""}>
          <input
            id="contact"
            className="input"
            value={values.contact}
            onChange={(e) => setField("contact", e.target.value)}
            onBlur={() => onBlur("contact")}
            autoComplete="tel"
            required
          />
        </Field>

        <Field label="Unit/Room *" htmlFor="unit" error={showError("unit") ? errors.unit : ""}>
          <input
            id="unit"
            className="input"
            value={values.unit}
            onChange={(e) => setField("unit", e.target.value)}
            onBlur={() => onBlur("unit")}
            required
          />
        </Field>

        <Field label="Status" htmlFor="status" error={showError("status") ? errors.status : ""}>
          <select
            id="status"
            className="select"
            value={values.status}
            onChange={(e) => setField("status", e.target.value)}
            onBlur={() => onBlur("status")}
          >
            {STATUSES.map((s) => (
              <option value={s} key={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Move-in date"
          htmlFor="moveInDate"
          error={showError("moveInDate") ? errors.moveInDate : ""}
          hint="Optional"
        >
          <input
            id="moveInDate"
            className="input"
            type="date"
            value={values.moveInDate}
            onChange={(e) => setField("moveInDate", e.target.value)}
            onBlur={() => onBlur("moveInDate")}
          />
        </Field>
      </div>

      <div style={{ marginTop: 12 }}>
        <Field label="Notes" htmlFor="notes" hint="Optional">
          <textarea
            id="notes"
            className="textarea"
            value={values.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </Field>
      </div>

      {submitError ? (
        <div className="fieldError" role="alert" style={{ marginTop: 12 }}>
          {submitError}
        </div>
      ) : null}

      <div className="btnRow" style={{ justifyContent: "space-between", marginTop: 16 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={!isValid} aria-disabled={!isValid}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
