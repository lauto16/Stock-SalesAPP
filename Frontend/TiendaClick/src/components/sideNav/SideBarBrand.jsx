import React from 'react';
import { Link } from 'react-router'
function SideBarBrand() {
    return (

        <div className="sidebar-brand">
            <Link className="nav-link"
                to={{
                    pathname: "/",
                    search: "?query=string",
                    hash: "#hash",
                }}>
                <img src="/logo.webp" alt="TiendaClick" className="brand-image " />

            </Link>
            <Link className="nav-link"
                to={{
                    pathname: "/",
                    search: "?query=string",
                    hash: "#hash",
                }}>
                <span className="brand-text fw-light ">TiendaClick</span>

            </Link>

        </div>

    );
}
export default SideBarBrand; 