import React from "react";
import {Line} from "react-chartjs-2";
import './LineChart.css';

function LineChart({chartData}) {

    return (
        <div className="chart-container">
            <h2 className={"chart-title"}>{chartData.title}</h2>
            <Line
                data={chartData}
                redraw={false}
                datasetIdKey={"line-chart"}
                options={{
                    plugins: {
                        title: {
                            display: false,
                            text: "Price history"
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: 'black'
                            }
                        },
                        y: {
                            ticks: {
                                color: 'black'
                            }
                        }
                    }
                }}
            />
        </div>
    );
}

export default LineChart;
