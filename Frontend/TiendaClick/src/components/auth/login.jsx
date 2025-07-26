import React from "react";
function Login() {
    return (
        <>
            {/* Estilos externos */}
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.0.12/index.css"
                integrity="sha256-tXJfXfp6Ewt1ilPzLDtQnJV4hclT9XuaZUKyUvmyr+Q="
                crossOrigin="anonymous"
                media="print"
                onLoad="this.media='all'"
            />
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/overlayscrollbars@2.11.0/styles/overlayscrollbars.min.css"
                crossOrigin="anonymous"
            />
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
                crossOrigin="anonymous"
            />

            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="card shadow" style={{ width: "100%", maxWidth: "380px" }}>
                    <div className="card-body">
                        <h2 className="text-center mb-4">
                            <b>Tienda</b>Click
                        </h2>
                        <p className="text-center text-muted mb-4">Iniciar sesion para acceder al contenido!</p>

                        <form action="../index3.html" method="post">
                            <div className="input-group mb-3">
                                <input type="email" className="form-control" placeholder="Email" required />
                                <span className="input-group-text">
                                    <i className="bi bi-envelope" />
                                </span>
                            </div>

                            <div className="input-group mb-4">
                                <input type="password" className="form-control" placeholder="Contraseña" required />
                                <span className="input-group-text">
                                    <i className="bi bi-lock-fill" />
                                </span>
                            </div>

                            <div className="d-grid">
                                <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>


    )
}
export default Login