import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useUser } from "../../context/UserContext.jsx";
import ActionBox from "../dashboard/ActionBox.jsx";
import DashboardHeader from "../dashboard/DashboardHeader.jsx"
import SalesChart from "./SalesChart.jsx";
import RequirePermission from '../permissions_manager/PermissionVerifier.jsx'

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
    fetchBestSellingCategories
} from "../../services/axios.services.js";

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
            <br />
            <DashboardHeader title={'ESTADISTICAS'} isDashboard={false} />
            <div className="container my-4">
                <h2 className="mb-4">Estadísticas de tu tienda</h2>
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
                    <div className="col-xxl-6 col-12 mb-3">
                        <div className="card h-100">
                            <div className="card-header">
                                <h4>Ventas por mes</h4>
                            </div>
                            <SalesChart sales={saleStats.total_sales_by_month} />
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
