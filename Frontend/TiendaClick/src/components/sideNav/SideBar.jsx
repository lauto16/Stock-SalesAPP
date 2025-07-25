import React from 'react';
import NavLink from './NavLink.jsx'

function SideBar() {
    return (

        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            {/* ACA IRIA EL NOMBRE DE LA APP desde otro component*/}

            <div className="sidebar-brand">
                <a href="../index.html" className="brand-link">
                    <img src="../assets/img/AdminLTELogo.png" alt="AdminLTE Logo" className="brand-image opacity-75 shadow" />
                    <span className="brand-text fw-light">TiendaClick</span>
                </a>
            </div>


            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="navigation" aria-label="Main navigation" data-accordion="false" id="navigation">


                        <NavLink name={"Panel Administrativo"}></NavLink>
                        <NavLink name={"Estadísticas"}></NavLink>
                        <NavLink name={"Ventas"}></NavLink>
                        <NavLink name={"Inventario"} url={"inventory"}></NavLink>
                        {/* Titulo */}
                        <li class="nav-header">DESCARGAR DOCUMENTOS</li>
                        <NavLink name={"Informe de Ventas"}></NavLink>

                    </ul>
                </nav>
            </div>
        </aside>
    );
}
export default SideBar; 