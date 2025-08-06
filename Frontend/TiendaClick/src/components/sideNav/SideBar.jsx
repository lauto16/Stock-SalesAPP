import React, { useState } from 'react';
import SideBarBrand from './SideBarBrand.jsx';
import ConfirmationModal from '../crud/ConfirmationModal.jsx'
import NavLink from './NavLink'

function SideBar({ onLogout }) {
    const [showModal, setShowModal] = useState(false);

    const handleClose = () => setShowModal(false);
    const handleOpen = () => setShowModal(true);
    const confirmLogout = () => {
        setShowModal(false);
        onLogout?.();
    };

    return (
        <>
            <aside className="app-sidebar bg-body-secondary shadow d-flex flex-column justify-content-between" data-bs-theme="dark">
                <div>
                    <SideBarBrand />

                    <div className="sidebar-wrapper">
                        <nav className="mt-2">
                            <ul
                                className="nav sidebar-menu flex-column"
                                data-lte-toggle="treeview"
                                role="navigation"
                                aria-label="Main navigation"
                                data-accordion="false"
                                id="navigation"
                            >
                                <li className="nav-header">MENÚ PRINCIPAL</li>
                                <NavLink name="Panel Administrativo" url="/dashboard" />
                                <NavLink name="Proveedores" url="/providers" />
                                <NavLink name="Ventas" />
                                <NavLink name="Inventario" url="/inventory" />

                                <li className="nav-header">DESCARGAR DOCUMENTOS</li>
                                <NavLink name="Informe de Ventas" />
                            </ul>
                        </nav>
                    </div>
                </div>

            </aside>

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

export default SideBar;