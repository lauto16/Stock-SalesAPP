import React from 'react';
import NavLink from './NavLink.jsx'
import SideBarBrand from './SideBarBrand.jsx';
function SideBar() {
    return (

        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            {/* ACA IRIA EL NOMBRE DE LA APP desde otro component*/}
            <SideBarBrand />


            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="navigation" aria-label="Main navigation" data-accordion="false" id="navigation">


                        <NavLink name={"Panel Administrativo"}></NavLink>
                        <NavLink name={"Estadísticas"}></NavLink>
                        <NavLink name={"Ventas"}></NavLink>
                        <NavLink name={"Inventario"} url={"/inventory/"}></NavLink>
                        {/* Titulo */}
                        <li className="nav-header">DESCARGAR DOCUMENTOS</li>
                        <NavLink name={"Informe de Ventas"}></NavLink>

                    </ul>
                </nav>
            </div>
        </aside>
    );
}
export default SideBar; 