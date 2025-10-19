import { useState, useEffect } from "react";
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import "../../css/auth.css";
import { useNotifications } from "../../context/NotificationSystem";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import SideBar from "../sideNav/SideBar";
import SideBarBrand from "../sideNav/SideBarBrand";
import DashboardHeader from "../dashboard/DashboardHeader";
import ConfirmationModal from "../crud/ConfirmationModal";
import { getAllUsers, deleteUser } from "../../services/axios.services";
import RequirePermission from "../permissions_manager/PermissionVerifier.jsx";
import { FaLock } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";

export default function DeleteUser() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 850);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    const { user } = useUser();

    const roleAvatar = {
        "Administrador": "bi-person-circle text-primary",
        "Repositor": "bi-box-seam text-warning",
        "Vendedor": "bi-cash-stack text-success",
        "Vendedor y Repositor": "bi-cash-coin text-success",
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const result = await getAllUsers(user.token);
            setLoading(false);

            if (!result.success) {
                addNotification("error", "No se pudieron obtener los usuarios");
            } else {
                setUsers(result.data || []);
            }
        };

        fetchUsers();
    }, [user.token, addNotification]);

    useEffect(() => {
        const handleResize = () => setShowSidebar(window.innerWidth >= 850);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteUser(selectedUser.id, user.token);
        setIsDeleting(false);
        setShowConfirmModal(false);

        if (!result.success) {
            addNotification("error", result.message || "No se pudo eliminar el usuario");
        } else {
            addNotification("success", "Usuario eliminado correctamente");
            setUsers(users.filter((u) => u.id !== selectedUser.id));
            setSelectedUser(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedUser) {
            addNotification("error", "Seleccioná un usuario para eliminar");
            return;
        }

        setShowConfirmModal(true);
    };

    return (
        <RequirePermission permission="access_dashboard">
            <div className={`app-wrapper ${!showSidebar ? "no-sidebar" : ""}`}>
                <div className="header-container text-center mt-2">
                    <DashboardHeader title={"ELIMINAR USUARIO"} isDashboard={false} />
                </div>

                {showSidebar && <SideBar />}
                <main className="flex-grow-1 content">
                    <section className="app-content container-fluid d-flex justify-content-center align-items-center flex-column">
                        <Card className="auth-card" style={{ maxWidth: "450px", width: "100%" }}>
                            <Card.Header className="auth-card-header text-center">
                                <SideBarBrand />
                            </Card.Header>

                            <Card.Body className="auth-card-body">
                                {loading ? (
                                    <p className="text-center">Cargando usuarios...</p>
                                ) : (
                                    <Form onSubmit={handleSubmit}>

                                        <Dropdown className="mb-3">
                                            <Dropdown.Toggle className="w-100" variant="light">
                                                {selectedUser ? `${selectedUser.username} (${selectedUser.role})` : "Elegí un usuario"}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="w-100">
                                                {users.map((u) => {
                                                    const disabled = u.username === user.username;
                                                    return (
                                                        <Dropdown.Item
                                                            key={u.id}
                                                            onClick={() => !disabled && setSelectedUser(u)}
                                                            className={`${disabled ? "text-secondary" : ""}`}
                                                            style={{
                                                                color: disabled ? "#6c757d" : undefined,
                                                                backgroundColor: disabled ? "#d9d9d9" : undefined,
                                                            }}
                                                            disabled={disabled}
                                                        >
                                                            {u.username} ({u.role}) {disabled && <FaLock className="ms-2" />}
                                                        </Dropdown.Item>
                                                    );
                                                })}
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        {selectedUser && (
                                            <div className="text-center mt-3">
                                                <i
                                                    className={`bi ${roleAvatar[selectedUser.role] || "bi-person"
                                                        } fs-1`}
                                                ></i>
                                                <p className="mt-2 mb-0 fw-bold">{selectedUser.username}</p>
                                                <p className="text-muted" style={{ fontSize: "0.9em" }}>
                                                    {selectedUser.role}
                                                </p>
                                            </div>
                                        )}

                                        <div className="d-grid">
                                            <Button
                                                type="submit"
                                                className="mt-3 send-form-button btn btn-danger"
                                                disabled={loading || !users.length}
                                            >
                                                Eliminar usuario
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </section>
                </main>

                <ConfirmationModal
                    show={showConfirmModal}
                    handleClose={() => setShowConfirmModal(false)}
                    title="Confirmar eliminación"
                    message={`¿Seguro que querés eliminar al usuario "${selectedUser?.username}"?\nEsta acción no se puede deshacer.`}
                    onSendForm={handleDelete}
                    isSending={isDeleting}
                />
            </div>
        </RequirePermission >
    );
}