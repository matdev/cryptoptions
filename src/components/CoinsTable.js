import React, {useState} from 'react'
import CoinItem from './CoinItem'

import './CoinsTable.css'
import CoinDetails from "../routes/CoinDetails";
import * as MathsUtils from "../util/MathsUtils";
import {Link} from "react-router-dom";
import DataGrid from "react-data-grid";
import {useSelector} from "react-redux";
import MailchimpSubscribe from "react-mailchimp-subscribe"

const CoinsTable = (props) => {

    const mailchimp_url = "https://cryptoptions.us21.list-manage.com/subscribe/post?u=d48a8293e3b5cf0f0002e1dd7&amp;id=585fd685ef&amp;f_id=0098dee6f0";

    const CustomForm = ({status, message, onValidated}) => {
        let email;
        const submit = () =>
            email &&
            email.value.indexOf("@") > -1 &&
            onValidated({
                EMAIL: email.value
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
                        placeholder="Enter your email"
                    />
                    <button className={"email_validation_button"} onClick={submit}>
                        Subscribe
                    </button>
                </div>

                <br/>

                {status === "sending" && <div className={"newsletter_subscription_success"}>sending...</div>}
                {status === "error" && (
                    <div
                        className={"newsletter_subscription_error"}
                        dangerouslySetInnerHTML={{__html: message}}
                    />
                )}
                {status === "success" && (
                    <div
                        className={"newsletter_subscription_success"}
                        dangerouslySetInnerHTML={{__html: message}}
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
                <h2 className='header_title'>Welcome to CryptOptions</h2>
                <h3 className='header_text'>We develop analytics and forecasting methods for cryptocurrencies and their
                    derivatives. We use these methods to provide you with trade ideas and recommendations.
                    <br/>
                    <br/>
                    The CryptOptions newsletter is a quick way to receive buy and sell recommendations based on our
                    forecasting algorithm.
                    <br/>
                    <br/>
                    Subscribe now and receive bitcoin price forecasts soon.
                    <br/>
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
                </div>
                <h2 className='table_title'>Top 5 cryptocurrencies by market cap</h2>
            </div>

            <div>
                <div className='heading'>
                    <p className='hide-mobile'>#</p>
                    <p className='coin-header-cell'>Coin</p>
                    <p className='coin-header-cell'>Price</p>
                    <p className='coin-header-cell'>24 h</p>
                    <p className='hide-mobile'>Volume / 24 h</p>
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
                            This is a beta version, data access is limited.
                            Please retry shortly or click the button below
                        </p>
                        <div className={'data_not_available_buttons'}>
                            <br/>
                            <Link to={`/coin/bitcoin`} element={<CoinDetails/>}>
                                <p>
                                    <button className={"button_view_chart"}>Bitcoin infos</button>
                                </p>
                            </Link>

                            <Link to={`/coin/ethereum`} element={<CoinDetails/>}>
                                <p>
                                    <button className={"button_view_chart"}>Ethereum infos</button>
                                </p>
                            </Link>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default CoinsTable
