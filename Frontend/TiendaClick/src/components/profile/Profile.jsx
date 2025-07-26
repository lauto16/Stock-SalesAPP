import React from 'react';
import { useUser } from '../../context/UserContext.jsx';
function Profile() {
    const { user } = useUser();
    const avatar = "/7979300.webp"
    return (
        <li className="nav-item dropdown user-menu">

            <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                <img src={avatar} className="user-image rounded-circle shadow" alt="User Image" />
                <span className="d-none d-md-inline">{user.name}</span>
            </a>

            <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                <li className="user-header text-bg-primary">
                    <img src={avatar} className="rounded-circle shadow" alt="User Image" />
                    <p>
                        {user.name} - {user.role}
                    </p>
                </li>
                <li className="user-body">
                    <a href="#" className="btn btn-default btn-flat">Profile</a>
                    <button href="#" className="btn btn-default btn-flat float-end btn-danger">Sign out</button>
                </li>
            </ul>

        </li>

    );
}
export default Profile