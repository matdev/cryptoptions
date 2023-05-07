import React from "react";
import { Line } from "react-chartjs-2";
import './LineChart.css';
import {useSelector} from 'react-redux';

function LineChart({ chartData }) {

    const userCurrency = useSelector(store => store.userCurrency.value);

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
                    }
                }}
            />
        </div>
    );
}
export default LineChart;
