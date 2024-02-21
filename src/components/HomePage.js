import React, {useEffect, useState} from 'react'
import CoinItem from './CoinItem'

import './HomePage.css'
import CoinDetails from "../routes/CoinDetails";
import * as MathsUtils from "../util/MathsUtils";
import {Link} from "react-router-dom";
import DataGrid from "react-data-grid";
import {useSelector} from "react-redux";
import MailchimpSubscribe from "react-mailchimp-subscribe"
import {useTranslation} from "react-i18next";
import axios from "axios";
import ReactGA from "react-ga4";

const mathjs = require('mathjs');

const HomePage = (props) => {

    const {i18n, t} = useTranslation();

    const mailchimp_url = "https://cryptoptions.us21.list-manage.com/subscribe/post?u=d48a8293e3b5cf0f0002e1dd7&amp;id=585fd685ef&amp;f_id=0098dee6f0";

    const userCurrency = useSelector(store => store.userCurrency.value);

    const full_history_length = 30; // Price history for vol calculation

    const [lastKnownPrices, setLastKnownPrices] = useState([]);
    const [indexComponentVol, setIndexComponentVol] = useState([]);

    const [indexComponentPriceHistory, setIndexComponentPriceHistory] = useState([]);

    const [majorIndexValue, setMajorIndexValue] = useState(0);
    const [majorIndexValue_1d_percent, setMajorIndexValue_1d_percent] = useState(0);
    const [majorIndexValue_7d_percent, setMajorIndexValue_7d_percent] = useState(0);
    const [majorIndexValue_14d_percent, setMajorIndexValue_14d_percent] = useState(0);
    const [majorIndexValue_30d_percent, setMajorIndexValue_30d_percent] = useState(0);

    const [majorIndexVol, setMajorIndexVol] = useState(0);

    const historiesLoaded = [false, false, false];
    const historiesLoading = [false, false, false];

    const majorIndexWeight = [15, 70, 15];

    const prop_coins = [];

    const BITCOIN_INDEX = 0;
    const ETHEREUM_INDEX = 1;
    const SOLANA_INDEX = 2;

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

    const rawPriceHistory = useState([]);

    console.log("majorIndexValue = " + majorIndexValue);

    useEffect(() => {

        setLastKnownPrices([0, 0, 0]);

        let current_coin_index = 0;
        doRequestPriceHistoryIfNecessary(current_coin_index);

        current_coin_index = 1;
        doRequestPriceHistoryIfNecessary(current_coin_index);

        current_coin_index = 2;
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

                console.log("HomePage.doRequestPriceHistory().get().then() RECEIVED BITCOIN HISTORY ! : " + prop_coins[coin_index].symbol + " SIZE = " + res.data.prices.length);
                rawPriceHistory[BITCOIN_INDEX] = pricesHistoryFromService;

            } else if (prop_coins[coin_index].symbol == "eth") {

                console.log("HomePage.doRequestPriceHistory().get().then() RECEIVED ETHEREUM HISTORY ! : " + prop_coins[coin_index].symbol + " SIZE = " + res.data.prices.length);
                rawPriceHistory[ETHEREUM_INDEX] = pricesHistoryFromService;

            } else if (prop_coins[coin_index].symbol == "sol") {

                console.log("HomePage.doRequestPriceHistory().get().then() RECEIVED SOLANA HISTORY ! : " + prop_coins[coin_index].symbol + " SIZE = " + res.data.prices.length);
                rawPriceHistory[SOLANA_INDEX] = pricesHistoryFromService;
            }

            let pricesHistoryCoin = [];
            let datesHistoryCoin = [];
            let dailyReturnHistory = [];

            let i = 0;
            for (const entry of pricesHistoryFromService) {

                if (entry[1] === undefined) {
                    console.log("HomePage.doRequestPriceHistory().get().then() i=  " + i + " undefined ");
                } else {

                    datesHistoryCoin[i] = entry[0];
                    pricesHistoryCoin[i] = entry[1];

                    if (i > 0) {
                        dailyReturnHistory[i - 1] = mathjs.log(pricesHistoryCoin[i] / pricesHistoryCoin[i - 1]);
                    }
                }

                i = i + 1;
            }

            // Vol calc for now
            let standardDeviation = mathjs.std(pricesHistoryCoin);
            let histoVol = standardDeviation * mathjs.sqrt(365) * 100;

            lastKnownPrices[coin_index] = pricesHistoryCoin[pricesHistoryCoin.length - 1];
            indexComponentVol[coin_index] = histoVol;

            indexComponentPriceHistory[coin_index] = pricesHistoryCoin;

            console.log("HomePage.doRequestPriceHistory().get().then() coin_index = " + coin_index + " indexComponentPriceHistory = " + indexComponentPriceHistory[coin_index]);

            if (isAllHistoriesLoaded()) {
                console.log("HomePage.doRequestPriceHistory().get().then() ALL INDEX COMPONENT PRICES LOADED !! => PROCEED to index calculation");
                calcIndexes();
            } else {
                console.warn("HomePage.doRequestPriceHistory().get().then() MISSING INDEX COMPONENT PRICES : " + lastKnownPrices);
                resetCurrentValues();
            }
        }).catch((error) => {

            resetCurrentValues();

            console.log(error);
            historiesLoaded[coin_index] = false;
            historiesLoading[coin_index] = false;
        });
    };

    function resetCurrentValues(){
        setMajorIndexValue(0);
        setMajorIndexValue_1d_percent(0);
        setMajorIndexValue_7d_percent(0);
        setMajorIndexValue_14d_percent(0);
        setMajorIndexValue_30d_percent(0);
    }

    function calcIndexes() {

        console.warn("calcIndexes() lastKnownPrices = " + lastKnownPrices);

        let majorIndexVal = getIndexVal(lastKnownPrices, majorIndexWeight);
        setMajorIndexValue(majorIndexVal);

        console.log("calcIndexes() Calc majorIndexVal : majorIndexVal = " + majorIndexVal);

        let lastKnownPrices_1d = getComponentPrice_asOf(-1);
        let lastKnownPrices_7d = getComponentPrice_asOf(-7);
        let lastKnownPrices_14d = getComponentPrice_asOf(-14);
        let lastKnownPrices_30d = getComponentPrice_asOf(-30);

        //console.warn("calcIndexes() lastKnownPrices_1d = " + lastKnownPrices_1d);

        let majorIndexVal_1d = getIndexVal(lastKnownPrices_1d, majorIndexWeight);
        let majorIndexVal_7d = getIndexVal(lastKnownPrices_7d, majorIndexWeight);
        let majorIndexVal_14d = getIndexVal(lastKnownPrices_14d, majorIndexWeight);
        let majorIndexVal_30d = getIndexVal(lastKnownPrices_30d, majorIndexWeight);

        console.log("calcIndexes() Calc majorIndexVal_1d : majorIndexVal_1d = " + majorIndexVal_1d);

        let majorIndexVal_1d_change = 100 * (majorIndexVal - majorIndexVal_1d) / majorIndexVal;
        let majorIndexVal_7d_change = 100 * (majorIndexVal - majorIndexVal_7d) / majorIndexVal;
        let majorIndexVal_14d_change = 100 * (majorIndexVal - majorIndexVal_14d) / majorIndexVal;
        let majorIndexVal_30d_change = 100 * (majorIndexVal - majorIndexVal_30d) / majorIndexVal;

        setMajorIndexValue_1d_percent(majorIndexVal_1d_change);
        setMajorIndexValue_7d_percent(majorIndexVal_7d_change);
        setMajorIndexValue_14d_percent(majorIndexVal_14d_change);
        setMajorIndexValue_30d_percent(majorIndexVal_30d_change);
    }

    /*
     * dayIndex : 0 => today, -1 => yesterday, -2 => D-2
     */
    function getComponentPrice_asOf(dayIndex) {
        let result = [];

        result[BITCOIN_INDEX] = getValueFromArrayEnd(indexComponentPriceHistory[BITCOIN_INDEX], dayIndex);
        result[ETHEREUM_INDEX] = getValueFromArrayEnd(indexComponentPriceHistory[ETHEREUM_INDEX], dayIndex);
        result[SOLANA_INDEX] = getValueFromArrayEnd(indexComponentPriceHistory[SOLANA_INDEX], dayIndex);
        return result;
    }

    /*
    * index : 0 => last value, -1 => before last value, ...
    */
    function getValueFromArrayEnd(values, index){

        let result = values[values.length - 1 + index];

        return result;
    }

    function getIndexVal(componentPrices, componentWeight) {

        let indexVal = 0;

        for (let i = 0; i < componentPrices.length; i++) {
            indexVal = indexVal + componentPrices[i] * (componentWeight[i] / 100);
        }

        return indexVal;
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
            return majorIndexValue.toFixed(2);
        } else {
            return "Not available";
        }
    }

