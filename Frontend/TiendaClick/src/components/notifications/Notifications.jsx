import { useEffect, useState } from "react";
import { fetchNotifications, markNotificationAsSeen } from "../../services/axios.services";
import { useUser } from "../../context/UserContext";
import { Alert, Spinner } from "react-bootstrap";
import { Package, AlertTriangle, X } from "lucide-react";

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      setError("");

      const res = await fetchNotifications(user.token);

      if (!res.success) {
        setError("No se pudieron cargar las notificaciones");
      } else {
        setNotifications(res.data || []);
      }

      setLoading(false);
    }

    loadNotifications();
  }, [user.token]);

  async function handleMarkAsSeen(id) {
    const res = await markNotificationAsSeen(id, user.token);

    if (res.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  }

  function getIcon(subject) {
    if (subject === "STOCK") {
      return <Package size={20} className="text-primary" />;
    }
    if (subject === "EXP") {
      return <AlertTriangle size={20} className="text-warning" />;
    }
    return null;
  }

  function getBorderColor(subject) {
    if (subject === "STOCK") return "border-primary";
    if (subject === "EXP") return "border-warning";
    return "border-secondary";
  }

  if (loading) return <Spinner animation="border" size="sm" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  if (notifications.length === 0) {
    return <p className="text-muted text-center">No hay notificaciones nuevas</p>;
  }

  return (
    <div className="d-flex flex-column gap-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification-card border ${getBorderColor(notification.subject)}`}
        >
          <div className="d-flex align-items-start gap-3">
            <div className="icon-box">
              {getIcon(notification.subject)}
            </div>

            <div className="flex-grow-1">
              <div className="fw-semibold">{notification.name}</div>
              <div className="small text-muted">{notification.text}</div>
            </div>

            <button
              className="btn btn-sm btn-link text-muted p-0"
              onClick={() => handleMarkAsSeen(notification.id)}
              title="Eliminar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}