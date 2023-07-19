import axios from 'axios'
import {Link, useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect} from 'react'
import DOMPurify from 'dompurify'
import './CoinDetails.css'
import CoinOptions from "./CoinOptions";
import Chart from "chart.js/auto";
import LineChart from "../components/LineChart";
import {useSelector} from 'react-redux';
import * as MathsUtils from "../util/MathsUtils";
import * as RadialBasisNN from "../util/NN_RadialBasis";
import {roundToDecimalPlace} from "../util/MathsUtils";
import ReactGA from "react-ga4";
const mathjs = require('mathjs');

const CoinDetails = (props) => {

    const location = useLocation();
    const params = useParams();

    const userCurrency = useSelector(store => store.userCurrency.value);
    const [coin, setCoin] = useState({});
    const [spotValue, setSpotValue] = useState(location.state?.spotValue);

    const [pricesHistory, setPricesHistory] = useState([]);
    const [dailyReturnHistory, setDailyReturnHistoryHistory] = useState([]);

    const [historicalVol_30d, setHistoricalVol_30d] = useState(0);

    const [priceForecast_24h, setPriceForecast_24h] = useState(location.state?.spotValue);

    const [priceForecast_3d, setPriceForecast_3d] = useState(location.state?.spotValue);

    const [priceForecast_7d, setPriceForecast_7d] = useState(location.state?.spotValue);

    const [priceForecast_14d, setPriceForecast_14d] = useState(location.state?.spotValue);

    const [priceForecast_30d, setPriceForecast_30d] = useState(location.state?.spotValue);

    const [chartData, setChartData] = useState({
        title: "Historical prices (" + userCurrency.symbol + ")",
        labels: [], //testLabels.map((data) => data[0]),
        datasets: [
            {
                label: "price hist INIT",
                data: [], //testValues.map((data) => data[0]),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    });

    const url = `https://api.coingecko.com/api/v3/coins/${params.coinId}`
    //console.log("CoinDetails() url = " + url);

    // URL for retrieving bitcoin daily prices over the last 30 days
    const price_history_url = 'https://api.coingecko.com/api/v3/coins/' + params.coinId + '/market_chart?vs_currency=' + userCurrency.code + '&days=90&interval=daily';

    useEffect(() => {

        axios.get(url).then((res) => {
            setCoin(res.data)
            setSpotValue(res.data.market_data.current_price[userCurrency.code]);

            //console.log("CoinDetails.useEffect() res.data.market_data.current_price : " + res.data.market_data.current_price[userCurrency.code]);
            //console.log("CoinDetails. currency:" + userCurrency.code + " spotValue : " + location.state.spotValue);

            let pageTitle = res.data.name + " Price: " + res.data.symbol.toUpperCase() + " Live Price, forecast and historical chart | CryptOptions"
            document.title = pageTitle;

            // Log view into Google Analytics
            //console.log("useEffect() pathname = " + location.pathname + " pageTitle = " + pageTitle);
            ReactGA.send({ hitType: "pageview", page: location.pathname, title: pageTitle });

        }).catch((error) => {
            console.log(error)
        });

        axios.get(price_history_url).then((res) => {

            //console.log("CoinDetails.useEffect() RECEIVED from price_history_url: " + res.data.prices + " SIZE = " + res.data.prices.length + " pricesHistory = " + pricesHistory);
            let pricesHistoryFromService = res.data.prices;

            let i = 0;
            for (const entry of res.data.prices) {

                //console.log("CoinDetails.useEffect() entry: " + entry);

                if (entry[1] === undefined) {
                    console.log("CoinDetails.useEffect() i=  " + i + " undefined ");
                } else {

                    pricesHistory[i] = entry[1];

                    if (i > 0) {
                        dailyReturnHistory[i - 1] = mathjs.log(pricesHistory[i] / pricesHistory[i - 1]);
                    }
                    // console.log("CoinDetails.useEffect() labelsHistory[i]: " + labelsHistory[i] + " pricesHistory[i] = " + pricesHistory[i]
                    //     + " dailyReturnHistory[i] = " + dailyReturnHistory[i]);
                }

                i = i + 1;
            }

            let standardDeviation_30d = mathjs.std(dailyReturnHistory);

            setHistoricalVol_30d(standardDeviation_30d * mathjs.sqrt(365) * 100);

            //console.log("CoinDetails.useEffect() historicalVol_30d : " + historicalVol_30d + " spotValue = " + spotValue);

            // Price forecast
            // let pricesHistoryInput = RadialBasisNN.sliceTimeSeries(pricesHistory, 5);
            // let priceForecasts = RadialBasisNN.forecastTimeSeries(pricesHistoryInput, 1);

            let priceForecasts = RadialBasisNN.forecastTimeSeries_v2(pricesHistory, 7);

            setPriceForecast_24h(priceForecasts[0]);
            setPriceForecast_3d(priceForecasts[2]);
            setPriceForecast_7d(priceForecasts[6]);

            // setPriceForecast_14d(priceForecasts[13]);
            // setPriceForecast_30d(priceForecasts[29]);

            //console.log("CoinDetails.useEffect() priceForecasts : " + priceForecasts + " length : " + priceForecasts.length);

            // Chart data
            setChartData({
                title: "Historical Price Chart (" + userCurrency.symbol + ")",
                labels: pricesHistoryFromService.map(function (data) {
                    return new Date(data[0]).toLocaleDateString();
                }),
                datasets: [
                    {
                        label: "price history",
                        data: pricesHistoryFromService.map((data) => data[1]),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    },
                ],
            });

        }).catch((error) => {
            console.log(error)
        });
    }, [userCurrency])

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
                                <span className='rank-btn'>Market cap # {coin.market_cap_rank}</span>
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
                    <div className='historical-vol'>
                        <h3>Price forecast : </h3>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>next 24 hours</th>
                            <th>next 3 days</th>
                            <th>next 7 days</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><p>{MathsUtils.roundSmart(priceForecast_24h).toLocaleString()} {userCurrency.symbol}</p></td>
                            <td><p>{MathsUtils.roundSmart(priceForecast_3d).toLocaleString()} {userCurrency.symbol}</p></td>
                            <td><p>{MathsUtils.roundSmart(priceForecast_7d).toLocaleString()} {userCurrency.symbol}</p></td>
                        </tr>
                        <tr>
                            <td><p className={ (Math.sign(MathsUtils.getChangeAsPercent(priceForecast_24h, spotValue)) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(MathsUtils.getChangeAsPercent(priceForecast_24h, spotValue), 1)} %</p></td>
                            <td><p className={ (Math.sign(MathsUtils.getChangeAsPercent(priceForecast_3d, spotValue)) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(MathsUtils.getChangeAsPercent(priceForecast_3d, spotValue), 1)} %</p></td>
                            <td><p className={ (Math.sign(MathsUtils.getChangeAsPercent(priceForecast_7d, spotValue)) === -1) ? "change_negative" : "change_positive"}>{MathsUtils.roundToDecimalPlace(MathsUtils.getChangeAsPercent(priceForecast_7d, spotValue), 1)} %</p></td>
                        </tr>
                        </tbody>
                    </table>

                    <p style={{fontStyle: "italic"}}> Note: These price forecasts are obtained from a model being currently tested. Do not use them to make investment decisions. </p>
                </div>
                <div className='content'>
                    <LineChart chartData={chartData}/>
                </div>
                <div className='content'>
                    <div className='details_info'>
                        <div className='historical-vol'>
                            <h3>Historical Volatility : </h3>
                        </div>
                        <div className='centered-in-cell'>
                            <h1>{historicalVol_30d.toFixed(2)} %</h1>
                        </div>
                    </div>
                    <div className='details_info'>
                        <div>
                            Calculated over the last 90 daily returns
                        </div>
                        <div className='centered-in-cell'>
                            <Link to={`/option-prices/${coin.id}`}
                                  state={{spotValue: spotValue, baseCurrency: userCurrency}}
                                  element={<CoinOptions/>}
                                  key={coin.id}>
                                <p>
                                    <button className={"button_view_option_pricer"}>Options pricer</button>
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='content'>
                    <div className='historical-vol'>
                        <h3>Historical price changes : </h3>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>last 1h</th>
                            <th>24h</th>
                            <th>7d</th>
                            <th>14d</th>
                            <th>30d</th>
                            <th>1yr</th>
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
                                <h4>24 Hour Low</h4>
                                {coin.market_data?.low_24h ?
                                    <p>{coin.market_data.low_24h[userCurrency.code].toLocaleString()} {userCurrency.symbol}</p> : null}
                            </div>
                            <div className='row'>
                                <h4>24 Hour High</h4>
                                {coin.market_data?.high_24h ?
                                    <p>{coin.market_data.high_24h[userCurrency.code].toLocaleString()} {userCurrency.symbol}</p> : null}
                            </div>
                        </div>
                        <div className='right'>
                            <div className='row'>
                                <h4>Market cap</h4>
                                {coin.market_data?.market_cap ?
                                    <p>{MathsUtils.roundToMillionsIfPossible(coin.market_data.market_cap[userCurrency.code])} {userCurrency.symbol}</p> : null}
                            </div>
                            <div className='row'>
                                <h4>Circulating Supply</h4>
                                {coin.market_data ?
                                    <p>{MathsUtils.roundToMillionsIfPossible(coin.market_data.circulating_supply)}</p> : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='content'>
                    <div className='about'>
                        <h3>About {coin.name}</h3>
                        <p dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(coin.description ? coin.description.en : ''),
                        }}>

                        </p>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default CoinDetails
