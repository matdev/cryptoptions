import axios from 'axios'
import {Link, useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect} from 'react'
import DOMPurify from 'dompurify'
import './CoinDetails.css'
import CoinOptionsTable from "./CoinOptionsTable";
import * as CurrencyUtils from "../util/CurrencyUtils";

const CoinDetails = (props) => {

    const location = useLocation();
    const params = useParams();

    const [coin, setCoin] = useState({});
    //const [spotValue, setSpotValue] = useState(getCurrentSpotValue);
    const [spotValue, setSpotValue] = useState(location.state.spotValue);

    const url = `https://api.coingecko.com/api/v3/coins/${params.coinId}`

    //console.log("CoinDetails() url = " + url);

    useEffect(() => {
        axios.get(url).then((res) => {
            setCoin(res.data)
            setSpotValue(res.data.market_data.current_price[location.state.baseCurrency.code]);

            console.log("CoinDetails.useEffect() res.data.market_data.current_price : " + res.data.market_data.current_price[location.state.baseCurrency.code]);
            //console.log("CoinDetails. currency:" + location.state.baseCurrency.code + " spotValue : " + location.state.spotValue);

        }).catch((error) => {
            console.log(error)
        })
    }, [])

    function getCurrentSpotValue() {

        if (!coin.market_data) {
            return NaN;
        } else if (location.state.baseCurrency.code == CurrencyUtils.currencies.EUR.code){
            return coin.market_data.current_price.eur;
        } else if (location.state.baseCurrency.code == CurrencyUtils.currencies.USD.code){
            return coin.market_data.current_price.usd;
        }
    }

    return (
        <div>
            <div className='coin-container'>
                <div className='content'>
                    <h1>{coin.name}
                    </h1>
                    {coin.symbol ? <p className='coin-symbol'> {coin.symbol.toUpperCase()}/{location.state.baseCurrency.label}</p> : null}
                </div>
                <div className='content'>
                    <div className='rank'>
                        <span className='rank-btn'>Rank # {coin.market_cap_rank}</span>
                    </div>
                    <div className='info'>
                        <div className='coin-heading'>
                            {coin.image ? <img src={coin.image.small} alt=''/> : null}
                            <h2>
                                {coin.name}</h2><p></p>
                        </div>
                        <div className='coin-price'>
                            {coin.market_data?.current_price ?
                                <h1>{coin.market_data.current_price[location.state.baseCurrency.code].toLocaleString()} {location.state.baseCurrency.symbol}</h1> : null}
                        </div>
                    </div>
                </div>

                <div className='content'>
                    <table>
                        <thead>
                        <tr>
                            <th>1h</th>
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
                                <p>{coin.market_data.price_change_percentage_1h_in_currency[location.state.baseCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_24h_in_currency[location.state.baseCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_7d_in_currency[location.state.baseCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_14d_in_currency[location.state.baseCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_30d_in_currency[location.state.baseCurrency.code].toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_1y_in_currency[location.state.baseCurrency.code].toFixed(1)}%</p> : null}</td>

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
                                    <p>{coin.market_data.low_24h[location.state.baseCurrency.code].toLocaleString()} {location.state.baseCurrency.symbol}</p> : null}
                            </div>
                            <div className='row'>
                                <h4>24 Hour High</h4>
                                {coin.market_data?.high_24h ?
                                    <p>{coin.market_data.high_24h[location.state.baseCurrency.code].toLocaleString()} {location.state.baseCurrency.symbol}</p> : null}
                            </div>
                            <Link to={`/option-prices/${coin.id}`} state={{spotValue: spotValue, baseCurrency: location.state.baseCurrency}} element={<CoinOptionsTable />}
                                  key={coin.id}>
                                <p>
                                    <button className={"button_view_option_pricer"}>Options pricer</button>
                                </p>
                            </Link>
                        </div>
                        <div className='right'>
                            <div className='row'>
                                <h4>Market Cap</h4>
                                {coin.market_data?.market_cap ?
                                    <p>{coin.market_data.market_cap[location.state.baseCurrency.code].toLocaleString()} {location.state.baseCurrency.symbol}</p> : null}
                            </div>
                            <div className='row'>
                                <h4>Circulating Supply</h4>
                                {coin.market_data ? <p>{coin.market_data.circulating_supply}</p> : null}
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
