import React from 'react'
import CoinItem from './CoinItem'

import './CoinsTable.css'
import CoinDetails from "../routes/CoinDetails";
import * as MathsUtils from "../util/MathsUtils";
import {Link} from "react-router-dom";

const CoinsTable = (props) => {
    return (
        <div className='container'>
            <div>
                <div className='heading'>
                    <p className='hide-mobile'>#</p>
                    <p className='coin-cell'>Coin</p>
                    <p className={'coin-cell'}>Price</p>
                    <p className={'coin-cell'}>24 h</p>
                    <p className='hide-mobile'>Volume / 24 h</p>
                    <p className='placeholder'></p>
                    <p className='placeholder hide-mobile'></p>
                </div>

                {(props.coins == undefined) &&
                    <div className={'data-not-available'}>
                        <p>
                            Data not available right now.
                            Please retry shortly or click the button below
                        </p>
                        <div>
                            <br/>
                            <Link to={`/coin/bitcoin`} element={<CoinDetails/>}>
                                <p>
                                    <button className={"button_view_chart"}>Bitcoin Chart</button>
                                </p>
                            </Link>
                        </div>
                    </div>}


                {(props.coins != undefined) &&
                    props.coins.map(coin => {
                        return (
                            <CoinItem key={coin.id} coin={coin} spotValue={coin.current_price}
                                      state={{spotValue: coin.current_price}}/>
                        )
                    })
                }

            </div>
        </div>
    )
}

export default CoinsTable
