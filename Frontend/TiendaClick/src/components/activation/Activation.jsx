import { Card, Alert, Form, Button, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { getActivationStatus, activateLicense } from "../../services/axios.services.activation";
import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";
import SideBar from "../sideNav/SideBar";
import DashboardHeader from "../dashboard/DashboardHeader";

export default function Activation() {
  const [isActivated, setIsActivated] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [key, setKey] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 850);

  useEffect(() => {
    fetchStatus();

    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 850);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!remainingTime) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  const fetchStatus = async () => {
    const data = await getActivationStatus();
    setIsActivated(data.isActivated);
    setRemainingTime(data.remainingTime);
  };

  const handleActivate = async () => {
    if (isSending) return;

    try {
      setIsSending(true);
      const res = await activateLicense(key);

      if (res.success) {
        await fetchStatus();
      } else {
        alert("Clave inválida");
      }
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (isActivated === null) return null;

  return (
    <RequirePermission permission="access_dashboard">
      <div className={`app-wrapper ${!showSidebar ? "no-sidebar" : ""}`}>
        
        <div className="header-container text-center mt-2">
          <DashboardHeader title={"CONFIGURACIÓN"} isDashboard={false} />
        </div>

        {showSidebar && <SideBar />}

        <main className="content">
          <section className="app-content container-fluid d-flex justify-content-center align-items-center flex-column">
            
            <Card
              className="auth-card shadow-sm"
              style={{ maxWidth: "420px", width: "100%" }}
            >
              <Card.Header className="auth-card-header text-center fw-semibold">
                Activación de TiendaClick
              </Card.Header>

              <Card.Body className="text-center">
                {isActivated ? (
                  <Alert variant="success" className="mb-0">
                    ¡TiendaClick está activado!
                  </Alert>
                ) : (
                  <>
                    <div className="text-danger fw-semibold mb-2">
                      TiendaClick no esta activado, tu prueba gratuita finaliza en:
                    </div>

                    <div className="mb-3 fw-bold" style={{ fontSize: 20 }}>
                      {formatTime(remainingTime)}
                    </div>

                    <Form.Control
                      type="text"
                      placeholder="Ingrese clave de activación"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      style={{ maxWidth: "350px", margin: "0 auto" }}
                      className="mb-3"
                    />

                    <Button
                      variant="success"
                      type="button"
                      onClick={handleActivate}
                      className="mt-2 send-form-button"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Activando...
                        </>
                      ) : (
                        "Activar"
                      )}
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>

          </section>
        </main>
      </div>
    </RequirePermission>
  );
}