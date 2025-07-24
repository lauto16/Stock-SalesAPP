import React from 'react';
function SideBar({ name }) {
    return (
        <li className="nav-item">
            <a href="../index2.html" className="nav-link">
                <i className="nav-icon bi bi-circle" />
                <p>{name}</p>
            </a>
        </li>
    );
}
export default SideBar; 