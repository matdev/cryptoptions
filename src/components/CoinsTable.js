import React from 'react'
import CoinItem from './CoinItem'

import './CoinsTable.css'

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
                </div>

                {props.coins.map(coin => {
                    return (
                        <CoinItem key={coin.id} coin={coin} spotValue={coin.current_price} state={{spotValue: coin.current_price}}
                                  baseCurrency={props.baseCurrency} stateChanger={props.stateChanger}/>
                    )
                })}

            </div>
        </div>
    )
}

export default CoinsTable
