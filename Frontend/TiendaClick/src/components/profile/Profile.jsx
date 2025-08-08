import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';
import ConfirmationModal from '../crud/ConfirmationModal.jsx';
import { logoutUser } from '../../services/axios.services.js';

function Profile() {
    const { user } = useUser();
    const avatar = "/7979300.webp";
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShowModal(false);
    const handleOpen = () => setShowModal(true);
    const { logout } = useUser();

    const confirmLogout = async () => {
        setShowModal(false);
        try {
            logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.warn("Error cerrando sesión en backend", error);
        }
    };

    return (
        <>
            <li className="nav-item dropdown user-menu">
                <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                    <img src={avatar} className="user-image rounded-circle shadow" alt="User" />
                    <span className="d-none d-md-inline">{user.name}</span>
                </a>

                <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                    <li className="user-header text-bg-primary">
                        <img src={avatar} className="rounded-circle shadow" alt="User" />
                        <p>{user.name} - {user.role}</p>
                    </li>
                    <li className="user-body px-3 pb-3 d-flex justify-content-between">
                        <a href="#" className="btn btn-default btn-flat">Profile</a>
                        <button
                            className="btn btn-danger btn-flat"
                            onClick={handleOpen}
                            style={{marginLeft:"50px"}}
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