import { useState, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import "../../css/auth.css";
import { useNotifications } from '../../context/NotificationSystem';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import SideBarBrand from "../sideNav/SideBarBrand"


export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    const { login, user } = useUser();

    const getRedirectPathByRole = (role) => {

        if (user.askForPin){
            return '/pin-manager'
        }
        
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login({ username, password });
        setLoading(false);

        if (!result.success) {
            addNotification("error", "Credenciales incorrectas");
        }
    };

    useEffect(() => {
        if (user) {
            const redirectTo = getRedirectPathByRole(user.role);
            navigate(redirectTo);
        }
    }, [user, navigate]);

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <Card.Header className="auth-card-header">
                <SideBarBrand />
                </Card.Header>
                <Card.Body className="auth-card-body">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formUsername">
                            <Form.Label>Nombre de usuario</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingresá tu nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Ingresá tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <div className="d-grid">
                            <Button
                                type="submit"
                                className="mt-2 send-form-button btn btn-success"
                                disabled={loading}
                            >
                                {loading ? "Cargando..." : "Iniciar sesión"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}