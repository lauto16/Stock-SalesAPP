import React from 'react';
import Chart from 'react-apexcharts';

const SalesChart = ({ sales }) => {
    const options = {
        chart: {
            type: 'line',
            toolbar: { show: false },
        },
        stroke: {
            curve: 'smooth',
        },
        xaxis: {
            categories: sales.map((sale) => {
                return sale.month
            })
        },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: { height: 300 }
                }
            }
        ]
    };

    const series = [
        {
            name: 'Ventas',
            data: sales.map((sale) => {
                return sale.sales
            })
        }
    ];

    return (
        <div className="chart-wrapper" style={{ width: '100%', maxWidth: '500px' }}>
            <Chart options={options} series={series} type="line" width="100%" height={300} />
        </div>
    );
};

export default SalesChart;