import React, {useState} from 'react'

import './CoinsTable.css'
import {Link} from 'react-router-dom'
import CoinDetails from "../routes/CoinDetails";
import CoinOptionsTable from "../routes/CoinOptionsTable";

const CoinItem = (props) => {

    const [spotValue, setSpotValue] = useState(props.coins.current_price);

    return (
        <div className='coin-row'>
            <p>{props.coins.market_cap_rank}</p>
            <Link to={`/coin/${props.coins.id}`} element={<CoinDetails/>} key={props.coins.id}>
                <div className='img-symbol'>
                    <img src={props.coins.image} alt=''/>
                    <p className={'coin-name'}>{props.coins.symbol.toUpperCase()}</p>
                </div>
            </Link>
            <p>{props.coins.current_price.toLocaleString()} €</p>
            <p>{props.coins.price_change_percentage_24h.toFixed(2)} %</p>
            <p className='hide-mobile'>{props.coins.total_volume.toLocaleString()} €</p>
            <p className='hide-mobile'>{props.coins.market_cap.toLocaleString()} €</p>
            <Link to={`/option-prices/${props.coins.id}`} state={{spotValue: spotValue}} element={<CoinOptionsTable/>}
                  key={props.coins.id}>
                <p>
                    <button className={"button_view_options"}>Option Prices</button>
                </p>
            </Link>

        </div>
    )
}

export default CoinItem
