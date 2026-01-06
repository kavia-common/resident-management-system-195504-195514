import React from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { Button } from "./components/Button";
import { ToastHost } from "./components/ToastHost";
import { useToasts } from "./hooks/useToasts";
import { DashboardPage } from "./pages/DashboardPage";
import { ResidentDetailPage } from "./pages/ResidentDetailPage";

function AppShell() {
  const { toasts, pushToast, removeToast } = useToasts();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="App appShell">
      <header className="navbar">
        <div className="navbarInner container" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div className="brand" aria-label="Residency Management">
            <div className="brandMark" aria-hidden="true" />
            <div>
              <div className="brandTitle">Residency Manager</div>
              <div className="brandSub">Local-only resident directory</div>
            </div>
          </div>

          <div className="navActions">
            {location.pathname !== "/" ? (
              <Button
                size="small"
                onClick={() => navigate("/")}
                aria-label="Back to dashboard"
              >
                Dashboard
              </Button>
            ) : null}
            <Button
              size="small"
              variant="success"
              onClick={() =>
                pushToast({
                  title: "Stored locally",
                  message: "All resident data is saved in IndexedDB (or localStorage fallback) on this device.",
                  variant: "info"
                })
              }
            >
              How data is stored
            </Button>
          </div>
        </div>
      </header>

      <main className="main" role="main">
        <Routes>
          <Route path="/" element={<DashboardPage pushToast={pushToast} />} />
          <Route path="/residents/:id" element={<ResidentDetailPage pushToast={pushToast} />} />
          <Route
            path="*"
            element={
              <div className="container">
                <div className="surface card">
                  <h1 className="pageTitle">Not found</h1>
                  <p className="pageSubtitle">That page doesn’t exist.</p>
                  <Button variant="primary" onClick={() => navigate("/")}>
                    Go to dashboard
                  </Button>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      <ToastHost toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
