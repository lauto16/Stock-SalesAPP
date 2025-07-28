import { useState, useEffect, useRef, use } from "react";
import { Link } from "react-router-dom";
import SalesChart from './SalesChart.jsx'
import ActionBox from './ActionBox.jsx'
import DashboardHeader from './DashboardHeader.jsx';
import SideBar from '../sideNav/SideBar.jsx';
import Footer from '../footer/Footer.jsx';
import Nav from "../sideNav/Nav.jsx";
import Table from "../inventory/Table.jsx";
import { fetchLowStock } from "../../services/axios.services.js";
import '../../css/dashboard.css';

function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [amount, setAmount] = useState(5); // show from 5 units of products with low stock
    const inputRef = useRef(null);
    const columns = [
        { className: "code", key: "code", label: 'Código' },
        { className: "name", key: "name", label: 'Nombre' },
        { className: "sell-price", key: "sell_price", label: 'Precio Venta' },
        { className: "stock", key: "stock", label: 'Stock' },
    ];
    useEffect(() => {
        const get_products = async () => {
            const data = await fetchLowStock({ setLoading, amount })
            setProducts(data);
            console.log("Productos con bajo stock:", data);
        }
        get_products()
    }, [amount])


    const handleButtonClick = () => {
        const value_input = inputRef.current?.value;
        const newValue = parseInt(value_input, 10);
        if (!isNaN(newValue) && newValue >= 0) {
            setAmount(newValue);
        }
    };
    return (
        <>
            <div className="app-wrapper">
                <Nav />

                <SideBar />

                <main className="flex-grow-1 p-3 content">
                    <DashboardHeader />

                    <section className="app-content container-fluid  mb-4">
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
                            <div className="card">
                                <div className="card-header stock-header">
                                    <Link to={"/inventory/"} className="text-decoration-none"><h5>Stock Faltante</h5></Link>

                                    <div className="input-group w-auto">
                                        <span className="input-group-text user-select-none">Stock menor que</span>
                                        <input
                                            type="number"
                                            min="1"
                                            defaultValue={amount}
                                            className="form-control"
                                            ref={inputRef}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleButtonClick();
                                            }}
                                        />
                                        <button
                                            className="btn btn-outline-success"
                                            onClick={handleButtonClick}
                                            type="button"
                                        >
                                            Buscar
                                        </button>
                                    </div>
                                </div>
                                <div className="scrollable-card-body">
                                    <Table items={products} loading={loading} columns={columns} />
                                </div>
                            </div>
                        </div>
                    </section>

                </main>

                <Footer />
            </div>
        </>
    )
}

export default Dashboard;