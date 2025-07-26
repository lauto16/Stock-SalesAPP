import React from 'react';
import Profile from '../profile/Profile.jsx';
function Nav() {

    return (
        <nav className="app-header navbar navbar-expand bg-body" id="navigation" tabIndex={-1}>
            <div className="container-fluid">

                <ul className="navbar-nav ms-auto" role="navigation" aria-label="Navigation 2">
                    <Profile></Profile>
                </ul>
            </div>
        </nav>

    );
}
export default Nav