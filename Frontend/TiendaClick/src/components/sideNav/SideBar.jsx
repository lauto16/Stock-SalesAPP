import React, { useState } from 'react';
import SideBarBrand from './SideBarBrand.jsx';
import ConfirmationModal from '../crud/ConfirmationModal.jsx'
import NavLink from './NavLink'
import DownloadButton from './DownloadButton.jsx';
import {
    fetchSalesDownloadExcel, fetchProductsDownloadExcel,
    fetchStatsDownloadExcel
} from '../../services/forms.services.js';
import { useUser } from '../../context/UserContext';

function SideBar({ onLogout }) {
    const [showModal, setShowModal] = useState(false);
    const { user } = useUser();
    const token = user?.token;
    const handleClose = () => setShowModal(false);
    const confirmLogout = () => {
        setShowModal(false);
        onLogout?.();
    };

    return (
        <>
            <aside style={{overflow: 'auto'}} className="app-sidebar bg-body-secondary shadow d-flex flex-column justify-content-between" data-bs-theme="dark">
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
                                <DownloadButton onClick={() => fetchSalesDownloadExcel(token)} name="Excel de Ventas" />
                                <DownloadButton onClick={() => fetchProductsDownloadExcel(token)} name="Excel de Inventario" />
                                <DownloadButton onClick={() => fetchStatsDownloadExcel(token)} name="Excel de Estadisticas" />

                                <li className="nav-header">USUARIOS</li>
                                <NavLink name="Crear nuevo usuario" url="/sign-up" />
                                <NavLink name="Eliminar usuarios" url="/delete-user" />
                                <NavLink name="Configuración" url="/config-app" />
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