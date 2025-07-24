import React from 'react';
function DashboardHeader() {
    return (
        <header className="app-content-header">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-6">
                        <h3 className="mb-0">Dashboard</h3>
                    </div>
                    <div className="col-sm-6">
                        <ol className="breadcrumb float-sm-end">
                            <li className="breadcrumb-item"><a href="#">Home</a></li>
                            <li className="breadcrumb-item active">Dashboard</li>
                        </ol>
                    </div>
                </div>
            </div>
        </header>
    )
}
export default DashboardHeader;