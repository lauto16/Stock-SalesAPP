import { useState, useRef, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { usePin } from "../../context/PinContext";
import { useNotifications } from '../../context/NotificationSystem';

export default function PinManager() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);
  const { verifyAndSavePin } = usePin();
  const navigate = useNavigate();
  const {user} = useUser()
  const { addNotification } = useNotifications();

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

//TODO: AGREGAR UN BOTON DE VOLVER 

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

  useEffect(() => {
  inputsRef.current[0]?.focus();
}, []);

  return (
    <div style={styles.container}>
      <img src="/7979300.webp" alt="Avatar" style={styles.avatar} />
      <h2 style={styles.name}>PIN</h2>
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
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#ffffff",
    color: "#1c1c1c",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
  },
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
    fontSize: 18,
    color: "#9b9b9bff",
    marginBottom: 20,
  },
  inputContainer: {
    display: "flex",
    gap: 10,
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
