import React, {useState} from 'react'

import './CoinsTable.css'
import {Link, useLocation} from 'react-router-dom'
import CoinDetails from "../routes/CoinDetails";
import CoinOptionsTable from "../routes/CoinOptionsTable";
import * as CurrencyUtils from "../util/CurrencyUtils";

const CoinItem = (props) => {

    const location = useLocation();

    const [spotValue, setSpotValue] = useState(props.coin.current_price);

    return (
        <div className='coin-row'>
            <p className='hide-mobile'>{props.coin.market_cap_rank}</p>
            <Link key={props.coin.id + "-symbol"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue, baseCurrency: props.baseCurrency}} element={<CoinDetails/>}>
                <div className='img-symbol'>
                    <img src={props.coin.image} alt='' width={50} height={50}/>
                    <p className={'coin-name'}>{props.coin.symbol.toUpperCase()}</p>
                </div>
            </Link>
            <Link key={props.coin.id + "-price"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue, baseCurrency: props.baseCurrency}} element={<CoinDetails/>}>
                <p className={'coin-cell-price'}>{props.coin.current_price} {props.baseCurrency.symbol}</p>
            </Link>
            <Link key={props.coin.id + "-change"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue, baseCurrency: props.baseCurrency}} element={<CoinDetails/>}>
                <p className={'coin-cell'}>{props.coin.price_change_percentage_24h.toFixed(2)} %</p>
            </Link>
            <Link key={props.coin.id + "-volume"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue, baseCurrency: props.baseCurrency}} element={<CoinDetails/>}>
                <p className='hide-mobile'>{props.coin.total_volume.toLocaleString().padStart(20, '\xa0')} {props.baseCurrency.symbol}</p>
            </Link>
            <Link key={props.coin.id + "-pricer"} to={`/option-prices/${props.coin.id}`}
                  state={{spotValue: spotValue, baseCurrency: props.baseCurrency}}
                  element={<CoinOptionsTable/>}>
                <p>
                    <button className={"button_view_options"}>Options pricer</button>
                </p>
            </Link>

        </div>
    )
}

export default CoinItem
