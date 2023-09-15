import axios from 'axios'
import {Link, useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect} from 'react'
import DOMPurify from 'dompurify'
import './CoinCorrelations.css'
import CoinOptions from "./CoinOptions";
import Chart from "chart.js/auto";
import LineChart2Series from "../components/LineChart2Series";
import {useSelector} from 'react-redux';
import * as MathsUtils from "../util/MathsUtils";
import * as Colors from "../util/Colors";
import {roundToDecimalPlace} from "../util/MathsUtils";
import * as StringUtils from "../util/StringUtils";
import ReactGA from "react-ga4";
import {convertToUpperCase} from "../util/StringUtils";

const mathjs = require('mathjs');

const CoinCorrelations = (props) => {

    const location = useLocation();
    const params = useParams();

    const userCurrency = useSelector(store => store.userCurrency.value);

    let useDefaultCoins = false;

    const prop_coins = [];

    if ((props.coins == null) || (props.coins.length == 0) || (props.coins[0] === undefined)) {

        console.log("props.coins[0] === undefined => USE DEFAULT 5 COINS");
        useDefaultCoins = true;

        const coin1 = {
            id: 'bitcoin',
            symbol: 'btc'
        };
        prop_coins[0] = coin1;

        const coin2 = {
            id: 'ethereum',
            symbol: 'eth'
        };
        prop_coins[1] = coin2;

        const coin3 = {
            id: 'tether',
            symbol: 'usdt'
        };

        prop_coins[2] = coin3;

        const coin4 = {
            id: 'binancecoin',
            symbol: 'bnb'
        };

        prop_coins[3] = coin4;

        const coin5 = {
            id: 'ripple',
            symbol: 'xrp'
        };

        prop_coins[4] = coin5;

    } else {
        prop_coins[0] = props.coins[0];
        prop_coins[1] = props.coins[1];
        prop_coins[2] = props.coins[2];
        prop_coins[3] = props.coins[3];
        prop_coins[4] = props.coins[4];
    }

    let btcPricesHistoryFromService;
    let ethPricesHistoryFromService;

    const priceHistories = []; // [[Coin 1 daily prices], [Coin 2 daily prices], ... ]
    const dailyReturnHistories = []; // [[Coin 1 daily returns], [Coin 2 daily returns], ... ]
    const historicalStdDevs = [];
    const historicalVols = [];

    //const historiesLoaded = [false, false, false, false, false];
    const historiesLoaded = [false, false, false, false, false];
    const historiesLoading = [false, false, false, false, false];

    const [correlationsCoin1, setCorrelationsCoin1] = useState([]);
    const [correlationsCoin2, setCorrelationsCoin2] = useState([]);
    const [correlationsCoin3, setCorrelationsCoin3] = useState([]);
    const [correlationsCoin4, setCorrelationsCoin4] = useState([]);
    const [correlationsCoin5, setCorrelationsCoin5] = useState([]);


    const [historicalVolCoin1, setHistoricalVolCoin1] = useState(0);

    const [chartData, setChartData] = useState({
        title: "Historical prices (" + userCurrency.symbol + ")",
        labels: [], //testLabels.map((data) => data[0]),
        datasets: [
            {
                label: "price hist INIT",
                data: [], //testValues.map((data) => data[0]),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Dataset 2',
                data: [],
                borderColor: Colors.CHART_COLORS.blue,
                backgroundColor: Colors.CHART_COLORS.blue,
                yAxisID: 'y1',
            }
        ],
    });
    useEffect(() => {

        //console.log("CoinCorrelations useEffect() props.coins = " + JSON.stringify(props.coins, null, 4));

        let current_coin_index = 0;
        doRequestPriceHistoryIfNecessary(current_coin_index);

        current_coin_index = 1;
        doRequestPriceHistoryIfNecessary(current_coin_index);

        current_coin_index = 2;
        doRequestPriceHistoryIfNecessary(current_coin_index);

        current_coin_index = 3;
        doRequestPriceHistoryIfNecessary(current_coin_index);

        current_coin_index = 4;
        doRequestPriceHistoryIfNecessary(current_coin_index);

    }, [userCurrency])

    function doRequestPriceHistoryIfNecessary(coin_index) {
        if (!historiesLoaded[coin_index] && !historiesLoading[coin_index]) {
            doRequestPriceHistory(coin_index);
        } else {
            console.log("doRequestPriceHistoryIfNecessary() HISTORY ALREADY LOADED FOR " + prop_coins[coin_index].id);
        }
    }

    const doRequestPriceHistory = function (coin_index) {

        const price_history_url = 'https://api.coingecko.com/api/v3/coins/' + prop_coins[coin_index].id + '/market_chart?vs_currency=' + userCurrency.code + '&days=90&interval=daily';
        historiesLoading[coin_index] = true;

        axios.get(price_history_url).then((res) => {

            historiesLoaded[coin_index] = true;
            historiesLoading[coin_index] = false;

            //console.log("CoinCorrelations.doRequest().get().then() RECEIVED from price_history_url: " + res.data.prices + " SIZE = " + res.data.prices.length);
            let pricesHistoryFromService = res.data.prices;

            if (prop_coins[coin_index].symbol == "btc") {
                btcPricesHistoryFromService = pricesHistoryFromService;
            } else if (prop_coins[coin_index].symbol == "eth") {
                ethPricesHistoryFromService = pricesHistoryFromService;
            }

            let pricesHistoryCoin = [];
            let dailyReturnHistory = [];

            let i = 0;
            for (const entry of pricesHistoryFromService) {

                //console.log("CoinDetails.useEffect() entry: " + entry);

                if (entry[1] === undefined) {
                    console.log("CoinCorrelations.doRequest().get().then() i=  " + i + " undefined ");
                } else {

                    pricesHistoryCoin[i] = entry[1];

                    if (i > 0) {
                        dailyReturnHistory[i - 1] = mathjs.log(pricesHistoryCoin[i] / pricesHistoryCoin[i - 1]);
                    }
                    // console.log("CoinCorrelations.doRequest().get().then() labelsHistory[i]: " + labelsHistory[i] + " pricesHistory[i] = " + pricesHistory[i]
                    //     + " dailyReturnHistory[i] = " + dailyReturnHistory[i]);
                }

                i = i + 1;
            }

            //let standardDeviation = mathjs.std(dailyReturnHistory);
            let standardDeviation = mathjs.std(pricesHistoryCoin);

            let histoVol = standardDeviation * mathjs.sqrt(365) * 100;
            let historicalStdDev = standardDeviation;

            priceHistories[coin_index] = pricesHistoryCoin;
            dailyReturnHistories[coin_index] = dailyReturnHistory;
            historicalStdDevs[coin_index] = historicalStdDev;
            historicalVols[coin_index] = histoVol;

            console.log("CoinCorrelations.doRequest().get().then() coin index = " + coin_index + " histoVol = " + histoVol);

            if (isAllHistoriesLoaded()) {
                console.log("CoinCorrelations.doRequest().get().then() ALL HISTORIES LOADED !! => PROCEED to correlations calc !");
                calcCorrelations();
            }
        }).catch((error) => {
            console.log(error);
            historiesLoaded[coin_index] = false;
            historiesLoading[coin_index] = false;
        });
    };

    function calcCorrelations() {

        if (priceHistories.length < 2) {
            console.warn("calcCorrelations() priceHistories NOT FULLY LOADED")
            return;
        }

        let coin_averages = [];
        coin_averages[0] = mathjs.mean(priceHistories[0]);
        coin_averages[1] = mathjs.mean(priceHistories[1]);
        coin_averages[2] = mathjs.mean(priceHistories[2]);
        coin_averages[3] = mathjs.mean(priceHistories[3]);
        coin_averages[4] = mathjs.mean(priceHistories[4]);

        let correlationsMatrix = [[]];

        for (let i = 0; i < priceHistories.length; i++) {

            // Coin i correlation with others
            correlationsMatrix[i] = [];

            for (let j = i + 1; j < priceHistories.length; j++) {

                let covariance = MathsUtils.getCovariance(priceHistories[i], coin_averages[i], priceHistories[j], coin_averages[j]);

                let correlation = covariance / (historicalStdDevs[i] * historicalStdDevs[j])

                console.log("CoinCorrelations.calcCorrelations() correlation coin_" + i + " coin_" + j + " = " + correlation);

                if (i == 0) {
                    correlationsMatrix[i][j - 1] = correlation;
                } else if (i == 1) {
                    correlationsMatrix[i][j - 1] = correlation;
                } else if (i == 2) {
                    correlationsMatrix[i][j - 1] = correlation;
                } else if (i == 3) {
                    correlationsMatrix[i][j - 1] = correlation;
                } else if (i == 4) {
                    correlationsMatrix[i][j - 1] = correlation;
                }
            }
        }

        setCorrelationsCoin1(correlationsMatrix[0]);
        setCorrelationsCoin2(correlationsMatrix[1]);
        setCorrelationsCoin3(correlationsMatrix[2]);
        setCorrelationsCoin4(correlationsMatrix[3]);
        setCorrelationsCoin5(correlationsMatrix[4]);

        console.log("calcCorrelations() correlationsCoin1 = " + correlationsMatrix[0]);
        console.log("calcCorrelations() correlationsCoin2 = " + correlationsMatrix[1]);
        console.log("calcCorrelations() correlationsCoin3 = " + correlationsMatrix[2]);
        console.log("calcCorrelations() correlationsCoin4 = " + correlationsMatrix[3]);
        console.log("calcCorrelations() correlationsCoin5 = " + correlationsMatrix[4]);

        console.log("calcCorrelations() historicalVols = " + historicalVols);

        // Display chart

        // Chart data
        if (btcPricesHistoryFromService != undefined) {
            setChartData({
                title: "BTC and ETH Historical Prices (" + userCurrency.symbol + ")",
                labels: btcPricesHistoryFromService.map(function (data) {
                    return new Date(data[0]).toLocaleDateString();
                }),
                datasets: [
                    {
                        label: "BTC",
                        data: btcPricesHistoryFromService.map((data) => data[1]),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        yAxisID: 'y',
                    },
                    {
                        label: "ETH",
                        data: ethPricesHistoryFromService.map((data) => data[1]),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgb(54, 162, 235, 0.5)',
                        yAxisID: 'y1',
                    }
                ],
            });
        }
    }

    function isAllHistoriesLoaded() {

        for (let i = 0; i < historiesLoaded.length; i++) {
            if (!historiesLoaded[i]) {
                return false;
            }
        }

        return true;
    }

    return (
        <div>
            <div className='coin-container'>
                <div className='content'>
                    <h1>Coin correlations</h1>
                </div>
                <div className='content'>
                    <table className={'coin_correlations'}>
                        <thead>
                        <tr>
                            <th className={'correlation_matrix_corner'}></th>
                            <th className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[0].symbol)}</th>
                            <th className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[1].symbol)}</th>
                            <th className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[2].symbol)}</th>
                            <th className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[3].symbol)}</th>
                            <th className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[4].symbol)}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            {/*ROW 1*/}
                            <td className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[0].symbol)}</td>
                            <td><p></p></td>

                        </tr>
                        <tr>
                            {/*ROW 2*/}
                            <td className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[1].symbol)}</td>
                            <td><p
                                className={(Math.sign(correlationsCoin1[0]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin1[0], 2)}</p>
                            </td>
                        </tr>
                        <tr>
                            {/*ROW 3*/}
                            <td className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[2].symbol)}</td>
                            <td><p
                                className={(Math.sign(correlationsCoin1[1]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin1[1], 2)}</p>
                            </td>
                            <td><p
                                className={(Math.sign(correlationsCoin2[1]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin2[1], 2)}</p>
                            </td>
                        </tr>
                        <tr>
                            {/*ROW 4*/}
                            <td className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[3].symbol)}</td>
                            <td><p
                                className={(Math.sign(correlationsCoin1[2]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin1[2], 2)}</p>
                            </td>

                            <td><p
                                className={(Math.sign(correlationsCoin2[2]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin2[2], 2)}</p>
                            </td>

                            <td><p
                                className={(Math.sign(correlationsCoin3[2]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin3[2], 2)}</p>
                            </td>
                        </tr>
                        <tr>
                            {/*ROW 5*/}
                            <td className={'coin_correlations_header'}>{StringUtils.convertToUpperCase(prop_coins[4].symbol)}</td>

                            <td><p
                                className={(Math.sign(correlationsCoin1[3]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin1[3], 2)}</p>
                            </td>

                            <td><p
                                className={(Math.sign(correlationsCoin2[3]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin2[3], 2)}</p>
                            </td>

                            <td><p
                                className={(Math.sign(correlationsCoin3[3]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin3[3], 2)}</p>
                            </td>

                            <td><p
                                className={(Math.sign(correlationsCoin4[3]) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(correlationsCoin4[3], 2)}</p>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <div><br/><br/></div>
                    <p style={{fontStyle: "italic"}}> Note: These Pearson correlation coefficients are calculated over
                        the last 90 daily prices in {userCurrency.label} </p>
                </div>
                <div className='content'>
                    <LineChart2Series chartData={chartData}/>
                    {/*<div className='historical-vol'>*/}
                    {/*    <h3>Historical volatility</h3>*/}
                    {/*</div>*/}
                    {/*<div className='details_info'>*/}
                    {/*    <div className='historical-vol'>*/}
                    {/*        <h3> {prop_coins[0].symbol} Volatility : </h3>*/}
                    {/*    </div>*/}
                    {/*    <div className='centered-in-cell'>*/}
                    {/*        <h1>{historicalVols[0]?.toFixed(2)} %</h1>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div className='details_info'>*/}
                    {/*    <div>*/}
                    {/*        Calculated over the last 90 daily returns*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    )
}

export default CoinCorrelations