// a basic form
    const CustomForm = ({status, message, onValidated}) => {
        let email;
        const submit = () =>
            email &&
            email.value.indexOf("@") > -1 &&
            onValidated({
                EMAIL: email.value,
                LANG: i18n.language
            });

        return (
            <div>

                <div
                    className={"email_validation_form"}
                >
                    <input
                        className={"email_input"}
                        ref={node => (email = node)}
                        type="email"
                        placeholder={t("enter_your_email")}
                    />
                    {/*<br />*/}
                    <button className={"email_validation_button"} onClick={submit}>
                        {t("subscribe")}
                    </button>
                </div>
                <br/>

                {status === "sending" &&
                    <div className={"newsletter_subscription_success"}>{t("mailchimp_sending")}</div>}
                {status === "error" && (
                    <div
                        className={"newsletter_subscription_error"}
                        dangerouslySetInnerHTML={{__html: message}}
                    />
                )}
                {status === "success" && (
                    <div
                        className={"newsletter_subscription_success"}
                        dangerouslySetInnerHTML={{__html: t("mailchimp_success")}}
                    />
                )}

                {status == undefined && (
                    <div
                        className={"newsletter_subscription_success"}
                        dangerouslySetInnerHTML={{__html: "&nbsp;"}}
                    />
                )}

                <br/>
            </div>
        );
    };

    return (
        <div className='container'>

            <div className='header'>
                <br/>
                <h2 className='header_title'>{t("welcome")}</h2>
                <h3 className='header_text'>
                    {t("home_intro_4")}
                </h3>
                <h3 className='header_text'>


                </h3>
            </div>

            <h2 className='table_title'>{t("crypto_index_title")}</h2>
            <div className='coin-container'>
                <div className='content'>
                    <div className='details_info'>
                        <div className='coin-heading'>
                            <div className='rank'>
                                <div className='rank'>
                                    <span
                                        className='rank-btn'>{t("crypto_major_index_title")} {userCurrency.symbol}</span>
                                </div>
                            </div>
                        </div>
                        <div className='centered-in-cell'>
                            <div className='coin-price'>
                                <h1> {getMajorIndexValueAsString()}</h1>
                            </div>

                        </div>
                    </div>
                    <br/>
                    <div className='coin-heading'>
                        <div className='rank'>

                        </div>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>24 h</th>
                            <th>{t("7d")}</th>
                            <th>{t("14d")}</th>
                            <th>{t("30d")}</th>
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
                        </tr>
                        </tbody>
                    </table>
                    <div className='centered-in-cell'>
                        {t("crypto_major_index_desc")} {t("crypto_major_index_desc_2")}
                    </div>
                </div>
            </div>
            <br/>
            <h2 className='table_title'>{t("home_table_title")}</h2>
            <div>
                <div className='heading'>
                    <p className='hide-mobile'>#</p>
                    <p className='coin-header-cell'>{t("coin")}</p>
                    <p className='coin-header-cell'>{t("price")}</p>
                    <p className='coin-header-cell'>24 h</p>
                    <p className='hide-mobile'>{t("volume_24h")}</p>
                    <p className='placeholder'></p>
                    <p className='placeholder hide-mobile'></p>
                </div>

                {(props.coins != undefined) &&
                    props.coins.map(coin => {
                        return (
                            <CoinItem key={coin.id} coin={coin} spotValue={coin.current_price}
                                      state={{spotValue: coin.current_price}}/>
                        )
                    })
                }

                {(props.coins == undefined) &&
                    <div className={'data-not-available'}>
                        <p>
                            {t("data_access_limited")}
                        </p>
                        <div className={'data_not_available_buttons'}>
                            <br/>
                            <Link to={`/coin/bitcoin`} element={<CoinDetails/>}>
                                <p>
                                    <button className={"button_view_chart"}>{t("bitcoin_infos")}</button>
                                </p>
                            </Link>

                            <Link to={`/coin/ethereum`} element={<CoinDetails/>}>
                                <p>
                                    <button className={"button_view_chart"}>{t("ethereum_infos")}</button>
                                </p>
                            </Link>
                        </div>
                    </div>
                }
            </div>
            <div className='header'>
                <br/>
                <h2 className='header_title'></h2>
                <h3 className='header_text'>
                    {t("home_intro_1")}
                    <br/>
                    <br/>
                    {t("home_intro_2")}
                </h3>
                <div className='header_text'>
                    <MailchimpSubscribe
                        url={mailchimp_url}
                        render={({subscribe, status, message}) => (
                            <CustomForm
                                status={status}
                                message={message}
                                onValidated={formData => subscribe(formData)}
                            />
                        )}
                    />
                    <h3 className='header_text'>
                        {t("home_intro_3")}
                    </h3>
                </div>
            </div>


        </div>
    )
}

export default HomePage
