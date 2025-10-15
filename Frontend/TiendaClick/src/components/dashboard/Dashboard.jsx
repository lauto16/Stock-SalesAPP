import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SalesChart from "./SalesChart.jsx";
import ActionBox from "./ActionBox.jsx";
import DashboardHeader from "./DashboardHeader.jsx";
import SideBar from "../sideNav/SideBar.jsx";
import Nav from "../sideNav/Nav.jsx";
import Table from "../crud/Table.jsx";
import { fetchLowStock, fetchSalesStats, fetchEmployeesStats, fetchProductsStats, } from "../../services/axios.services.js";
import "../../css/dashboard.css";
import { useUser } from '../../context/UserContext.jsx'
import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'


function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [amount, setAmount] = useState(5);
  const inputRef = useRef(null);
  const { user } = useUser()
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 850);
  const [lowStockText, setLowStockText] = useState('Stock menor que')

  const columns = [
    { className: "code", key: "code", label: "Código" },
    { className: "name", key: "name", label: "Nombre" },
    { className: "sell-price", key: "sell_price", label: "Precio Venta" },
    { className: "stock", key: "stock", label: "Stock" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 850);
      if (window.innerWidth <= 500) {
        setLowStockText('Stock <')
      }
      else {
        setLowStockText('Stock menor que')

      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const get_products = async () => {
      const data = await fetchLowStock({ setLoading, amount }, user.token);
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.warn("La respuesta no es un array");
        setProducts([]);
      }
    };

    const get_sales_data_stats = async () => {
      const sales_data_stats = await fetchSalesStats(user.token);
      console.log(sales_data_stats);
    }

    const get_employees_data_stats = async () => {
      const employees_data_stats = await fetchEmployeesStats(user.token);
      console.log(employees_data_stats);
    }

    const get_products_data_stats = async () => {
      const products_data_stats = await fetchProductsStats(user.token);
      console.log(products_data_stats);
    }

    get_products();

    get_sales_data_stats()
    get_employees_data_stats()
    get_products_data_stats()

  }, [amount, user]);

  const handleButtonClick = () => {
    const value_input = inputRef.current?.value;
    const newValue = parseInt(value_input, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      setAmount(newValue);
    }
  };
  return (
    <RequirePermission permission="access_dashboard">
      <>
        <div className="app-wrapper">
          {showSidebar && <Nav />}
          {showSidebar && <SideBar />}
          <main className="flex-grow-1 p-3 content">
            <DashboardHeader title={"DASHBOARD"} isDashboard={true} />

            <section className="app-content container-fluid  mb-4">
              <div className="row mt-2">
                <ActionBox
                  name="Ventas"
                  number="150"
                  url="#"
                  cardClass="text-bg-success"
                  svgName="cart"
                  linkTxt="moreInfo"
                />
                <ActionBox
                  name="Bounce Rate"
                  number="53"
                  url="#"
                  cardClass="text-bg-warning"
                  svgName="bars"
                  linkTxt="moreInfo"
                />
                <ActionBox
                  name="User Registrations"
                  number="44"
                  url="#"
                  cardClass="text-bg-danger"
                  svgName="new-person"
                  linkTxt="moreInfo"
                />
                <ActionBox
                  name="new-person"
                  number="150"
                  url="#"
                  cardClass="text-bg-info"
                  svgName="cake-graph"
                  linkTxt="moreInfo"
                />
              </div>
              <div className="row">
                <div className="col-xxl-6 col-12 mb-3">
                  <div className="card h-100">
                    <div className="card-header">
                      <h4>Ventas</h4>
                    </div>
                    <SalesChart />
                  </div>
                </div>

                <div className="col-xxl-6 col-12 mb-3">
                  <div className="card h-100 card-stock">
                    <div className="card-header stock-header">
                      <Link
                        to={"/inventory/"}
                        className="text-decoration-none text-dark"
                      >
                        <h5>Stock Faltante</h5>
                      </Link>
                    </div>
                    <div className="scrollable-card-body">
                      <div className="card-header stock-header">
                        <div className="input-group w-auto">
                          <span className="input-group-text user-select-none">
                            {lowStockText}
                          </span>
                          <input
                            type="number"
                            min="0"
                            defaultValue={amount}
                            className="form-control"
                            ref={inputRef}
                            style={{ padding: 0, textAlign: "center", textJustify: "center" }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleButtonClick();
                            }}
                          />
                          <button
                            className="btn btn-outline-success"
                            onClick={handleButtonClick}
                            type="button"
                          >
                            <i className="bi bi-search"></i>
                          </button>
                        </div>
                      </div>
                      <Table items={products} loading={loading} columns={columns} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </>
    </RequirePermission>
  );
}

export default Dashboard;
