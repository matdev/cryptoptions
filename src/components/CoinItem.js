import React, {useState} from 'react'

import './CoinsTable.css'
import {Link} from 'react-router-dom'
import CoinDetails from "../routes/CoinDetails";
import CoinOptionsTable from "../routes/CoinOptionsTable";

const CoinItem = (props) => {

    const [spotValue, setSpotValue] = useState(props.coins.current_price);

    return (
        <div className='coin-row'>
            <p className='hide-mobile'>{props.coins.market_cap_rank}</p>
            <Link to={`/coin/${props.coins.id}`} element={<CoinDetails/>} key={props.coins.id}>
                <div className='img-symbol'>
                    <img src={props.coins.image} alt='' width={50} height={50}/>
                    <p className={'coin-name'}>{props.coins.symbol.toUpperCase()}</p>
                </div>
            </Link>
            <Link to={`/coin/${props.coins.id}`} element={<CoinDetails/>} key={props.coins.id}>
                <p className={'coin-cell'}>{props.coins.current_price} €</p>
            </Link>
            <Link to={`/coin/${props.coins.id}`} element={<CoinDetails/>} key={props.coins.id}>
                <p className={'coin-cell'}>{props.coins.price_change_percentage_24h.toFixed(2).padStart(8, '\xa0')} %</p>
            </Link>
            <Link to={`/coin/${props.coins.id}`} element={<CoinDetails/>} key={props.coins.id}>
                <p className='hide-mobile'>{props.coins.total_volume.toLocaleString().padStart(20, '\xa0')} €</p>
            </Link>
            <Link to={`/option-prices/${props.coins.id}`} state={{spotValue: spotValue}} element={<CoinOptionsTable/>}
                  key={`${props.coins.id}-options`}>
                <p>
                    <button className={"button_view_options"}>Option pricer</button>
                </p>
            </Link>

        </div>
    )
}

export default CoinItem
