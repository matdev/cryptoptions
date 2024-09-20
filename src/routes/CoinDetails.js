import axios from 'axios'
import {Link, useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect} from 'react'
import DOMPurify from 'dompurify'
import './CoinDetails.css'
import CoinOptions from "./CoinOptions";
import LineChart2Series from "../components/LineChart2Series";
import {useSelector} from 'react-redux';
import * as MathsUtils from "../util/MathsUtils";
import {roundToDecimalPlace} from "../util/MathsUtils";
import ReactGA from "react-ga4";
import * as ChartsUtils from "../util/ChartsUtils";
import DurationSwitcher from "../components/DurationSwitcher";
import {useZustandStore, getDailyPriceHistoriesForCurrency} from "../storeZustand";

const {parse} = require('rss-to-json');

const mathjs = require('mathjs');

import {useTranslation} from "react-i18next";

const CoinDetails = (props) => {

    const {i18n, t} = useTranslation();

    const location = useLocation();
    const params = useParams();

    let running_on_localhost = false;

    const full_history_length = 365; // Price history for charts and calculating rolling volatility

    let historiesLoaded = false;
    let historiesLoading = false;

    const DEFAULT_TIMEFRAME_DURATION = 30;

    let timeframeDuration = DEFAULT_TIMEFRAME_DURATION;

    const userCurrency = useSelector(store => store.userCurrency.value);
    const [coin, setCoin] = useState({});
    const [spotValue, setSpotValue] = useState(location.state?.spotValue);

    const [fullPricesHistory, setFullPricesHistory] = useState([]);
    const [fullDatesHistory, setFullDatesHistory] = useState([]);
    const [fullDailyReturnHistory, setFullDailyReturnHistory] = useState([]);

    const [historicalVol, setHistoricalVol] = useState(0);

    // Zustand store
    const zustandStore = useZustandStore();

    const [chartData, setChartData] = useState({
        title: "Historical prices (" + userCurrency.symbol + ")",
        labels: [],
        datasets: [],
    });

    const url = `https://api.coingecko.com/api/v3/coins/${params.coinId}`

    running_on_localhost = window.location.href.includes("localhost");

    const handleTimeframeDurationChange = (e) => {
        //e.preventDefault();
        const newVal = e.target.value;
        console.log("handleTimeframeDurationChange() newVal = " + newVal);
        timeframeDuration = parseInt(newVal);
        calcCurrentValues(fullDailyReturnHistory, fullDatesHistory, fullPricesHistory);
    };

    useEffect(() => {

        const coinFromStore = zustandStore.symbolToCoinMap.get(params.coinId);

        if (coinFromStore != undefined) {
            console.log("useEffect() COIN ALREADY IN STORE :  " + coinFromStore.name + " current price = " + coinFromStore.market_data.current_price[userCurrency.code]);
            handleCoinData(coinFromStore);
            doRequestPriceHistoryIfNecessary();
        } else {
            console.log("useEffect() UNKNOWN COIN IN STORE params.coinId = " + params.coinId + " => FETCHING DATA FROM coingecko.com ...");
            axios.get(url).then((res) => {

                zustandStore.updateSymbolToCoinMap(params.coinId, res.data);

                handleCoinData(res.data);

                doRequestPriceHistoryIfNecessary();

            }).catch((error) => {
                console.log(error)

                // Even though there was an error, price history might be in the store => try using it
                doRequestPriceHistoryIfNecessary();
            });
        }

    }, [userCurrency, i18n.language])

    function handleCoinData(coinData){
        setCoin(coinData)
        setSpotValue(coinData.market_data.current_price[userCurrency.code]);
        let pageTitle = coinData.name + " Price: " + coinData.symbol.toUpperCase() + " Live Price, forecast and historical chart | CryptOptions"
        document.title = pageTitle;
        // Log view into Google Analytics
        //console.log("useEffect() pathname = " + location.pathname + " pageTitle = " + pageTitle);
        ReactGA.send({hitType: "pageview", page: location.pathname, title: pageTitle});
    }

    function doRequestPriceHistoryIfNecessary() {
        if (!historiesLoaded && !historiesLoading) {
            doRequestPriceHistory();
        } else {
            //console.log("doRequestPriceHistoryIfNecessary() HISTORY ALREADY LOADED FOR " + prop_coins[coin_index].id);
        }
    }

    const doRequestPriceHistory = function () {

        console.log("doRequestPriceHistory() params.coinId = " + params.coinId);

        const historyForCurrency = getDailyPriceHistoriesForCurrency(userCurrency.code);

        const priceHist = historyForCurrency.get(params.coinId);

        if ((priceHist != undefined) && (priceHist != NaN)) {

            console.log("doRequestPriceHistory() RAW HISTORY ALREADY STORED IN ZUSTAND STORE");// + priceHist);

            historiesLoaded = true;
            historiesLoading = false;

            processRawHistory(priceHist);

        } else {

            console.log("doRequestPriceHistory() UNKNOWN COIN HISTORY IN STORE params.coinId = " + params.coinId + " => FETCHING DATA FROM coingecko.com ...");

            const price_history_url = 'https://api.coingecko.com/api/v3/coins/' + params.coinId + '/market_chart?vs_currency=' + userCurrency.code + '&days=' + full_history_length + '&interval=daily';
            historiesLoading = true;

            axios.get(price_history_url).then((res) => {

                historiesLoaded = true;
                historiesLoading = false;

                let pricesHistoryFromService = res.data.prices;

                processRawHistory(pricesHistoryFromService);

            }).catch((error) => {
                console.log(error);
                historiesLoaded = false;
                historiesLoading = false;
            });

        }
    };

    function processRawHistory(pricesHistoryFromService) {

        let pricesHistoryCoin = [];
        let datesHistoryCoin = [];
        let dailyReturnHistory = [];

        let i = 0;
        for (const entry of pricesHistoryFromService) {

            //console.log("CoinDetails.useEffect() entry: " + entry);

            if (entry[1] === undefined) {
                console.log("CoinCorrelations.processRawHistory =  " + i + " undefined ");
            } else {

                datesHistoryCoin[i] = entry[0];
                pricesHistoryCoin[i] = entry[1];

                if (i > 0) {
                    dailyReturnHistory[i - 1] = mathjs.log(pricesHistoryCoin[i] / pricesHistoryCoin[i - 1]);
                }
                // console.log("CoinDetails.processRawHistory() datesHistoryCoin[i]: " + datesHistoryCoin[i]
                //     + " pricesHistoryCoin[i] = " + pricesHistoryCoin[i]
                //     + " dailyReturnHistory[i] = " + dailyReturnHistory[i - 1]);
            }

            i = i + 1;
        }

        setFullDatesHistory(datesHistoryCoin);
        setFullPricesHistory(pricesHistoryCoin);
        setFullDailyReturnHistory(dailyReturnHistory);

        calcCurrentValues(dailyReturnHistory, datesHistoryCoin, pricesHistoryCoin);
    }

    function calcCurrentValues(dailyReturnHistory, datesHistoryCoin, pricesHistoryCoin) {

        let dailyReturnsSubset = ChartsUtils.getEndOfTimeSeries(dailyReturnHistory, dailyReturnHistory.length - timeframeDuration);

        //console.log("CoinDetails.calcCurrentValues() pricesHistoryCoin = " + pricesHistoryCoin);

        let standardDeviation = mathjs.std(dailyReturnsSubset);

        let histoVol = standardDeviation * mathjs.sqrt(365) * 100;
        let historicalStdDev = standardDeviation;

        setHistoricalVol(histoVol);

        let rollingVolHistory = getRollingVolatility(dailyReturnHistory);
        //console.log("CoinDetails.calcCurrentValues() = " + rollingVolHistory);

        // Chart data
        setChartData({
            title: t("historical_prices_and_vol"),
            labels: datesHistoryCoin.map(function (data) {

                let tickAsString = ChartsUtils.getDateAsTickLabel(data, i18n.language);
                return tickAsString;
            }),
            displayRightAxis: true,
            datasets: [
                {
                    label: t("price") + " (" + userCurrency.symbol + ")",
                    data: pricesHistoryCoin,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    yAxisID: 'y',
                },
                {
                    label: t("volatility") + " (%)",
                    data: rollingVolHistory,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgb(54, 162, 235, 0.5)',
                    yAxisID: 'y1',
                },
            ],
        });
    }

    function getRollingVolatility(dailyReturnsHistory) {

        console.info("getRollingVolatility() timeframeDuration = " + timeframeDuration);

        let result = [];

        let startIndex = timeframeDuration;

        let j = 0;

        for (let i = startIndex; i < dailyReturnsHistory.length; i++) {

            let from = i - startIndex;
            let to = i;

            let dailyReturnsSubset = dailyReturnsHistory.slice(from, to);

            let standardDeviation = mathjs.std(dailyReturnsSubset);
            let histoVol = standardDeviation * mathjs.sqrt(365) * 100;

            let resultIndex = j + startIndex;
            result[resultIndex] = histoVol;

            j = j + 1;
        }

        //console.log("getRollingCorrelations() result : " + result);
        return result;
    }

    function getCoinDescription() {

        if (coin.description == undefined) {
            return "";
        }

        //console.log("getCoinDescription() i18n.language = " + i18n.language);

        let result = coin.description.en;

        if (i18n.language == 'fr' && i18n.language.fr != undefined) {
            result = coin.description.fr;
        } else if (i18n.language == 'es' && i18n.language.es != undefined) {
            result = coin.description.es;
        }

        return result;
    }

    return (
        <div>
            <div className='coin-container'>
                <div className='content'>
                    <div className='details_info'>
                        <div className='coin-heading'>
                            {coin.image ? <img src={coin.image.small} alt=''/> : null}
                            <h2>
                                {coin.name}</h2>
                            {coin.symbol ?
                                <p className='coin-symbol'> {coin.symbol.toUpperCase()}</p> : null}
                        </div>
                        <div className='centered-in-cell'>
                            <div className='rank'>
                                <span className='rank-btn'>{t("market_cap")} # {coin.market_cap_rank}</span>
                            </div>
                        </div>
                    </div>
                    <div className='details_info'>
                        <div className='coin-price'>
                            {coin.market_data?.current_price ?
                                <h1>{coin.market_data.current_price[userCurrency.code].toLocaleString()} {userCurrency.symbol}</h1> : null}
                        </div>
                    </div>
                </div>

                <div className='content'>

                    <div className='details_info'>
                        <Link to={`/option-prices/${coin.id}`}
                              state={{spotValue: spotValue, baseCurrency: userCurrency}}
                              element={<CoinOptions/>}
                              key={coin.id}>
                            <button className={"button_view_option_pricer"}>{t("options_pricer")}</button>
                        </Link>
                    </div>
                </div>
                <div className='content'>
                    <div className='details_info'>
                        <div className='historical-vol'>
                            <h3>{t("historical_volatility")} : </h3>
                        </div>
                        <div className='centered-in-cell'>
                            <h1>{historicalVol.toFixed(2)} %</h1>
                        </div>
                    </div>
                    <div className='details_info'>
                        <div>
                            {t("calculated_over_daily_returns")}
                        </div>
                    </div>
                    <div className='details_info'>
                        <DurationSwitcher handleChangeCallback={handleTimeframeDurationChange}
                                          defaultDuration={timeframeDuration}/>
                    </div>
                </div>
                <div className='content'>
                    <LineChart2Series chartData={chartData}/>
                </div>
                <div className='content'>
                    <div className='historical-vol'>
                        <h3>{t("historical_price_changes")} : </h3>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>{t("last_1h")}</th>
                            <th>24h</th>
                            <th>{t("7d")}</th>
                            <th>{t("14d")}</th>
                            <th>{t("30d")}</th>
                            <th>{t("1yr")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{coin.market_data?.price_change_percentage_1h_in_currency ?
                                <p className={(Math.sign(coin.market_data.price_change_percentage_1h_in_currency[userCurrency.code]) === -1) ? "change_negative" : "change_positive"}>{coin.market_data.price_change_percentage_1h_in_currency[userCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p className={(Math.sign(coin.market_data.price_change_percentage_24h_in_currency[userCurrency.code]) === -1) ? "change_negative" : "change_positive"}>{coin.market_data.price_change_percentage_24h_in_currency[userCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p className={(Math.sign(coin.market_data.price_change_percentage_7d_in_currency[userCurrency.code]) === -1) ? "change_negative" : "change_positive"}>{coin.market_data.price_change_percentage_7d_in_currency[userCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p className={(Math.sign(coin.market_data.price_change_percentage_14d_in_currency[userCurrency.code]) === -1) ? "change_negative" : "change_positive"}>{coin.market_data.price_change_percentage_14d_in_currency[userCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p className={(Math.sign(coin.market_data.price_change_percentage_30d_in_currency[userCurrency.code]) === -1) ? "change_negative" : "change_positive"}>{coin.market_data.price_change_percentage_30d_in_currency[userCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p className={(Math.sign(coin.market_data.price_change_percentage_1y_in_currency[userCurrency.code]) === -1) ? "change_negative" : "change_positive"}>{coin.market_data.price_change_percentage_1y_in_currency[userCurrency.code].toFixed(1)}%</p> : null}</td>

                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className='content'>
                    <div className='stats'>
                        <div className='left'>
                            <div className='row'>
                                <h4>{t("24_hour_low")}</h4>
                                {coin.market_data?.low_24h ?
                                    <p>{coin.market_data.low_24h[userCurrency.code].toLocaleString()} {userCurrency.symbol}</p> : null}
                            </div>
                            <div className='row'>
                                <h4>{t("24_hour_high")}</h4>
                                {coin.market_data?.high_24h ?
                                    <p>{coin.market_data.high_24h[userCurrency.code].toLocaleString()} {userCurrency.symbol}</p> : null}
                            </div>
                        </div>
                        <div className='right'>
                            <div className='row'>
                                <h4>{t("market_cap")}</h4>
                                {coin.market_data?.market_cap ?
                                    <p>{MathsUtils.roundToMillionsIfPossible(coin.market_data.market_cap[userCurrency.code])} {userCurrency.symbol}</p> : null}
                            </div>
                            <div className='row'>
                                <h4>{t("circulating_supply")}</h4>
                                {coin.market_data ?
                                    <p>{MathsUtils.roundToMillionsIfPossible(coin.market_data.circulating_supply)}</p> : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='content'>
                    <div className='about'>
                        <h3>{t("about")} {coin.name}</h3>
                        <p dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(getCoinDescription()),
                        }}>

                        </p>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default CoinDetails
