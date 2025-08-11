import { useState, useEffect } from "react";
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import "../../css/auth.css";
import { useNotifications } from "../../context/NotificationSystem";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import SideBar from "../sideNav/SideBar";
import SideBarBrand from "../sideNav/SideBarBrand";
import DashboardHeader from "../dashboard/DashboardHeader"
import { signupUser } from "../../services/axios.services"


export default function SignUp() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [rol, setRol] = useState("Vendedor");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 850);

    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    const { user } = useUser();

    const roleMap = {
        "Administrador": "administrator",
        "Repositor": "stocker",
        "Vendedor": "salesperson",
        "Vendedor y Repositor": "salesperson_stocker"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (pin.length !== 4 || isNaN(pin)) {
            addNotification("error", "El PIN debe tener exactamente 4 dígitos numéricos");
            return;
        }

        setLoading(true);

        const result = await signupUser(
            {
                username: username,
                password: password,
                pin: pin,
                role: roleMap[rol]
            },
            user.token
        );

        setLoading(false);

        if (!result.success) {
            addNotification("error", result.message || "No se pudo crear el usuario");
        } else {
            addNotification("success", "Usuario creado correctamente");
            navigate("/dashboard");
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setShowSidebar(window.innerWidth >= 850);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={`app-wrapper ${!showSidebar ? "no-sidebar" : ""}`}>
            {/* Contenedor del header */}
            <div className="header-container text-center mt-2">
                <DashboardHeader title={"CREAR NUEVO USUARIO"} isDashboard={false} />
            </div>

            {showSidebar && <SideBar />}

            {/* Contenido */}
            <main className="flex-grow-1 content">
                <section className="app-content container-fluid d-flex justify-content-center align-items-center flex-column">
                    <Card className="auth-card" style={{ maxWidth: "450px", width: "100%" }}>
                        <Card.Header className="auth-card-header text-center">
                            <SideBarBrand />
                        </Card.Header>
                        <Card.Body className="auth-card-body">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formNombre">
                                    <Form.Label>Nombre de usuario</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingresá el nombre"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Contraseña</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Ingresá la contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                            type="button"
                                        >
                                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPin">
                                    <Form.Label>PIN (4 dígitos)</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showPin ? "text" : "password"}
                                            placeholder="1234"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            required
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPin(!showPin)}
                                            type="button"
                                        >
                                            <i className={`bi ${showPin ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formRol">
                                    <Form.Label>Rol</Form.Label>
                                    <Form.Select value={rol} onChange={(e) => setRol(e.target.value)}>
                                        <option value="Vendedor">Vendedor</option>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Repositor">Repositor</option>
                                        <option value="Vendedor y Repositor">Vendedor y Repositor</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-grid">
                                    <Button
                                        type="submit"
                                        className="mt-2 send-form-button btn btn-success"
                                        disabled={loading}
                                    >
                                        {loading ? "Creando usuario..." : "Registrarse"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </section>
            </main>
        </div>
    );
}