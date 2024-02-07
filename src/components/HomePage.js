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

    const full_history_length = 5; // Price history for vol calculation

    const [lastKnownPrices, setLastKnownPrices] = useState([]);

    const [majorIndexValue, setMajorIndexValue] = useState(0);

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

            //No vol calc for now
            // let standardDeviation = mathjs.std(pricesHistoryCoin);
            // let histoVol = standardDeviation * mathjs.sqrt(365) * 100;

            lastKnownPrices[coin_index] = pricesHistoryCoin[pricesHistoryCoin.length - 1];

            console.log("HomePage.doRequestPriceHistory().get().then() coin_index = " + coin_index + " price = " + lastKnownPrices[coin_index]);

            if (isAllHistoriesLoaded()) {
                console.log("HomePage.doRequestPriceHistory().get().then() ALL INDEX COMPONENT PRICES LOADED !! => PROCEED to index calculation");
                calcIndexes();
            } else {
                console.warn("HomePage.doRequestPriceHistory().get().then() MISSING INDEX COMPONENT PRICES : " + lastKnownPrices);
                setMajorIndexValue(0);
            }
        }).catch((error) => {
            setMajorIndexValue(0);
            console.log(error);
            historiesLoaded[coin_index] = false;
            historiesLoading[coin_index] = false;
        });
    };

    function calcIndexes() {

        console.warn("calcIndexes() lastKnownPrices = " + lastKnownPrices);

        let majorIndexVal = 0;

        console.log("calcIndexes() Calc majorIndexVal : userCurrency = " + userCurrency);

        majorIndexVal = majorIndexVal + lastKnownPrices[BITCOIN_INDEX] * (majorIndexWeight[BITCOIN_INDEX] / 100);
        majorIndexVal = majorIndexVal + lastKnownPrices[ETHEREUM_INDEX] * (majorIndexWeight[ETHEREUM_INDEX] / 100);
        majorIndexVal = majorIndexVal + lastKnownPrices[SOLANA_INDEX] * (majorIndexWeight[SOLANA_INDEX] / 100);

        setMajorIndexValue(majorIndexVal);
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
            <div className='content'>
                <div className='details_info'>
                    <div className='coin-heading'>
                        <div className='rank'>
                            <div className='rank'>
                                <span className='rank-btn'>{t("crypto_major_index_title")} {userCurrency.symbol}</span>
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
                <div className='centered-in-cell'>
                    {t("crypto_major_index_desc")} {t("crypto_major_index_desc_2")}
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
