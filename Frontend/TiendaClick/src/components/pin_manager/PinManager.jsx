import { useState, useRef, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { usePin } from "../../context/PinContext";
import { useNotifications } from '../../context/NotificationSystem';
import { Card } from "react-bootstrap";
import SideBarBrand from "../sideNav/SideBarBrand"

export default function PinManager() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);
  const { verifyAndSavePin } = usePin();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { addNotification } = useNotifications();

  // this dict is used to detect have something to show in the return in case user is not logued until the useEffect runs.
  const safeUser = {
    username: user?.username || "",
    role: user?.role || "",
    avatar: user?.avatar || "",
  };

  const getRedirectPathByRole = (role) => {
    switch (role) {
      case "Repositor":
        return "/inventory";
      case "Administrador":
        return "/dashboard";
      case "Vendedor":
        return "/sales";
      case "Vendedor y Repositor":
        return "/sales"
      default:
        return "/";
    }
  };

  const roleAvatar = {
    "Administrador": "bi-person-circle text-primary",
    "Repositor": "bi-box-seam text-warning",
    "Vendedor": "bi-cash-stack text-success",
    "Vendedor y Repositor": "bi-cash-coin text-success",
  };

  const handleVerify = async (fullPin) => {
    const success = await verifyAndSavePin(fullPin);
    if (success) {
      const redirectTo = getRedirectPathByRole(user.role);
      navigate(redirectTo);
      return;
    }
    addNotification("error", "Pin incorrecto.");

    setPin(["", "", "", ""]);
    inputsRef.current[0]?.focus();
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputsRef.current[index + 1].focus();
    }

    if (newPin.every((digit) => digit !== "")) {
      const fullPin = newPin.join("");
      handleVerify(fullPin);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    if (!user) {
      handleLogout()
    }
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="auth-page">
      <Card className="auth-card" style={{ minHeight: "340px" }}>
        <Card.Header className="auth-card-header">
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              padding: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "10px",
              lineHeight: 1,
              color: 'red'
            }}
          >
            <i className="bi bi-x" style={{ fontSize: "18px" }}></i>
          </button>
          <SideBarBrand />
        </Card.Header>
        <Card.Body className="auth-card-body" style={{ textAlign: "center", position: "relative" }}>
          <i
            className={`bi ${roleAvatar[safeUser.role] || "bi-person"} fs-1`}
            style={{
              fontSize: "64px",
              marginBottom: "10px",
            }}
          ></i>

          <h2 style={styles.name}>{safeUser.username}</h2>
          <p style={styles.text}>Ingresa tu PIN</p>
          <div style={styles.inputContainer}>
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="password"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                style={{
                  ...styles.input,
                  borderColor: digit ? "#f5c193" : "#d4d4d4",
                }}
              />
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

const styles = {
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    margin: 5,
    color: "#1c1c1c",
  },
  text: {
    fontSize: 12,
    color: "#9b9b9bff",
    marginBottom: 20,
  },
  inputContainer: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },
  input: {
    width: 50,
    height: 60,
    fontSize: 32,
    textAlign: "center",
    borderRadius: 8,
    border: "2px solid",
    backgroundColor: "#ffffff",
    color: "#1c1c1c",
    outline: "none",
  },
};