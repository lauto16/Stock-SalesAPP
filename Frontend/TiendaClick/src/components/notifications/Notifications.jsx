import { useEffect, useState } from "react";
import { fetchUnseenNotifications, fetchSeenNotifications, markNotificationAsSeen } from "../../services/axios.services.notifications.js";
import { useUser } from "../../context/UserContext";
import { Alert, Spinner } from "react-bootstrap";
import { Package, AlertTriangle, PackageX, X, Skull } from "lucide-react";

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("unseen");

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return isoString.slice(0, 10).replaceAll("-", "/");
  };

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      setError("");

      const fetchFn =
        activeTab === "unseen"
          ? fetchUnseenNotifications
          : fetchSeenNotifications;

      const res = await fetchFn(user.token);

      if (!res.success) {
        setError("No se pudieron cargar las notificaciones");
      } else {
        setNotifications(res.data || []);
      }

      setLoading(false);
    }

    loadNotifications();
  }, [user.token, activeTab]);

  async function handleMarkAsSeen(id) {
    const res = await markNotificationAsSeen(id, user.token);

    if (res.success && activeTab === "unseen") {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  }

  function getIcon(subject) {
    if (subject === "EXPIRED") {
      return (
        <div className="icon-circle bg-danger text-white pulse-strong">
          <Skull size={26} />
        </div>
      );
    }

    if (subject === "NO_STOCK") {
      return (
        <div className="icon-circle bg-danger-subtle text-danger pulse">
          <PackageX size={24} />
        </div>
      );
    }

    if (subject === "EXP") {
      return (
        <div className="icon-circle bg-warning-subtle text-warning">
          <AlertTriangle size={22} />
        </div>
      );
    }

    if (subject === "STOCK") {
      return (
        <div className="icon-circle bg-primary-subtle text-primary">
          <Package size={20} />
        </div>
      );
    }

    return null;
  }


  function getBorderColor(subject) {
    if (subject === "EXPIRED") return "border-danger border-2";
    if (subject === "NO_STOCK") return "border-danger";
    if (subject === "EXP") return "border-warning";
    if (subject === "STOCK") return "border-primary";
    return "border-secondary";
  }

  if (loading) return <Spinner animation="border" size="sm" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="notifications-container">
      {/* Header sticky */}
      <div className="notifications-header">
        <h5 className="mb-0">Notificaciones</h5>
  
        <div className="d-flex gap-1">
          <button
            className={`btn btn-sm tab-btn ${
              activeTab === "unseen" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("unseen")}
          >
            Nuevas
          </button>
  
          <button
            className={`btn btn-sm tab-btn ${
              activeTab === "seen" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("seen")}
          >
            Vistas
          </button>
        </div>
      </div>
  
      {/* Content */}
      <div className="scrollable-card-body">
        <div className="notifications-content">
          {notifications.length === 0 ? (
            <p className="text-muted text-center mt-2">
              {activeTab === "unseen"
                ? "No hay notificaciones nuevas"
                : "No hay notificaciones vistas recientes"}
            </p>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`mt-2 notification-card border ${getBorderColor(
                  notification.subject
                )}`}
              >
                <div className="d-flex align-items-start gap-3">
                  <div className="icon-box">
                    {getIcon(notification.subject)}
                  </div>
  
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{notification.name}</div>
  
                    <div className="small text-muted">
                      {notification.text}
                    </div>
  
                    {notification.created_at && (
                      <div className="small text-muted mt-1">
                        <span className="fst-italic">
                          {activeTab === "seen" ? "Emitida el " : "Emitida el "}
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
  
                  {activeTab === "unseen" && (
                    <button
                      className="btn btn-sm btn-link text-muted p-0"
                      onClick={() => handleMarkAsSeen(notification.id)}
                      title="Marcar como vista"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}