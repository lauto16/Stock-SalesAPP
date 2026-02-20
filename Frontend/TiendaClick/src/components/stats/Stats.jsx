import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useUser } from "../../context/UserContext.jsx";
import ActionBox from "../dashboard/ActionBox.jsx";
import DashboardHeader from "../dashboard/DashboardHeader.jsx"
import SalesChart from "./SalesChart.jsx";
import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'
import Table from "../crud/Table.jsx";
import Pagination from '../inventory/Pagination.jsx';
import { FaSearch } from "react-icons/fa";
import { useRef } from "react";
import {
    fetchSalesAverageValueStatsByPeriod,
    fetchMostUsedPaymentMethodsStatsByPeriod,
    fetchBestSellingProducts,
    fetchHigherMarginProducts,
    fetchLowerMarginProducts,
    fetchBestSellingHours,
    fetchEmployeeSales,
    fetchSalesStats,
    fetchEmployeesStats,
    fetchProductsStats,
    fetchBestSellingCategories,
    fetchDailyReports,
    fetchDailyReportStatsByDate,
} from "../../services/axios.services.stats.js";

export default function Stats() {
    const { user } = useUser();

    const [avgSales, setAvgSales] = useState({});
    const [paymentMethods, setPaymentMethods] = useState(null);
    const [bestProducts, setBestProducts] = useState([]);
    const [higherMargin, setHigherMargin] = useState([]);
    const [lowerMargin, setLowerMargin] = useState([]);
    const [bestHours, setBestHours] = useState([]);
    const [employeeSales, setEmployeeSales] = useState({});
    const periods = ["day", "week", "month", "year", "all"];
    const sp_periods = ["Día", "Semana", "Mes", "Año", "Historico"];
    const [saleStats, setSalesStats] = useState({})
    const [employeeStats, setEmployeeStats] = useState({})
    const [productStats, setProductStats] = useState({})
    const [bestCategories, setBestCategories] = useState([]);
    const [dailyReportStats, setDailyReportStats] = useState({})

    const [dailyReports, setDailyReports] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 10;

    const yearRef = useRef();
    const monthRef = useRef();
    const dayRef = useRef();

    const todays_year = new Date().getFullYear();

    // SI EL USUARIO INGRESA SOLO YEAR, PEGARLE A ESTE: daily-report-by-year, si ingresa year y month, a otro

    const handleSubmitDateReport = async () => {
        const year = yearRef.current.value;
        const month = monthRef.current.value;
        const day = dayRef.current.value;

        try {
            const response = await fetchDailyReportStatsByDate(
                user.token,
                year,
                month,
                day
            );
            const daily_report = formatDailyReportsData([response.data.daily_report])
            setDailyReportStats(daily_report[0]);

        } catch (error) {
            console.error("Error al obtener reporte diario:", error);
        }
    };

    const formatDailyReportsData = (data = []) => {

        return data.map((daily_report) => {
            const isToday = daily_report.is_todays;

            const green = "#114511";
            const red = "#5c1010";

            return {
                gain: (
                    <span
                        style={{
                            color: green,
                            fontWeight: isToday ? "700" : "400",
                        }}
                    >
                        ${daily_report.gain}
                    </span>
                ),

                loss: (
                    <span
                        style={{
                            color: red,
                            fontWeight: isToday ? "700" : "400",
                        }}
                    >
                        ${daily_report.loss}
                    </span>
                ),

                profit: (
                    <span
                        style={{
                            color: daily_report.profit >= 0 ? green : red,
                            fontWeight: isToday ? "700" : "400",
                        }}
                    >
                        ${daily_report.profit}
                    </span>
                ),

                created_at: daily_report.created_at,
            };
        });
    };

    const dailyReportsColumns = [
        { className: "gain", key: "gain", label: 'Ganancia' },
        { className: "loss", key: "loss", label: 'Perdida' },
        { className: "profit", key: "profit", label: 'Margen' },
        { className: "created_at", key: "created_at", label: 'Fecha' },
    ];

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }

    };

    useEffect(() => {
        const loadDailyReports = async () => {
            const { results, count } = await fetchDailyReports({
                page: currentPage,
                setLoading,
                token: user.token,
            });
            console.log(results);
            const dailyReportsData = formatDailyReportsData(results);

            setDailyReports(dailyReportsData);
            setCount(count);
            setTotalPages(Math.ceil(count / PAGE_SIZE));
            setLoading(false);
        };

        loadDailyReports();
    }, [currentPage]);

    const round1 = (value) =>
        value !== null && value !== undefined
            ? Number.parseFloat(value).toFixed(1)
            : "0.0";

    const hourLabels = bestHours.map(h => h["hour   "]);
    const hourCounts = bestHours.map(h => h.count);

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

    useEffect(() => {
        const loadAll = async () => {
            const avgResults = {};
            for (const p of periods) {
                const res = await fetchSalesAverageValueStatsByPeriod(user.token, p);
                avgResults[p] = res.data;
            }
            setAvgSales(avgResults);

            setBestCategories(
                (await fetchBestSellingCategories(user.token)).data
            );

            setPaymentMethods(
                (await fetchMostUsedPaymentMethodsStatsByPeriod(user.token, "all")).data
            );

            setBestProducts(
                (await fetchBestSellingProducts(user.token, "all", 15)).data
            );

            setHigherMargin(
                (await fetchHigherMarginProducts(user.token, 15)).data
            );

            setLowerMargin(
                (await fetchLowerMarginProducts(user.token, 15)).data
            );

            setBestHours(
                (await fetchBestSellingHours(user.token)).data
            );

            setEmployeeSales(
                (await fetchEmployeeSales(user.token)).data
            );

            get_sales_data_stats()
            get_products_data_stats()
            get_employees_data_stats()
        };

        loadAll().catch(console.error);
    }, [user.token]);

    return (
        <RequirePermission permission="access_dashboard">
            <hr style={{ opacity: '0' }} />
            <DashboardHeader title={'ESTADISTICAS'} isDashboard={false} />
            <div className="container my-4">

                <h4 className="mb-4">Reportes diarios de ganancia</h4>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
                <Table
                    items={dailyReports}
                    columns={dailyReportsColumns}
                    loading={loading}
                    pkName={"id"}
                />

                <br />
                <div className="card shadow-sm p-3">
                    <div className="container-fluid">
                        <h4 className="mb-4 ">Generar reportes diarios de ganancia</h4>

                        <div className="row align-items-end">

                            <div className="col-md-3">
                                <label className="form-label">Año</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Ej: 2026"
                                    ref={yearRef}
                                    value={todays_year ? todays_year : ''}
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Mes</label>
                                <select
                                    className="form-select"
                                    ref={monthRef}
                                >
                                    <option value="">Seleccionar</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Día</label>
                                <select
                                    className="form-select"
                                    ref={dayRef}
                                >
                                    <option value="">Seleccionar</option>
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">

                                <button
                                    className="mt-2 send-form-button btn btn-success"
                                    onClick={handleSubmitDateReport}
                                >
                                    <FaSearch className="me-2" />
                                    Buscar
                                </button>
                            </div>

                        </div>

                        <div className="mt-4">
                            <div className="table-responsive">

                                <table className="table table-bordered text-center align-middle">

                                    <thead className="table-light">
                                        <tr>
                                            <th>Ganancia</th>
                                            <th>Pérdida</th>
                                            <th>Margen</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{dailyReportStats ? dailyReportStats.gain : '0'}</td>
                                            <td>{dailyReportStats ? dailyReportStats.loss : '0'}</td>
                                            <td>{dailyReportStats ? dailyReportStats.profit : '0'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
                <br />

                <h4 className="mb-4">Sobre las ventas</h4>

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
                        number={`${productStats.average_gain_margin_per_product} %`}
                        cardClass={
                            productStats.average_gain_margin_per_product > 0
                                ? 'text-bg-success'
                                : 'text-bg-danger'
                        }
                        svgName="percentage"
                    />
                </div>

                <div className="row">
                    <div className="col-12 mb-3">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5>Ventas por mes</h5>
                            </div>

                            <div className="card-body w-100">
                                <SalesChart sales={saleStats.total_sales_by_month} />
                            </div>
                        </div>
                    </div>

                    {/* Average sale value */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5>Valor de venta promedio</h5>

                            <Chart
                                type="bar"
                                height={300}
                                series={[
                                    {
                                        name: "Promedio",
                                        data: periods.map(
                                            p => Number(round1(avgSales[p]?.average_sale_value))
                                        )
                                    }
                                ]}
                                options={{
                                    xaxis: {
                                        categories: sp_periods.map(p => p)
                                    },
                                    colors: ['#38946e'],
                                    tooltip: {
                                        y: {
                                            formatter: (val) => `$ ${val.toFixed(1)}`
                                        }
                                    },
                                    dataLabels: {
                                        enabled: true
                                    },
                                    responsive: [
                                        {
                                            breakpoint: 768,
                                            options: {
                                                dataLabels: {
                                                    enabled: false
                                                }
                                            }
                                        }
                                    ]
                                }}
                            />
                        </div>
                    </div>

                    {/* Payment methods */}
                    {paymentMethods && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5>Metodos de pago mas usados</h5>

                                <Chart
                                    type="pie"
                                    height={300}
                                    series={paymentMethods.payment_method_usage.map(
                                        p => Number(round1(p.count))
                                    )}
                                    options={{
                                        labels: paymentMethods.payment_method_usage.map(
                                            p => p.payment_method
                                        ),
                                        tooltip: {
                                            y: {
                                                formatter: (val) => val.toFixed(1)
                                            }
                                        },
                                        dataLabels: {
                                            enabled: true
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Best selling products */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5>Productos mas vendidos</h5>

                            <Chart
                                type="bar"
                                height={400}
                                series={[
                                    {
                                        name: "Unidades vendidas",
                                        data: bestProducts.map(
                                            p => Number(round1(p.total_sold))
                                        )
                                    }
                                ]}
                                options={{
                                    plotOptions: { bar: { horizontal: true } },
                                    xaxis: {
                                        categories: bestProducts.map(p => p.product__name)
                                    },
                                    colors: ['#38946e'],
                                }}
                            />
                        </div>
                    </div>

                    {/* Best selling hours */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5>Horas con más ventas</h5>

                            <Chart
                                type="line"
                                height={300}
                                series={[
                                    {
                                        name: "Ventas",
                                        data: hourCounts
                                    }
                                ]}
                                options={{
                                    xaxis: {
                                        categories: hourLabels,
                                        title: { text: "Horario" }
                                    },
                                    yaxis: {
                                        title: { text: "Cantidad de ventas" }
                                    },
                                    tooltip: {
                                        y: {
                                            formatter: (val) => val.toFixed(1)
                                        }
                                    },
                                    colors: ['#038f52ff'],
                                }}
                            />
                        </div>
                    </div>

                    <h4 className="mb-4">Sobre los productos</h4>

                    {/* Higher margin products */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5>Productos con mayor margen de ganancia</h5>
                            <div className="text-muted fst-italic mt-1 d-flex align-items-center gap-2 small">
                                <i className="bi bi-info-circle-fill"></i>
                                <span>
                                    Representa cuanto dinero le ganas a los productos
                                </span>
                            </div>
                            <Chart
                                type="bar"
                                height={400}
                                series={[
                                    {
                                        name: "Margen",
                                        data: higherMargin.map(
                                            p => Number(round1(p.margin))
                                        )
                                    }
                                ]}
                                options={{
                                    xaxis: {
                                        categories: higherMargin.map(p => p.name)
                                    },
                                    tooltip: {
                                        y: {
                                            formatter: (val) => `${val.toFixed(1)} %`
                                        }
                                    },

                                    dataLabels: {
                                        enabled: true
                                    },
                                    colors: ['#38946e'],
                                    responsive: [
                                        {
                                            breakpoint: 768,
                                            options: {
                                                dataLabels: {
                                                    enabled: false
                                                }
                                            }
                                        }
                                    ]
                                }}
                            />
                        </div>
                    </div>

                    {/* Lower margin products */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5>Productos con menor margen de ganancia</h5>
                            <div className="text-muted fst-italic mt-1 d-flex align-items-center gap-2 small">
                                <i className="bi bi-info-circle-fill"></i>
                                <span>
                                    Representa cuanto dinero le ganas a los productos
                                </span>
                            </div>
                            <Chart
                                type="bar"
                                height={400}
                                series={[
                                    {
                                        name: "Margen",
                                        data: lowerMargin.map(
                                            p => Number(round1(p.margin))
                                        )
                                    }
                                ]}
                                options={{
                                    xaxis: {
                                        categories: lowerMargin.map(p => p.name)
                                    },
                                    tooltip: {
                                        y: {
                                            formatter: (val) => `${val.toFixed(1)} %`
                                        }
                                    },
                                    dataLabels: {
                                        enabled: true
                                    },
                                    colors: ['#38946e'],
                                    responsive: [
                                        {
                                            breakpoint: 768,
                                            options: {
                                                dataLabels: {
                                                    enabled: false
                                                }
                                            }
                                        }
                                    ]
                                }}
                            />
                        </div>
                    </div>
                    {/* Best selling categories */}
                    {bestCategories.length > 0 && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5>Categorías más vendidas</h5>

                                <Chart
                                    type="bar"
                                    height={400}
                                    series={[
                                        {
                                            name: "Ventas",
                                            data: bestCategories.map(c =>
                                                Number(round1(c.total_sold))
                                            )
                                        }
                                    ]}
                                    options={{
                                        plotOptions: {
                                            bar: { horizontal: true }
                                        },
                                        xaxis: {
                                            categories: bestCategories.map(c => c.name)
                                        },
                                        colors: ['#38946e'],
                                        dataLabels: {
                                            enabled: true
                                        },
                                        responsive: [
                                            {
                                                breakpoint: 768,
                                                options: {
                                                    dataLabels: {
                                                        enabled: false
                                                    }
                                                }
                                            }
                                        ]
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <h4 className="mb-4">Sobre los empleados</h4>

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

                    {/* Employee sales */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5>Ventas por empleado</h5>

                            <Chart
                                type="bar"
                                height={300}
                                series={[
                                    {
                                        name: "Ventas",
                                        data: Object.values(employeeSales).map(
                                            v => Number(round1(v))
                                        )
                                    }
                                ]}
                                options={{
                                    xaxis: {
                                        categories: Object.keys(employeeSales)
                                    },
                                    dataLabels: {
                                        enabled: true
                                    },
                                    colors: ['#38946e'],
                                    responsive: [
                                        {
                                            breakpoint: 768,
                                            options: {
                                                dataLabels: {
                                                    enabled: false
                                                }
                                            }
                                        }
                                    ]
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </RequirePermission>
    );
}
