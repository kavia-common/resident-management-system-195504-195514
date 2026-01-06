import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Modal } from "../components/Modal";
import { ResidentForm } from "../components/ResidentForm";
import { StatusBadge } from "../components/StatusBadge";
import { useResidents } from "../hooks/useResidents";

const PAGE_SIZE = 10;

function matchesQuery(resident, q) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = `${resident.name} ${resident.contact} ${resident.unit} ${resident.status}`.toLowerCase();
  return hay.includes(s);
}

/**
 * PUBLIC_INTERFACE
 * Main dashboard page listing residents.
 */
export function DashboardPage({ pushToast }) {
  const navigate = useNavigate();
  const { loading, residents, error, createResident, updateResident, deleteResident } = useResidents();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);

  const [deleteId, setDeleteId] = useState("");

  const filtered = useMemo(() => {
    const base = residents.filter((r) => matchesQuery(r, query));
    if (status === "All") return base;
    return base.filter((r) => r.status === status);
  }, [residents, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const openAdd = () => {
    setEditingResident(null);
    setIsFormOpen(true);
  };

  const openEdit = (resident) => {
    setEditingResident(resident);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingResident(null);
  };

  const onSubmit = async (values) => {
    if (editingResident) {
      await updateResident(editingResident.id, values);
      pushToast({
        title: "Resident updated",
        message: `${values.name} saved successfully.`,
        variant: "success"
      });
    } else {
      await createResident(values);
      pushToast({
        title: "Resident added",
        message: `${values.name} created successfully.`,
        variant: "success"
      });
    }
    closeForm();
  };

  const onAskDelete = (id) => setDeleteId(id);

  const onConfirmDelete = async () => {
    const id = deleteId;
    setDeleteId("");
    try {
      const r = residents.find((x) => x.id === id);
      await deleteResident(id);
      pushToast({
        title: "Resident deleted",
        message: r ? `${r.name} removed.` : "Resident removed.",
        variant: "success"
      });
    } catch (err) {
      pushToast({
        title: "Delete failed",
        message: err?.message || "Unable to delete resident.",
        variant: "error"
      });
    }
  };

  const onRowOpen = (id) => navigate(`/residents/${encodeURIComponent(id)}`);

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Residents</h1>
          <p className="pageSubtitle">Local-only residency management. Data is stored on this device.</p>
        </div>
        <div className="btnRow">
          <Button variant="primary" onClick={openAdd}>
            + Add resident
          </Button>
        </div>
      </div>

      <div className="surface card">
        <div className="cardTitleRow">
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Directory</div>
            <div className="kbdHint">Tip: Click a row to view details</div>
          </div>
          <div className="smallText">
            Showing <strong>{filtered.length}</strong> resident{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="toolbar" role="search">
          <div>
            <label className="fieldLabel" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, contact, unit, status..."
            />
          </div>

          <div>
            <label className="fieldLabel" htmlFor="statusFilter">
              Status
            </label>
            <select
              id="statusFilter"
              className="select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Moved out">Moved out</option>
            </select>
          </div>

          <div>
            <div className="fieldLabel">Page size</div>
            <div className="smallText">{PAGE_SIZE} per page</div>
          </div>

          <div className="btnRow" style={{ justifyContent: "flex-end" }}>
            <Button onClick={() => openAdd()} variant="primary" size="small">
              Add
            </Button>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {error ? (
          <div className="fieldError" role="alert">
            {error}
          </div>
        ) : null}

        <div className="tableWrap" aria-busy={loading ? "true" : "false"}>
          <table className="table" aria-label="Resident list">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Name</th>
                <th style={{ width: 90 }}>Age</th>
                <th style={{ width: 110 }}>Unit</th>
                <th style={{ width: 130 }}>Status</th>
                <th style={{ width: 220 }}>Contact</th>
                <th style={{ width: 190 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="smallText">
                    Loading residents…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="smallText">
                    No residents match the current filters.
                  </td>
                </tr>
              ) : (
                pageItems.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button className="tableRowBtn" onClick={() => onRowOpen(r.id)}>
                        <div style={{ fontWeight: 800 }}>{r.name}</div>
                        <div className="smallText">Updated {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}</div>
                      </button>
                    </td>
                    <td>{r.age}</td>
                    <td style={{ fontWeight: 700 }}>{r.unit}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="smallText">{r.contact}</td>
                    <td>
                      <div className="btnRow">
                        <Button size="small" onClick={() => openEdit(r)}>
                          Edit
                        </Button>
                        <Button size="small" variant="danger" onClick={() => onAskDelete(r.id)}>
                          Delete
                        </Button>
                        <Button size="small" variant="success" onClick={() => onRowOpen(r.id)}>
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination" aria-label="Pagination">
          <div className="smallText">
            Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="btnRow">
            <Button
              size="small"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              aria-disabled={safePage <= 1}
            >
              Prev
            </Button>
            <Button
              size="small"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              aria-disabled={safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title={editingResident ? "Edit resident" : "Add resident"}
        isOpen={isFormOpen}
        onClose={closeForm}
        initialFocusSelector="#name"
        footerLeft={null}
        footerRight={null}
      >
        <ResidentForm
          initialResident={editingResident}
          onSubmit={onSubmit}
          onCancel={closeForm}
          submitLabel={editingResident ? "Save changes" : "Create resident"}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete resident?"
        message="This will permanently remove the resident from local storage on this device."
        confirmText="Delete"
        danger
        onConfirm={onConfirmDelete}
        onClose={() => setDeleteId("")}
      />
    </div>
  );
}
