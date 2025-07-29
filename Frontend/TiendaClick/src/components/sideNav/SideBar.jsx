import React from 'react';
import NavLink from './NavLink.jsx'
import SideBarBrand from './SideBarBrand.jsx';
function SideBar() {
    return (

        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            {/* sidebar brand from another component */}
            <SideBarBrand />


            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="navigation" aria-label="Main navigation" data-accordion="false" id="navigation">
                        {/* Headline */}
                        <li className="nav-header">MENÚ PRINCIPAL</li>

                        <NavLink name={"Panel Administrativo"}></NavLink>
                        <NavLink name={"Proveedores"} url={"/providers"}></NavLink>
                        <NavLink name={"Ventas"}></NavLink>
                        <NavLink name={"Inventario"} url={"/inventory"}></NavLink>
                        {/* Headline */}
                        <li className="nav-header">DESCARGAR DOCUMENTOS</li>
                        <NavLink name={"Informe de Ventas"}></NavLink>

                    </ul>
                </nav>
            </div>
        </aside>
    );
}
export default SideBar; 