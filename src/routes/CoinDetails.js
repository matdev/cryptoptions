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
import {roundToDecimalPlace} from "../util/MathsUtils";
import ReactGA from "react-ga4";
import * as ChartsUtils from "../util/ChartsUtils";

const {parse} = require('rss-to-json');

const mathjs = require('mathjs');

import {useTranslation} from "react-i18next";

const CoinDetails = (props) => {

    const {i18n, t} = useTranslation();

    const location = useLocation();
    const params = useParams();

    let running_on_localhost = false;

    const [rssUrl, setRssUrl] = useState("");
    const [items, setItems] = useState([]);

    const userCurrency = useSelector(store => store.userCurrency.value);
    const [coin, setCoin] = useState({});
    const [spotValue, setSpotValue] = useState(location.state?.spotValue);

    const [pricesHistory, setPricesHistory] = useState([]);
    const [dailyReturnHistory, setDailyReturnHistoryHistory] = useState([]);

    const [historicalVol_30d, setHistoricalVol_30d] = useState(0);

    const [chartData, setChartData] = useState({
        title: "Historical prices (" + userCurrency.symbol + ")",
        labels: [],
        datasets: [
        ],
    });

    const url = `https://api.coingecko.com/api/v3/coins/${params.coinId}`
    //console.log("CoinDetails() url = " + url);

    // URL for retrieving bitcoin daily prices over the last 30 days
    const price_history_url = 'https://api.coingecko.com/api/v3/coins/' + params.coinId + '/market_chart?vs_currency=' + userCurrency.code + '&days=90&interval=daily';

    running_on_localhost = window.location.href.includes("localhost");

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
            ReactGA.send({hitType: "pageview", page: location.pathname, title: pageTitle});

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

            // Chart data
            setChartData({
                title: t("historical_prices") + " (" + userCurrency.symbol + ")",
                labels: pricesHistoryFromService.map(function (data) {
                    let tickAsString = ChartsUtils.getDateAsTickLabel(data[0]);
                    return tickAsString;
                }),
                datasets: [
                    {
                        label: t("historical_prices"),
                        data: pricesHistoryFromService.map((data) => data[1]),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    },
                ],
            });

        }).catch((error) => {
            console.log(error)
        });

        // setRssUrl("https://www.cryptodaily.co.uk/feed");
        //
        // console.log("get RSS feed from " + rssUrl);
        // //axios.get(`https://api.allorigins.win/get?url=${rssUrl}`).then((res) => {
        // axios.get(`${rssUrl}`).then((res) => {
        //
        //     const {contents} = res.json();
        //     const feed = new window.DOMParser().parseFromString(contents, "text/xml");
        //     const items = feed.querySelectorAll("item");
        //
        //     const feedItems = [...items].map((el) => ({
        //         link: el.querySelector("link").innerHTML,
        //         title: el.querySelector("title").innerHTML,
        //         author: el.querySelector("author").innerHTML
        //     }));
        //
        //     setItems(feedItems);
        //
        // }).catch((error) => {
        //     console.log(error)
        // });

        // const res = await fetch();
        // const { contents } = await res.json();
        // const feed = new window.DOMParser().parseFromString(contents, "text/xml");
        // const items = feed.querySelectorAll("item");
        // const feedItems = [...items].map((el) => ({
        //     link: el.querySelector("link").innerHTML,
        //     title: el.querySelector("title").innerHTML,
        //     author: el.querySelector("author").innerHTML
        // }));
        // setItems(feedItems);

    }, [userCurrency])

    function getCoinDescription(){

        if (coin.description == undefined){
            return "";
        }

        console.log("getCoinDescription() i18n.language = " + i18n.language);

        let result = coin.description.en;

        if (i18n.language == 'fr' && i18n.language.fr != undefined){
            result = coin.description.fr;
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
                        <div className='historical-vol'>
                            <h3>{t("historical_volatility")} : </h3>
                        </div>
                        <div className='centered-in-cell'>
                            <h1>{historicalVol_30d.toFixed(2)} %</h1>
                        </div>
                    </div>
                    <div className='details_info'>
                        <div>
                            {t("calculated_over_daily_returns")}
                        </div>
                        <div className='centered-in-cell'>
                            <Link to={`/option-prices/${coin.id}`}
                                  state={{spotValue: spotValue, baseCurrency: userCurrency}}
                                  element={<CoinOptions/>}
                                  key={coin.id}>
                                <p>
                                    <button className={"button_view_option_pricer"}>{t("options_pricer")}</button>
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='content'>
                    <LineChart chartData={chartData}/>
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
