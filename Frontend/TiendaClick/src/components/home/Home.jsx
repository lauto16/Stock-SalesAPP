import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="container py-5">
            <h1 className="mb-4">Bienvenido a la Home</h1>
            <p className="lead">Esta es la página principal de tu aplicación.</p>

            <div className="mt-4">
                <Link to="/dashboard" className="btn btn-primary">
                    Ir al Dashboard
                </Link>
            </div>
        </div>
    );
}

export default Home;
