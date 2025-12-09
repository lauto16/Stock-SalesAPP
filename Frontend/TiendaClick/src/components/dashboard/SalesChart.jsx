import React from 'react'
import Chart from 'react-apexcharts'

const SalesChart = ({ sales }) => {

    const months = ['Ene', "Feb", 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    // Validate sales data
    const hasData = sales && Array.isArray(sales) && sales.length > 0;

    const options = {
        chart: {
            type: 'line',
            toolbar: { show: false },
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        colors: ['green'],
        xaxis: {
            categories: hasData ? sales.map((sale) => months[sale.month - 1]) : []
        },
        yaxis: {
            title: {
                text: 'Cantidad de ventas'
            }
        },
        tooltip: {
            y: {
                formatter: function (value) {
                    return value + ' ventas'
                }
            }
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: { height: 300 },
                },
            },
        ],
    }

    const series = [
        {
            name: 'Ventas',
            data: hasData ? sales.map((sale) => sale.sales) : []
        }
    ];

    return (
        <div
            className="chart-wrapper"
            style={{ width: '100%', maxWidth: '600px' }}
        >
            {hasData ? (
                <Chart
                    options={options}
                    series={series}
                    type="bar"
                    width="100%"
                    height={300}
                />
            ) : (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-graph-up" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3">No hay datos de ventas disponibles</p>
                </div>
            )}
        </div>
    )
}

export default SalesChart

