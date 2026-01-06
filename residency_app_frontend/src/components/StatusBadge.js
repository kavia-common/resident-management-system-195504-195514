import React from "react";

function statusClass(status) {
  if (status === "Active") return "badge badgeGreen";
  if (status === "Moved out") return "badge badgeGray";
  if (status === "Pending") return "badge badgeRed";
  return "badge";
}

/**
 * PUBLIC_INTERFACE
 * Displays a resident status badge.
 */
export function StatusBadge({ status }) {
  return <span className={statusClass(status)}>{status || "Unknown"}</span>;
}
