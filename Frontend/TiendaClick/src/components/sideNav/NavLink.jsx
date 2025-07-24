import React from 'react';
import { Link } from 'react-router'
function SideBar({ name, url }) {
    //if url is "", gets transformed to "/"
    const urlPath = url || "/"
    return (
        <li className="nav-item">

            <Link className="nav-link"
                to={{
                    pathname: { urlPath },
                    search: "?query=string",
                    hash: "#hash",
                }}>
                <i className="nav-icon bi bi-circle" />
                <p>{name}</p>

            </Link>

        </li>
    );
}
export default SideBar; 