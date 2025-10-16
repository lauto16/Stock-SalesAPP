import React from 'react'
import Chart from 'react-apexcharts'

const SalesChart = () => {
    const options = {
        chart: {
            type: 'line',
            toolbar: { show: false },
        },
        stroke: {
            curve: 'smooth',
        },
        xaxis: {
            categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
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
            data: [30, 40, 35, 50, 49, 60],
        },
    ]

    return (
        <div
            className="chart-wrapper"
            style={{ width: '100%', maxWidth: '500px' }}
        >
            <Chart
                options={options}
                series={series}
                type="bar"
                width="100%"
                height={300}
            />
        </div>
    )
}

export default SalesChart
