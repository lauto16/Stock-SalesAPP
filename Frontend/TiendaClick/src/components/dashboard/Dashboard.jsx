import React from "react";
import SalesChart from './SalesChart.jsx'
import ActionBox from './ActionBox.jsx'
import DashboardHeader from './DashboardHeader.jsx';
import SideBar from '../sideNav/SideBar.jsx';
import Footer from '../footer/Footer.jsx';
import Nav from "../sideNav/Nav.jsx";
function Dashboard() {

    return (
        <>
            <div className="d-flex dashboard" >
                <SideBar />

                <main className="flex-grow-1 p-3">
                    <Nav />
                    <DashboardHeader />

                    <section className="app-content container-fluid">
                        <div className="row">
                            <ActionBox name="New Orders" number="150" url="#" cardClass="text-bg-success" svgName="cart" linkTxt="moreInfo" />
                            <ActionBox name="Bounce Rate" number="53" url="#" cardClass="text-bg-success" svgName="bars" linkTxt="moreInfo" />
                            <ActionBox name="User Registrations" number="44" url="#" cardClass="text-bg-danger" svgName="new-person" linkTxt="moreInfo" />
                            <ActionBox name="new-person" number="150" url="#" cardClass="text-bg-danger" svgName="cake-graph" linkTxt="moreInfo" />
                        </div>

                        <div className="row">
                            <div className="card">
                                <div className="card-header"> <h4> Ventas</h4></div>
                                <SalesChart />
                            </div>


                        </div>
                    </section>

                </main>
            </div>
            <Footer />

        </>
    )
}

export default Dashboard;