import React from "react";
import SalesChart from './SalesChart.jsx'
import ActionBox from './ActionBox.jsx'
function Dashboard() {
    return (
        <div>
            <div className="app-wrapper">
                {/* <topbar path="{path}"> */}
                {/* <sidenav path="{path}" mainpage="{mainPage}" page="{page}"> */}
                <main className="app-main">
                    <div className="app-content-header">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-6">
                                    <h3 className="mb-0">Dashboard</h3>
                                </div>
                                <div className="col-sm-6">
                                    <ol className="breadcrumb float-sm-end">
                                        <li className="breadcrumb-item"><a href="#">Home</a></li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                            Dashboard
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="app-content">
                        <div className="container-fluid">
                            <div className="row">
                                <ActionBox name="New Orders" number="150" url="#" cardClass={"text-bg-success"} svgName={"cart"} linkTxt={"moreInfo"} />

                                <ActionBox name="Bounce Rate" number="53" url="#" cardClass={"text-bg-success"} svgName={"bars"} linkTxt={"moreInfo"} />

                                <ActionBox name="User Registrations" number="44" url="#" cardClass={"text-bg-danger"} svgName={"new-person"} linkTxt={"moreInfo"} />

                                <ActionBox name="new-person" number="150" url="#" cardClass={"text-bg-danger"} svgName={"cake-graph"} linkTxt={"moreInfo"} />

                            </div>
                            <div className="row">
                                <div className="col-lg-7 connectedSortable">
                                    <div className="card mb-4">
                                        <div className="card-header">
                                            <h3 className="card-title">Sales Value</h3>
                                            <SalesChart />
                                        </div>
                                        <div className="card-body">
                                            <div id="revenue-chart" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                {/* <footer></footer> */}
                {/* </sidenav> */}
                {/* </topbar> */}
            </div>
        </div>)
}
export default Dashboard;