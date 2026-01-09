import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';
import ConfirmationModal from '../crud/ConfirmationModal.jsx';

function Profile() {
    const { user, logout } = useUser();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const roleAvatar = {
        "Administrador": "bi-person-circle text-primary",
        "Repositor": "bi-box-seam text-warning",
        "Vendedor": "bi-cash-stack text-success",
        "Vendedor y Repositor": "bi-cash-coin text-success",
    };

    const handleClose = () => setShowModal(false);
    const handleOpen = () => setShowModal(true);

    const confirmLogout = async () => {
        setShowModal(false);
        try {
            logout();
            navigate("/login", { replace: true });
        } catch (error) { }
    };

    return (
        <>
            <li className="nav-item dropdown user-menu">
                <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                    <i
                        className={`bi ${roleAvatar[user.role] || "bi-person"} fs-4 me-2`}
                        style={{ fontSize: "22px" }}
                    ></i>
                    <span className="d-none d-md-inline">{user.name}</span>
                </a>

                <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                    <li
                        className="user-header text-center py-4"
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        <i
                            className={`bi ${roleAvatar[user.role] || "bi-person"} fs-1`}
                            style={{ fontSize: "64px" }}
                        ></i>

                        <p className="mt-2 mb-0 text-dark" style={{ fontWeight: "700" }}>
                            {user.name}
                        </p>

                        <p className="mb-0" style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                            {user.role}
                        </p>

                        <p className="mb-0" style={{ fontSize: "0.85rem", color: "#8a8a8a" }}>
                            @{user.username}
                        </p>
                    </li>

                    <li className="user-body px-3 pb-3 d-flex flex-column gap-2">
                        <button
                            className="btn btn-danger w-100"
                            onClick={handleOpen}
                            style={{
                                fontSize: "0.85rem",
                                padding: "6px 8px",
                            }}
                        >
                            Cerrar sesión
                        </button>
                    </li>
                </ul>
            </li>

            <ConfirmationModal
                show={showModal}
                handleClose={handleClose}
                title="Cerrar sesión"
                message="¿Estás seguro de que querés cerrar sesión?"
                onSendForm={confirmLogout}
            />
        </>
    );
}

export default Profile;