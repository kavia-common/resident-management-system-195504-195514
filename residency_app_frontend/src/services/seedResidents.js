/** @type {import("../types/resident").Resident[]|any} */
export const seedResidents = [
  {
    id: "r_001",
    name: "Amina Hassan",
    age: 74,
    contact: "amina.hassan@example.com",
    unit: "A-204",
    status: "Active",
    moveInDate: "2023-09-12",
    notes: "Prefers morning check-ins. Allergic to penicillin.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: "r_002",
    name: "Daniel Brooks",
    age: 68,
    contact: "(555) 013-4421",
    unit: "B-118",
    status: "Pending",
    moveInDate: null,
    notes: "Family requested wheelchair accessibility confirmation.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  },
  {
    id: "r_003",
    name: "Mei Chen",
    age: 81,
    contact: "(555) 019-8820",
    unit: "C-310",
    status: "Moved out",
    moveInDate: "2022-03-05",
    notes: "Moved out on 2025-01-01. Keep records for 1 year.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 300,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  }
];
