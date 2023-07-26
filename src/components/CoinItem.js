import React, {useState} from 'react'

import './CoinsTable.css'
import {Link} from 'react-router-dom'
import CoinDetails from "../routes/CoinDetails";
import CoinOptions from "../routes/CoinOptions";
import {useSelector} from "react-redux";
import * as MathsUtils from "../util/MathsUtils";
var fixedWidthString = require('fixed-width-string');

const CoinItem = (props) => {

    const userCurrency = useSelector(store => store.userCurrency.value);

    const [spotValue, setSpotValue] = useState(props.coin.current_price);

    return (
        <div className='coin-row'>
            <p className='hide-mobile'>{props.coin.market_cap_rank}</p>
            <Link key={props.coin.id + "-symbol"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue}}
                  element={<CoinDetails/>}>
                <div className='img-symbol'>
                    <img src={props.coin.image} alt='' width={50} height={50}/>
                    <p className={'coin-name'}>{fixedWidthString(props.coin.name, 8, { padding: ' ' })}</p>
                </div>
            </Link>
            <Link key={props.coin.id + "-price"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue}}
                  element={<CoinDetails/>}>
                <p className={'coin-cell-price'}>{fixedWidthString(MathsUtils.roundSmart(props.coin.current_price).toLocaleString() + ' ' + userCurrency.symbol, 11, { padding: ' ' })}</p>
            </Link>
            <Link key={props.coin.id + "-change"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue}}
                  element={<CoinDetails/>}>
                <p className={'coin-cell-change-24h'}>{fixedWidthString(props.coin.price_change_percentage_24h.toFixed(2) + ' %',8, { padding: ' ' })}</p>
            </Link>
            <Link key={props.coin.id + "-volume"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue}}
                  element={<CoinDetails/>}>
                <p className='coin-cell-volume-24h hide-mobile'>{fixedWidthString(MathsUtils.roundToMillionsIfPossible(props.coin.total_volume)+ ' ' + userCurrency.symbol, 12, { padding: ' ' })}</p>
            </Link>
            <Link key={props.coin.id + "-chart"} to={`/coin/${props.coin.id}`} state={{spotValue: spotValue}}
                  element={<CoinDetails/>}>
                <p>
                    <button className={"button_view_chart"}>Price infos</button>
                </p>
            </Link>
            <Link key={props.coin.id + "-pricer"} to={`/option-prices/${props.coin.id}`}
                  state={{spotValue: spotValue}}
                  element={<CoinOptions/>}>
                <p>
                    <button className={"button_view_options"}>Options pricer</button>
                </p>
            </Link>

        </div>
    )
}

export default CoinItem
