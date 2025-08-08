import React, { useState } from "react";
import TitleDropdown from "../global/TitleDropdown";

function DashboardHeader() {
  const [title, setTitle] = useState("Dashboard");

  return (
    <header className="app-content-header">
      <div className="container-fluid">
        <div className="row mb-3">
            <TitleDropdown currentTitle={title} setTitle={setTitle} />
        </div>
      </div>
    </header>
  );
}
export default DashboardHeader;
