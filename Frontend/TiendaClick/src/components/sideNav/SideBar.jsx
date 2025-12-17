import React, { useState } from 'react';
import SideBarBrand from './SideBarBrand.jsx';
import ConfirmationModal from '../crud/ConfirmationModal.jsx'
import NavLink from './NavLink'
import { Button } from 'react-bootstrap';
import { fetchSalesDownloadExcel } from '../../services/forms.services.js';

function SideBar({ onLogout }) {
    const [showModal, setShowModal] = useState(false);
    const token = localStorage.getItem('token');
    const handleClose = () => setShowModal(false);
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
                                <NavLink name="Cambios en productos" url="/product-blame" />
                                <NavLink name="Estadisticas" url="/stats/" />
                                <NavLink name="Proveedores" url="/providers" />
                                <NavLink name="Categorias" url="/categories" />
                                <NavLink name="Inventario" url="/inventory" />
                                <NavLink name="Ventas" url="/sales" />


                                <li className="nav-header">DESCARGAR DOCUMENTOS</li>
                                <Button onClick={() => fetchSalesDownloadExcel(token)}>Informe de Ventas</Button>
                                <li className="nav-header">USUARIOS</li>
                                <NavLink name="Crear nuevo usuario" url="/sign-up" />
                                <NavLink name="Eliminar usuarios" url="/delete-user" />
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