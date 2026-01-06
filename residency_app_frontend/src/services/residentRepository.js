import { seedResidents } from "./seedResidents";

const DB_NAME = "residency_app_db";
const DB_VERSION = 1;
const STORE_NAME = "residents";
const LS_KEY = "residency_app_residents_v1";

function hasIndexedDb() {
  return typeof window !== "undefined" && !!window.indexedDB;
}

function makeId() {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeResidentForCreate(input) {
  const now = Date.now();
  return {
    id: makeId(),
    name: input.name.trim(),
    age: Number(input.age),
    contact: input.contact.trim(),
    unit: input.unit.trim(),
    status: input.status || "Active",
    moveInDate: input.moveInDate || null,
    notes: input.notes ? input.notes.trim() : "",
    createdAt: now,
    updatedAt: now
  };
}

function normalizeResidentForUpdate(existing, input) {
  const now = Date.now();
  return {
    ...existing,
    name: input.name.trim(),
    age: Number(input.age),
    contact: input.contact.trim(),
    unit: input.unit.trim(),
    status: input.status || "Active",
    moveInDate: input.moveInDate || null,
    notes: input.notes ? input.notes.trim() : "",
    updatedAt: now
  };
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("unit", "unit", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Failed to open IndexedDB"));
  });
}

function idbTx(db, mode) {
  const tx = db.transaction(STORE_NAME, mode);
  return { tx, store: tx.objectStore(STORE_NAME) };
}

async function idbGetAll() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const { tx, store } = idbTx(db, "readonly");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error || new Error("Failed to read residents"));
    tx.oncomplete = () => db.close();
  });
}

async function idbGetById(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const { tx, store } = idbTx(db, "readonly");
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error("Failed to read resident"));
    tx.oncomplete = () => db.close();
  });
}

async function idbPut(resident) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const { tx, store } = idbTx(db, "readwrite");
    const req = store.put(resident);
    req.onsuccess = () => resolve(resident);
    req.onerror = () => reject(req.error || new Error("Failed to save resident"));
    tx.oncomplete = () => db.close();
  });
}

async function idbDelete(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const { tx, store } = idbTx(db, "readwrite");
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error || new Error("Failed to delete resident"));
    tx.oncomplete = () => db.close();
  });
}

async function idbCount() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const { tx, store } = idbTx(db, "readonly");
    const req = store.count();
    req.onsuccess = () => resolve(req.result || 0);
    req.onerror = () => reject(req.error || new Error("Failed to count residents"));
    tx.oncomplete = () => db.close();
  });
}

function lsReadAll() {
  const raw = window.localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lsWriteAll(residents) {
  window.localStorage.setItem(LS_KEY, JSON.stringify(residents));
}

function lsGetById(id) {
  return lsReadAll().find((r) => r.id === id) || null;
}

function lsUpsert(resident) {
  const all = lsReadAll();
  const idx = all.findIndex((r) => r.id === resident.id);
  const next = idx >= 0 ? all.map((r) => (r.id === resident.id ? resident : r)) : [resident, ...all];
  lsWriteAll(next);
  return resident;
}

function lsDelete(id) {
  const all = lsReadAll().filter((r) => r.id !== id);
  lsWriteAll(all);
  return true;
}

async function ensureSeeded() {
  if (hasIndexedDb()) {
    const count = await idbCount();
    if (count > 0) return;
    // Seed in deterministic order.
    for (const r of seedResidents) {
      await idbPut(r);
    }
    return;
  }

  const all = lsReadAll();
  if (all.length > 0) return;
  lsWriteAll(seedResidents);
}

/**
 * PUBLIC_INTERFACE
 * Returns a repository for residents with IndexedDB preferred and localStorage fallback.
 * This is the only module that should touch browser storage.
 */
export function createResidentRepository() {
  /**
   * PUBLIC_INTERFACE
   * Ensure the repository is initialized (seeding on first run if empty).
   */
  async function init() {
    await ensureSeeded();
  }

  /**
   * PUBLIC_INTERFACE
   * List all residents.
   * @returns {Promise<any[]>}
   */
  async function list() {
    await ensureSeeded();
    if (hasIndexedDb()) {
      const all = await idbGetAll();
      return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    return lsReadAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  /**
   * PUBLIC_INTERFACE
   * Get resident by id.
   * @param {string} id
   * @returns {Promise<any|null>}
   */
  async function getById(id) {
    await ensureSeeded();
    if (hasIndexedDb()) return idbGetById(id);
    return lsGetById(id);
  }

  /**
   * PUBLIC_INTERFACE
   * Create a resident.
   * @param {Object} input
   * @returns {Promise<any>}
   */
  async function create(input) {
    await ensureSeeded();
    const resident = normalizeResidentForCreate(input);
    if (hasIndexedDb()) return idbPut(resident);
    return lsUpsert(resident);
  }

  /**
   * PUBLIC_INTERFACE
   * Update a resident by id.
   * @param {string} id
   * @param {Object} input
   * @returns {Promise<any>}
   */
  async function update(id, input) {
    await ensureSeeded();
    const existing = await getById(id);
    if (!existing) throw new Error("Resident not found");
    const updated = normalizeResidentForUpdate(existing, input);
    if (hasIndexedDb()) return idbPut(updated);
    return lsUpsert(updated);
  }

  /**
   * PUBLIC_INTERFACE
   * Delete a resident by id.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async function remove(id) {
    await ensureSeeded();
    if (hasIndexedDb()) return idbDelete(id);
    return lsDelete(id);
  }

  return { init, list, getById, create, update, remove };
}
