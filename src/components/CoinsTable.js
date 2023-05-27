import React, {useState} from 'react'
import CoinItem from './CoinItem'

import './CoinsTable.css'
import CoinDetails from "../routes/CoinDetails";
import * as MathsUtils from "../util/MathsUtils";
import {Link} from "react-router-dom";
import DataGrid from "react-data-grid";
import {useSelector} from "react-redux";

const CoinsTable = (props) => {

    const userCurrency = useSelector(store => store.userCurrency.value);

    // const columns = [
    //     {key: 'rank', name: '#', width: 35},
    //     {
    //         key: 'coin', name: 'Coin', width: 35, renderCell: (params) => {
    //             console.log(params);
    //             return (
    //                 <>
    //                     <img src={params.value.coin_image} alt='' width={50} height={50}/>
    //                     {params.value.coin_symbol}
    //                 </>
    //             );
    //         }
    //     },
    //     {key: 'price', name: 'Price', width: 35},
    //     {key: 'change_24h', name: '24 h'},
    //     {key: 'volume_24h', name: 'Volume / 24 h'},
    //     {key: 'view_chart', name: '', renderCell: (params) => {
    //             return (
    //                 <strong>
    //                     <Button variant="contained" size="small">
    //                         View Chart
    //                     </Button>
    //                 </strong>
    //             );
    //         }},
    //     {key: 'view_pricer', name: ''}
    // ];
    //
    // const [initialRows, setInitialRows] = useState([]);
    //
    // if (props.coins != null) {
    //
    //     for (let i = 0; i < props.coins.length; i++) {
    //
    //         let coin = props.coins[i];
    //
    //         initialRows[i] = {
    //             rank: coin.market_cap_rank,
    //             // coin: {coin_image: coin.image, coin_symbol: coin.symbol.toUpperCase()},
    //             coin: coin.symbol.toUpperCase(),
    //             price: MathsUtils.roundSmart(coin.current_price).toLocaleString() + ' ' + userCurrency.symbol,
    //             change_24h: coin.price_change_percentage_24h.toFixed(2) + ' %',
    //             volume_24h: MathsUtils.roundToMillionsIfPossible(coin.total_volume),
    //             view_chart: "View Chart"
    //         }
    //     }
    // }

    return (
        <div className='container'>
            <div>

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
                    </div>
                }
            </div>
        </div>
    )
}

export default CoinsTable
