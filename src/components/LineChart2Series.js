import React from "react";
import {Line} from "react-chartjs-2";
import './LineChart.css';

function LineChart2Series({chartData}) {

    return (
        <div className="chart-container">
            <h2 className={"chart-title"}>{chartData.title}</h2>
            <Line
                data={chartData}
                redraw={true}
                datasetIdKey={"line-chart"}
                options={{
                    plugins: {
                        title: {
                            display: false,
                            text: "Price history"
                        },
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',

                            // grid line settings
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        },
                    }
                }}
            />
        </div>
    );
}

export default LineChart2Series;
