import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useUser } from "../../context/UserContext.jsx";
import {
    fetchSalesAverageValueStatsByPeriod,
    fetchMostUsedPaymentMethodsStatsByPeriod,
    fetchBestSellingProducts,
    fetchHigherMarginProducts,
    fetchLowerMarginProducts,
    fetchBestSellingHours,
    fetchEmployeeSales
} from "../../services/axios.services.js";

export default function SalesStatsDashboard() {
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

    const round1 = (value) =>
        value !== null && value !== undefined
            ? Number.parseFloat(value).toFixed(1)
            : "0.0";

    const hourLabels = bestHours.map(h => h["hour   "]);
    const hourCounts = bestHours.map(h => h.count);

    useEffect(() => {
        const loadAll = async () => {
            const avgResults = {};
            for (const p of periods) {
                const res = await fetchSalesAverageValueStatsByPeriod(user.token, p);
                avgResults[p] = res.data;
            }
            setAvgSales(avgResults);

            /* Others */
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
        };

        loadAll().catch(console.error);
    }, [user.token]);

    return (
        <div className="container my-4">
            <h2 className="mb-4">Estadísticas de tu tienda</h2>
            
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
                                categories: sp_periods.map(p => p.toUpperCase())
                            },
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
                            }
                        }}
                    />
                </div>
            </div>

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
                            }
                        }}
                    />
                </div>
            </div>

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
    );
}
