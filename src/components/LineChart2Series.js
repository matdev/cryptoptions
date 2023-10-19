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
                        x: {
                            ticks: {
                                // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                                callback: function(val, index) {
                                    // Hide every 2nd tick label
                                    return index % 2 === 0 ? this.getLabelForValue(val) : '';
                                },
                                color: 'black',
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                color: 'black',
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: chartData.displayRightAxis,
                            position: 'right',
                            ticks: {
                                color: 'black',
                            },
                            // grid line settings
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        },
                    },
                    color: 'black'
                }}
            />
        </div>
    );
}

export default LineChart2Series;
