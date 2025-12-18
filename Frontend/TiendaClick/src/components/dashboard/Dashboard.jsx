import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ActionBox from './ActionBox.jsx'
import DashboardHeader from './DashboardHeader.jsx'
import SideBar from '../sideNav/SideBar.jsx'
import Nav from '../sideNav/Nav.jsx'
import Table from '../crud/Table.jsx'
import Notifications from "../notifications/Notifications";

import {
  fetchLowStock,
  fetchSalesStats,
  fetchEmployeesStats,
  fetchProductsStats,
} from '../../services/axios.services.js'
import '../../css/dashboard.css'
import { useUser } from '../../context/UserContext.jsx'
import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'

function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [amount, setAmount] = useState(5)
  const inputRef = useRef(null)
  const { user } = useUser()
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 850)
  const [lowStockText, setLowStockText] = useState('Stock menor que')

  // stats
  const [employeeStats, setEmployeeStats] = useState({})
  const [saleStats, setSalesStats] = useState({})
  const [productStats, setProductStats] = useState({})

  const columns = [
    { className: 'code', key: 'code', label: 'Código' },
    { className: 'name', key: 'name', label: 'Nombre' },
    { className: 'sell-price', key: 'sell_price', label: 'Precio Venta' },
    { className: 'stock', key: 'stock', label: 'Stock' },
  ]

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 850)
      if (window.innerWidth <= 500) {
        setLowStockText('Stock <')
      } else {
        setLowStockText('Stock menor que')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const get_products = async () => {
      const data = await fetchLowStock({ setLoading, amount }, user.token)
      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        console.warn('La respuesta no es un array')
        setProducts([])
      }
    }

    const get_sales_data_stats = async () => {
      const sales_data_stats = await fetchSalesStats(user.token)
      if (sales_data_stats) {
        setSalesStats(sales_data_stats.sales_data)
      } else {
        setSalesStats({})
      }
    }

    const get_employees_data_stats = async () => {
      const employees_data_stats = await fetchEmployeesStats(user.token)

      if (employees_data_stats) {
        setEmployeeStats(employees_data_stats.employees_stats)
      } else {
        setEmployeeStats({})
      }
    }

    const get_products_data_stats = async () => {
      const products_data_stats = await fetchProductsStats(user.token)
      if (products_data_stats) {
        setProductStats(products_data_stats.products_data)
      } else {
        setProductStats({})
      }
    }

    get_products()
    get_products_data_stats()
    get_employees_data_stats()
    get_sales_data_stats()
  }, [amount, user])

  const handleButtonClick = () => {
    const value_input = inputRef.current?.value
    const newValue = parseInt(value_input, 10)
    if (!isNaN(newValue) && newValue >= 0) {
      setAmount(newValue)
    }
  }
  return (
    <RequirePermission permission="access_dashboard">
      <>
        <div className="app-wrapper">
          {showSidebar && <Nav />}
          {showSidebar && <SideBar />}
          <main className="flex-grow-1 p-3 content">
            <DashboardHeader title={'DASHBOARD'} isDashboard={true} />

            <section className="app-content container-fluid  mb-4">
              <div className="row row-action-box mt-2">
                <ActionBox
                  name="Ventas hoy"
                  number={`${saleStats.total_sales_this_day}`}
                  cardClass={
                    saleStats.total_sales_this_day > 0
                      ? 'text-bg-success'
                      : 'text-bg-secondary'
                  }
                  subtext="Total de venta"
                  subtext_value={saleStats.total_money_sales_this_day}
                  svgName="cart"
                />
                <ActionBox
                  name="Ventas este mes"
                  number={`${saleStats.total_sales_this_month}`}
                  cardClass={
                    saleStats.total_sales_this_month > 0
                      ? 'text-bg-success'
                      : 'text-bg-secondary'
                  }
                  subtext="Total de venta"
                  subtext_value={saleStats.total_money_sales_this_month}
                  svgName="cart"
                />
                <ActionBox
                  name="Ventas este año"
                  number={`${saleStats.total_sales_this_year}`}
                  cardClass={
                    saleStats.total_sales_this_year > 0
                      ? 'text-bg-success'
                      : 'text-bg-secondary'
                  }
                  svgName="cart"
                  subtext="Total de venta"
                  subtext_value={saleStats.total_money_sales_this_year}
                />
                <ActionBox
                  name="Margen de ganancia promedio"
                  number={`${productStats.average_gain_margin_per_product}%`}
                  cardClass={
                    productStats.average_gain_margin_per_product > 0
                      ? 'text-bg-success'
                      : 'text-bg-danger'
                  }
                  svgName="percentage"
                />
                <ActionBox
                  name="Empleado con mas ventas hoy"
                  number={`${employeeStats.most_selling_employee_this_day ? employeeStats.most_selling_employee_this_day : 'Nadie'}`}
                  cardClass='text-bg-secondary'
                  svgName="new-person"
                />
                <ActionBox
                  name="Empleado con mas ventas este mes"
                  number={`${employeeStats.most_selling_employee_this_month ? employeeStats.most_selling_employee_this_month : 'Nadie'}`}
                  cardClass='text-bg-secondary'
                  svgName="new-person"
                />
                <ActionBox
                  name="Empleado con mas ventas este año"
                  number={`${employeeStats.most_selling_employee_this_year ? employeeStats.most_selling_employee_this_year : 'Nadie'}`}
                  cardClass='text-bg-secondary'
                  svgName="new-person"
                />
                <ActionBox
                  name="Empleado con mas ventas historicamente"
                  number={`${employeeStats.most_selling_employee_historically ? employeeStats.most_selling_employee_historically : 'Nadie'}`}
                  cardClass='text-bg-primary'
                  svgName="new-person"
                />
              </div>

              <div className="row">
                <div className="col-12 mb-3">
                  <div className="card h-100 card-stock">
                    <div className="card-header stock-header">
                      <Link
                        to={'/inventory/'}
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
                            style={{ padding: 0, textAlign: 'center' }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleButtonClick()
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

                      <Table
                        items={products}
                        loading={loading}
                        columns={columns}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-xxl-6 mb-3">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5>Notificaciones</h5>
                    </div>
                    <div className="scrollable-card-body">
                      <Notifications />
                    </div>
                  </div>
                </div>
              </div>

            </section>
          </main>
        </div>
      </>
    </RequirePermission>
  )
}

export default Dashboard
