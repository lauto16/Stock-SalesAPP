import React from 'react';
import { Link } from 'react-router'
function NavLink({ name, url = "" }) {
    //if url is "", gets transformed to "/"
    return (
        <li className="nav-item">

            <Link className="nav-link"
                to={{
                    pathname: url,
                    search: "?query=string",
                    hash: "#hash",
                }}>
                <i className="nav-icon bi bi-circle" />
                <p>{name}</p>

            </Link>

        </li>
    );
}
export default NavLink; 