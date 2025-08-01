import React, { useState } from "react";
import TitleDropdown from "../global/TitleDropdown";

function DashboardHeader() {
  const [title, setTitle] = useState("Dashboard");

  return (
    <header className="app-content-header">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6 mb-3">
            <TitleDropdown currentTitle={title} setTitle={setTitle} />
          </div>
          <div className="col-sm-6">
            <ol className="breadcrumb float-sm-end">
              <li className="breadcrumb-item">
                <a href="#">Home</a>
              </li>
              <li className="breadcrumb-item active">Dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </header>
  );
}
export default DashboardHeader;
