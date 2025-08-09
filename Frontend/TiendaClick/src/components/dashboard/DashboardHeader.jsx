import React, { useState } from "react";
import TitleDropdown from "../global/TitleDropdown";

function DashboardHeader({ title, isDashboard }) {
  const [title_in, setTitleIn] = useState(title)
  return (
    <header className="app-content-header">
      <div className="container-fluid">
        <div className="row">
          <TitleDropdown currentTitle={title_in} setTitle={setTitleIn} isDashboard={isDashboard} />
        </div>
      </div>
    </header>
  );
}
export default DashboardHeader;
