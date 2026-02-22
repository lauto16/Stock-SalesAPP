import { Card, Alert } from "react-bootstrap";
import QRCode from "react-qr-code";
import { useMemo } from "react";

export default function SiteQR() {
  const { baseUrl, isLocal } = useMemo(() => {
    const origin = window.location.origin;
    const hostname = window.location.hostname;

    const localHosts = ["localhost", "127.0.0.1", "::1"];

    return {
      baseUrl: origin,
      isLocal: localHosts.includes(hostname)
    };
  }, []);

  return (
    <div
      className="d-flex justify-content-center align-items-center w-100"
      style={{ minHeight: "100%" }}
    >
      <Card
        className="auth-card shadow-sm"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <Card.Header className="auth-card-header text-center fw-semibold">
          Acceso rápido al sitio
        </Card.Header>

        <Card.Body className="text-center">

          {isLocal ? (
            <Alert variant="warning" className="mb-0">
              <div className="fw-semibold mb-1">
                No fue posible generar el QR
              </div>
              <small>
                Ingresa desde la IP local del servidor para permitir el acceso desde otros dispositivos.
              </small>
            </Alert>
          ) : (
            <>
              <div
                style={{
                  background: "white",
                  padding: 16,
                  borderRadius: 12,
                  display: "inline-block"
                }}
              >
                <QRCode
                  value={baseUrl}
                  size={220}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 256 256"
                />
              </div>

              <div className="mt-3 small text-muted">
                Escanea para abrir:
              </div>

              <div
                className="fw-semibold"
                style={{
                  wordBreak: "break-all",
                  fontSize: 14
                }}
              >
                {baseUrl}
              </div>
            </>
          )}

        </Card.Body>
      </Card>
    </div>
  );
}