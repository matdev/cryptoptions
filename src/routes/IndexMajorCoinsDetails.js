import axios from 'axios'
import {Link, useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect} from 'react'
import DOMPurify from 'dompurify'
import './IndexMajorCoinsDetails.css'
import CoinOptions from "./CoinOptions";
import Chart from "chart.js/auto";
import LineChart2Series from "../components/LineChart2Series";
import {useSelector} from 'react-redux';
import * as MathsUtils from "../util/MathsUtils";
import * as Colors from "../util/Colors";
import {roundToDecimalPlace} from "../util/MathsUtils";
import * as StringUtils from "../util/StringUtils";
import * as ChartsUtils from "../util/ChartsUtils";
import ReactGA from "react-ga4";
import {convertToUpperCase} from "../util/StringUtils";
import {useTranslation} from 'react-i18next';
import DurationSwitcher from "../components/DurationSwitcher";
import * as IndexUtils from "../util/IndexUtils";

const mathjs = require('mathjs');

const IndexMajorCoinsDetails = (props) => {

    const {i18n, t} = useTranslation();

    const userCurrency = useSelector(store => store.userCurrency.value);
    const full_history_length = 365; // Price history for charts and calculating rolling correlation
    const DEFAULT_TIMEFRAME_DURATION = 30;
    let timeframeDuration = DEFAULT_TIMEFRAME_DURATION;
    let useDefaultCoins = false;

    const US_RISK_FREE_RATE = 0.04;  // Default US risk free rate
    const EUR_RISK_FREE_RATE = 0.03;

    const majorIndexWeight = IndexUtils.getMajorCoinsIndexWeights();

    const [indexFullPricesHistory, setIndexFullPricesHistory] = useState([]);
    const [indexFullDatesHistory, setIndexFullDatesHistory] = useState([]);
    const [indexFullDailyReturnHistory, setIndexFullDailyReturnHistory] = useState([]);

    const [lastKnownPrices, setLastKnownPrices] = useState([]);
    const [indexComponentVol, setIndexComponentVol] = useState([]);

    const [indexComponentPriceHistory, setIndexComponentPriceHistory] = useState([]);
    const [majorIndexValue, setMajorIndexValue] = useState(0);
    const [majorIndexValue_1d_percent, setMajorIndexValue_1d_percent] = useState(0);
    const [majorIndexValue_7d_percent, setMajorIndexValue_7d_percent] = useState(0);
    const [majorIndexValue_14d_percent, setMajorIndexValue_14d_percent] = useState(0);
    const [majorIndexValue_30d_percent, setMajorIndexValue_30d_percent] = useState(0);
    const [majorIndexValue_365d_percent, setMajorIndexValue_365d_percent] = useState(0);

    const [historicalVol, setHistoricalVol] = useState(0);
    const [sharpeRatio, setSharpeRatio] = useState(0);

    const prop_coins = [];

    const BITCOIN_INDEX = 0;
    const ETHEREUM_INDEX = 1;
    const SOLANA_INDEX = 2;

    //if ((props.coins == null) || (props.coins.length == 0) || (props.coins[0] === undefined)) {

    // console.log("props.coins[0] === undefined => USE DEFAULT 5 COINS");
    // useDefaultCoins = true;

    const coin1 = {
        id: 'bitcoin',
        symbol: 'btc'
    };
    prop_coins[BITCOIN_INDEX] = coin1;

    const coin2 = {
        id: 'ethereum',
        symbol: 'eth'
    };
    prop_coins[ETHEREUM_INDEX] = coin2;

    const coin3 = {
        id: 'solana',
        symbol: 'sol'
    };

    prop_coins[SOLANA_INDEX] = coin3;

    // } else {
    //     prop_coins[0] = props.coins[0];
    //     prop_coins[1] = props.coins[1];
    //     prop_coins[2] = props.coins[2];
    // }

    const rawPriceHistory = useState([]);

    //const fullPriceHistories = []; // [[Coin 1 daily prices], [Coin 2 daily prices], ... ]
    const [fullPriceHistories, setFullPriceHistories] = useState([]);
    const [fullDateHistories, setFullDateHistories] = useState([]);

    const fullDailyReturnHistories = []; // [[Coin 1 daily returns], [Coin 2 daily returns], ... ]
    const historicalStdDevs = [];
    const historicalVols = [];

    const historiesLoaded = [false, false, false];
    const historiesLoading = [false, false, false];

    const [chartPrice_Index_BTC, setChartPrice_Index_BTC] = useState({
        title: t("major_coins_index_vs_bitcoin") + "(" + userCurrency.symbol + ")",
        labels: [],
        datasets: [],
    });

    function resetCurrentValues() {
        historiesLoaded[0] = false;
        historiesLoaded[1] = false;
        historiesLoaded[2] = false;

        historiesLoading[0] = false;
        historiesLoading[1] = false;
        historiesLoading[2] = false;
    }

    useEffect(() => {

        resetCurrentValues();

        //console.log("CoinCorrelations useEffect() props.coins = " + JSON.stringify(props.coins, null, 4));
        setLastKnownPrices([0, 0, 0]);

        let current_coin_index = BITCOIN_INDEX;
        doRequestPriceHistoryIfNecessary(current_coin_index);

        current_coin_index = ETHEREUM_INDEX;
        doRequestPriceHistoryIfNecessary(current_coin_index);

        current_coin_index = SOLANA_INDEX;
        doRequestPriceHistoryIfNecessary(current_coin_index);

    }, [userCurrency, i18n.language])

    function doRequestPriceHistoryIfNecessary(coin_index) {
        if (!historiesLoaded[coin_index] && !historiesLoading[coin_index]) {
            doRequestPriceHistory(coin_index);
        } else {
            //console.log("doRequestPriceHistoryIfNecessary() HISTORY ALREADY LOADED FOR " + prop_coins[coin_index].id);
        }
    }

    const doRequestPriceHistory = function (coin_index) {

        const price_history_url = 'https://api.coingecko.com/api/v3/coins/' + prop_coins[coin_index].id + '/market_chart?vs_currency=' + userCurrency.code + '&days=' + full_history_length + '&interval=daily';
        historiesLoading[coin_index] = true;

        axios.get(price_history_url).then((res) => {

            historiesLoaded[coin_index] = true;
            historiesLoading[coin_index] = false;

            let pricesHistoryFromService = res.data.prices;

            if (prop_coins[coin_index].symbol == "btc") {

                console.log("IndexMajorCoinsDetails.doRequest().get().then() RECEIVED BITCOIN HISTORY ! : " + prop_coins[coin_index].symbol + " SIZE = " + res.data.prices.length);
                rawPriceHistory[BITCOIN_INDEX] = pricesHistoryFromService;

            } else if (prop_coins[coin_index].symbol == "eth") {

                console.log("IndexMajorCoinsDetails.doRequest().get().then() RECEIVED ETHEREUM HISTORY ! : " + prop_coins[coin_index].symbol + " SIZE = " + res.data.prices.length);
                rawPriceHistory[ETHEREUM_INDEX] = pricesHistoryFromService;

            } else if (prop_coins[coin_index].symbol == "sol") {

                console.log("IndexMajorCoinsDetails.doRequest().get().then() RECEIVED SOLANA HISTORY ! : " + prop_coins[coin_index].symbol + " SIZE = " + res.data.prices.length);
                rawPriceHistory[SOLANA_INDEX] = pricesHistoryFromService;
            } else {
                console.error("IndexMajorCoinsDetails.doRequest().get().then() UNEXPECTED TOKEN HISTORY ! : " + prop_coins[coin_index].symbol);
                return;
            }

            let pricesHistoryCoin = [];
            let datesHistoryCoin = [];
            let dailyReturnHistory = [];

            let i = 0;
            for (const entry of pricesHistoryFromService) {

                //console.log("CoinDetails.useEffect() entry: " + entry);

                if (entry[1] === undefined) {
                    console.log("CoinCorrelations.doRequest().get().then() i=  " + i + " undefined ");
                } else {

                    datesHistoryCoin[i] = entry[0];
                    pricesHistoryCoin[i] = entry[1];

                    if (i > 0) {
                        dailyReturnHistory[i - 1] = mathjs.log(pricesHistoryCoin[i] / pricesHistoryCoin[i - 1]);
                    }
                    // console.log("CoinCorrelations.doRequest().get().then() labelsHistory[i]: " + labelsHistory[i] + " pricesHistory[i] = " + pricesHistory[i]
                    //     + " dailyReturnHistory[i] = " + dailyReturnHistory[i]);
                }

                i = i + 1;
            }

            let standardDeviation = mathjs.std(pricesHistoryCoin);
            let histoVol = standardDeviation * mathjs.sqrt(365) * 100;

            lastKnownPrices[coin_index] = pricesHistoryCoin[pricesHistoryCoin.length - 1];
            indexComponentVol[coin_index] = histoVol;

            indexComponentPriceHistory[coin_index] = pricesHistoryCoin;

            let historicalStdDev = standardDeviation;

            fullDateHistories[coin_index] = datesHistoryCoin;
            fullPriceHistories[coin_index] = pricesHistoryCoin;
            fullDailyReturnHistories[coin_index] = dailyReturnHistory;
            historicalStdDevs[coin_index] = historicalStdDev;
            historicalVols[coin_index] = histoVol;

            //console.log("IndexMajorCoinsDetails.doRequest().get().then() coin index = " + coin_index + " histoVol = " + histoVol);

            if (isAllHistoriesLoaded()) {
                console.log("IndexMajorCoinsDetails.doRequest().get().then() ALL HISTORIES LOADED !! => PROCEED to index calc " + timeframeDuration + " days");
                //calcCurrentCorrelations();
                calcIndexes();
            } else {
                console.warn("IndexMajorCoinsDetails.doRequest().get().then() HISTORIES MISSING !");
            }
        }).catch((error) => {
            console.log(error);
            historiesLoaded[coin_index] = false;
            historiesLoading[coin_index] = false;
        });
    };

    function calcIndexes() {

        let majorIndexVal = IndexUtils.getIndexVal(lastKnownPrices, majorIndexWeight);
        setMajorIndexValue(majorIndexVal);

        console.log("calcIndexes() Calc majorIndexVal : majorIndexVal = " + majorIndexVal);

        let lastKnownPrices_1d = getComponentPrices_asOf(-1);
        let lastKnownPrices_7d = getComponentPrices_asOf(-7);
        let lastKnownPrices_14d = getComponentPrices_asOf(-14);
        let lastKnownPrices_30d = getComponentPrices_asOf(-30);
        let lastKnownPrices_365d = getComponentPrices_asOf(-364);

        //console.warn("calcIndexes() lastKnownPrices_1d = " + lastKnownPrices_1d);

        let majorIndexVal_1d = IndexUtils.getIndexVal(lastKnownPrices_1d, majorIndexWeight);
        let majorIndexVal_7d = IndexUtils.getIndexVal(lastKnownPrices_7d, majorIndexWeight);
        let majorIndexVal_14d = IndexUtils.getIndexVal(lastKnownPrices_14d, majorIndexWeight);
        let majorIndexVal_30d = IndexUtils.getIndexVal(lastKnownPrices_30d, majorIndexWeight);
        let majorIndexVal_365d = IndexUtils.getIndexVal(lastKnownPrices_365d, majorIndexWeight);

        console.log("calcIndexes() Calc majorIndexVal_365d = " + majorIndexVal_365d);

        let majorIndexVal_1d_change = 100 * (majorIndexVal - majorIndexVal_1d) / majorIndexVal;
        let majorIndexVal_7d_change = 100 * (majorIndexVal - majorIndexVal_7d) / majorIndexVal;
        let majorIndexVal_14d_change = 100 * (majorIndexVal - majorIndexVal_14d) / majorIndexVal;
        let majorIndexVal_30d_change = 100 * (majorIndexVal - majorIndexVal_30d) / majorIndexVal;
        let majorIndexVal_365d_change = 100 * (majorIndexVal - majorIndexVal_365d) / majorIndexVal;

        setMajorIndexValue_1d_percent(majorIndexVal_1d_change);
        setMajorIndexValue_7d_percent(majorIndexVal_7d_change);
        setMajorIndexValue_14d_percent(majorIndexVal_14d_change);
        setMajorIndexValue_30d_percent(majorIndexVal_30d_change);
        setMajorIndexValue_365d_percent(majorIndexVal_365d_change);

        let pricesHistoryIndex = [];
        let datesHistoryIndex = [];

        // Calc index history
        let dailyReturnHistory = [];
        let i = 0;
        for (let i = 0; i < 365; i++) {
            let indexComponentPrices_i = getComponentPrices_asOf(i - 364);
            let indexValue_i = IndexUtils.getIndexVal(indexComponentPrices_i, majorIndexWeight);
            pricesHistoryIndex[i] = indexValue_i;

            if (i > 0) {
                dailyReturnHistory[i - 1] = mathjs.log(pricesHistoryIndex[i] / pricesHistoryIndex[i - 1]);
            }
        }

        setIndexFullPricesHistory(pricesHistoryIndex);

        let standardDeviation = mathjs.std(dailyReturnHistory);

        let histo_vol = standardDeviation * mathjs.sqrt(365) * 100;
        setHistoricalVol(histo_vol);

        let sharpe_ratio = majorIndexVal_365d_change / histo_vol - getRiskFreeRate();
        setSharpeRatio(sharpe_ratio);

        console.log("calcIndexes() Calc histo_vol = " + histo_vol + " sharpe_ratio = " + sharpe_ratio);

        // Chart data
        setChartPrice_Index_BTC({
            title: t("major_coins_index_vs_bitcoin"),
            labels: fullDateHistories[BITCOIN_INDEX].map(function (data) {

                let tickAsString = ChartsUtils.getDateAsTickLabel(data, i18n.language);
                return tickAsString;
            }),
            displayRightAxis: true,
            datasets: [
                {
                    label: t("crypto_major_index_title") + " (" + userCurrency.symbol + ")",
                    data: pricesHistoryIndex,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    yAxisID: 'y',
                },
                {
                    label: t("bitcoin") + " (" + userCurrency.symbol + ")",
                    data: fullPriceHistories[BITCOIN_INDEX],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgb(54, 162, 235, 0.5)',
                    yAxisID: 'y1',
                },
            ],
        });
    }

    function getRiskFreeRate(){

        let result= US_RISK_FREE_RATE;

        if (userCurrency.code == "eur"){
            result = EUR_RISK_FREE_RATE;
        }

        return result;
    }

    function isAllHistoriesLoaded() {

        for (let i = 0; i < historiesLoaded.length; i++) {
            if (!historiesLoaded[i]) {
                return false;
            }
        }

        return true;
    }

    function getMajorIndexValueAsString() {

        if (majorIndexValue > 0) {
            return majorIndexValue.toFixed(2) + " " + userCurrency.symbol;
        } else {
            return "Not available";
        }
    }

    function getVolAsString() {

        if (majorIndexValue > 0) {
            return historicalVol.toFixed(2) + " %";
        } else {
            return "";
        }
    }

    function getSharpeRatioAsString() {

        if (majorIndexValue > 0) {
            return sharpeRatio.toFixed(2);
        } else {
            return "";
        }
    }

    /*
     * dayIndex : 0 => today, -1 => yesterday, -2 => D-2
     */
    function getComponentPrices_asOf(dayIndex) {

        let result = [];

        result[BITCOIN_INDEX] = getValueFromArrayEnd(indexComponentPriceHistory[BITCOIN_INDEX], dayIndex);
        result[ETHEREUM_INDEX] = getValueFromArrayEnd(indexComponentPriceHistory[ETHEREUM_INDEX], dayIndex);
        result[SOLANA_INDEX] = getValueFromArrayEnd(indexComponentPriceHistory[SOLANA_INDEX], dayIndex);
        return result;
    }

    /*
    * index : 0 => last value, -1 => before last value, ...
    */
    function getValueFromArrayEnd(values, index) {

        let result = values[values.length - 1 + index];

        return result;
    }

    return (
        <div>
            <div className='coin-container'>
                <div className='content'>
                    <div className='details_info'>
                        <div className='coin-heading'>
                            <h2>Major coins index</h2>
                        </div>
                        <div className='centered-in-cell'>
                            <div className='coin-price'>
                                <h1>{getMajorIndexValueAsString()}</h1>
                            </div>
                        </div>
                    </div>

                    <div className='details_info'>

                    </div>

                    <div className='historical-vol'>
                        {/*<h3>{t("index_changes")} : </h3>*/}
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>24h</th>
                            <th>{t("7d")}</th>
                            <th>{t("14d")}</th>
                            <th>{t("30d")}</th>
                            <th>{t("1yr")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{majorIndexValue_1d_percent ?
                                <p className={(Math.sign(majorIndexValue_1d_percent) === -1) ? "change_negative" : "change_positive"}>{majorIndexValue_1d_percent.toFixed(1)} %</p> : null}</td>
                            <td>{majorIndexValue_7d_percent ?
                                <p className={(Math.sign(majorIndexValue_7d_percent) === -1) ? "change_negative" : "change_positive"}>{majorIndexValue_7d_percent.toFixed(1)} %</p> : null}</td>
                            <td>{majorIndexValue_14d_percent ?
                                <p className={(Math.sign(majorIndexValue_14d_percent) === -1) ? "change_negative" : "change_positive"}>{majorIndexValue_14d_percent.toFixed(1)} %</p> : null}</td>
                            <td>{majorIndexValue_30d_percent ?
                                <p className={(Math.sign(majorIndexValue_30d_percent) === -1) ? "change_negative" : "change_positive"}>{majorIndexValue_30d_percent.toFixed(1)} %</p> : null}</td>
                            <td>{majorIndexValue_365d_percent ?
                                <p className={(Math.sign(majorIndexValue_365d_percent) === -1) ? "change_negative" : "change_positive"}>{majorIndexValue_365d_percent.toFixed(1)} %</p> : null}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className='content'>

                    <div className='details_info'>
                        <div className='historical-vol'>
                            <h3>{t("index_volatility")} : </h3>
                        </div>
                        <div className='centered-in-cell'>
                            <h1>{getVolAsString()}</h1>
                        </div>
                    </div>
                    <div>
                        {t("calculated_over_last_year")}
                    </div>
                    <div className='details_info'>
                        <div className='historical-vol'>
                            <h3>{t("sharpe_ratio")} : </h3>
                        </div>
                        <div className='centered-in-cell'>
                            <h1>{getSharpeRatioAsString()}</h1>
                        </div>
                        <div>
                            {t("sharpe_ratio_definition")}
                        </div>
                    </div>
                </div>

                <div className='content'>
                    <LineChart2Series chartData={chartPrice_Index_BTC}/>
                </div>
                <div className='content'>
                    <div className='about'>
                        <h3>{t("about")} {t("crypto_major_index_title")}</h3>
                        <p>
                            {t("crypto_major_index_desc")}
                            {t("crypto_major_index_desc_2")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IndexMajorCoinsDetails
