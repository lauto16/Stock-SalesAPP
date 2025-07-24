import React from 'react';
import Chart from 'react-apexcharts';

const SalesChart = () => {
    const options = {
        chart: {
            id: 'basic-bar'
        },
        xaxis: {
            categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
        }
    };

    const series = [
        {
            name: 'Ventas',
            data: [30, 40, 35, 50, 49, 60]
        }
    ];

    return (
        <div className="chart">
            <Chart options={options} series={series} type="bar" width="500" />
        </div>
    );
};

export default SalesChart;
