import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Modal } from "../components/Modal";
import { ResidentForm } from "../components/ResidentForm";
import { StatusBadge } from "../components/StatusBadge";
import { useResidents } from "../hooks/useResidents";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

/**
 * PUBLIC_INTERFACE
 * Detail page for a single resident.
 */
export function ResidentDetailPage({ pushToast }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const decodedId = useMemo(() => decodeURIComponent(id || ""), [id]);

  const { residents, loading, getResidentById, updateResident, deleteResident } = useResidents();
  const [resident, setResident] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!decodedId) return;
      setNotFound(false);

      // Prefer current list, fallback to repo fetch.
      const fromList = residents.find((r) => r.id === decodedId);
      if (fromList) {
        if (mounted) setResident(fromList);
        return;
      }
      try {
        const fetched = await getResidentById(decodedId);
        if (mounted) {
          setResident(fetched);
          setNotFound(!fetched);
        }
      } catch {
        if (mounted) {
          setResident(null);
          setNotFound(true);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [decodedId, residents, getResidentById]);

  const onSubmitEdit = async (values) => {
    if (!resident) return;
    await updateResident(resident.id, values);
    pushToast({ title: "Resident updated", message: "Changes saved.", variant: "success" });
    setIsEditOpen(false);
  };

  const onConfirmDelete = async () => {
    if (!resident) return;
    try {
      await deleteResident(resident.id);
      pushToast({ title: "Resident deleted", message: `${resident.name} removed.`, variant: "success" });
      navigate("/");
    } catch (err) {
      pushToast({ title: "Delete failed", message: err?.message || "Unable to delete resident.", variant: "error" });
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Resident details</h1>
          <p className="pageSubtitle">
            <Link to="/" className="App-link">
              ← Back to dashboard
            </Link>
          </p>
        </div>
        {resident ? (
          <div className="btnRow">
            <Button onClick={() => setIsEditOpen(true)}>Edit</Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      <div className="surface card" aria-busy={loading ? "true" : "false"}>
        {loading && !resident ? (
          <div className="smallText">Loading resident…</div>
        ) : notFound || !resident ? (
          <div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Resident not found</div>
            <div className="smallText">This resident may have been deleted on this device.</div>
            <div style={{ height: 12 }} />
            <Button variant="primary" onClick={() => navigate("/")}>
              Go to dashboard
            </Button>
          </div>
        ) : (
          <div>
            <div className="cardTitleRow">
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{resident.name}</div>
                <div className="smallText">
                  Unit <strong>{resident.unit}</strong> • Age <strong>{resident.age}</strong>
                </div>
              </div>
              <StatusBadge status={resident.status} />
            </div>

            <div className="grid2">
              <div className="surface card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Contact</div>
                <div className="smallText">{resident.contact || "—"}</div>
              </div>
              <div className="surface card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Move-in date</div>
                <div className="smallText">{formatDate(resident.moveInDate)}</div>
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div className="surface card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Notes</div>
              <div className="smallText" style={{ whiteSpace: "pre-wrap" }}>
                {resident.notes ? resident.notes : "—"}
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div className="smallText">
              Created {new Date(resident.createdAt).toLocaleString()} • Updated{" "}
              {new Date(resident.updatedAt || resident.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Edit resident"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialFocusSelector="#name"
        footerLeft={null}
        footerRight={null}
      >
        <ResidentForm
          initialResident={resident}
          onSubmit={onSubmitEdit}
          onCancel={() => setIsEditOpen(false)}
          submitLabel="Save changes"
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete resident?"
        message="This will permanently remove the resident from local storage on this device."
        confirmText="Delete"
        danger
        onConfirm={onConfirmDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
