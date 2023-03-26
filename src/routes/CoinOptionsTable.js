import axios from 'axios'
import {useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect, useRef} from 'react'
import CoinDetails from '../routes/CoinDetails'
import {Link} from 'react-router-dom'
import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
import * as DateUtils from '../util/DateUtils';
import * as MathsUtils from '../util/MathsUtils';
import './CoinOptionsTable.css'
import TextField from '@mui/material/TextField';

const CoinOptionsTable = () => {

    const defaultVol = 64; // %
    const defaultRiskFreeRate = 1; // %

    const inputVolRef = useRef();

    useEffect(() => {
        axios.get(url).then((res) => {
            setCoin(res.data)
            // setStrikeN(res.data.market_data.current_price.eur);
            //
            // setIndex(index + 1);
            //
            // console.log("HELLO MAN ! strikeN = " + strikeN);
            // rows[2].strike = strikeN;
            priceAllOptions();
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    const params = useParams();
    const location = useLocation();

    const [coin, setCoin] = useState({});

    const url = `https://api.coingecko.com/api/v3/coins/${params.coinId}`;

    const [index, setIndex] = useState(0);

    //const [strikeN, setStrikeN] = useState(location.state.spotValue);

    let strikeStep = 25;

    if (params.coinId == 'bitcoin'){
        strikeStep = 500;
    }

    // Strikes UP
    let strike_1_UP = (MathsUtils.roundToNextStepUp(location.state.spotValue, strikeStep, strikeStep));
    let strike_2_UP = strike_1_UP + strikeStep;
    let strike_3_UP = strike_2_UP + strikeStep;

    // Strikes DOWN
    let strike_1_DOWN = strike_1_UP - strikeStep;
    let strike_2_DOWN = strike_1_DOWN - strikeStep;
    let strike_3_DOWN = strike_2_DOWN - strikeStep;

    console.log("HEY MAN ! state.spotValue = " + location.state.spotValue + " => strike_1_UP = " + strike_1_UP);
    console.log( " strike_1_DOWN = " + strike_1_DOWN);

    const columns = [
        {key: 'strike', name: 'Strike'},
        {key: 'vol', name: 'Vol Input (%)'},
        {key: 'theo_price', name: 'Theo Price'},
        {key: 'id', name: 'ID'}
    ];

    const initialNearestExpiryOptions = [
        {id: 0, strike: strike_3_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 1, strike: strike_2_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 2, strike: strike_1_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 3, strike: strike_1_UP, vol: defaultVol, theo_price: '0.68'},
        {id: 4, strike: strike_2_UP, vol: defaultVol, theo_price: '0.78'},
        {id: 5, strike: strike_3_UP, vol: defaultVol, theo_price: '0.78'}
    ];

    const initialRows2Months = [
        {id: 0, strike: strike_3_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 1, strike: strike_2_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 2, strike: strike_1_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 3, strike: strike_1_UP, vol: defaultVol, theo_price: '0.68'},
        {id: 4, strike: strike_2_UP, vol: defaultVol, theo_price: '0.78'},
        {id: 5, strike: strike_3_UP, vol: defaultVol, theo_price: '0.78'}
    ];

    const [rows, setRows] = useState(initialNearestExpiryOptions);

    const [rows2MonthsCalls, setRows2MonthsCalls] = useState(initialRows2Months);

    const [isInputVolValid, setIsInputVolValid] = useState(true);

    function priceOTCOption() {
        setIndex(index + 1);
        rows[2].theo_price = index;
        console.log("priceOTCOption() index = " + index)
    }

    function getOptionGrid(rowsParam, columnsParam, setRowsParam) {
        // const [rows, setRows] = useState(rows);
        //
        // return <DataGrid columns={columns} rows={rows} onRowsChange={setRows} />;
        return <DataGrid
            columns={columnsParam}
            rows={rowsParam}
            onRowsChange={setRowsParam}
        />;
    }

    function priceAllOptions() {

        let inputVol = inputVolRef.current.value.replace('%', '');

        // Input vol check
        if (isNaN(inputVol)){

            console.error("Hey ! Input vol is invalid : " + inputVol)
            setIsInputVolValid(false);

        } else if (!MathsUtils.isNumberBetweenMinMax(inputVol)){
            console.error("Hey ! Input vol is out of range : " + inputVol)
            setIsInputVolValid(false);
        }

        //DO PRICING !
        console.log("Hey check OK :) => DO PRICING input vol: " + inputVolRef.current.value)


        // Price CALLS

        // Nearest expiry
        for (var i = 0;  i < rows.length; i++){

            rows[i].vol = inputVol;

            //TODO: BLack & Sholes pricer :)
            rows[i].theo_price = i + 58;
        }

        setIndex(index + 1);
        //rows[2].theo_price = index;
    }

    return (
        <div>
            <div className='coin-container'>
                <div className='content'>
                    <h1>Options on <span className='purple'>{coin.name}</span></h1>
                </div>
                <div className='content'>
                    <div className='info'>
                        <div className='coin-heading'>
                            {coin.image ? <img src={coin.image.small} alt=''/> : null}
                            <h2>{coin.name}</h2><p></p>
                            {coin.symbol ? <h2>{coin.symbol.toUpperCase()}/EUR</h2> : null}
                        </div>
                        <div className='coin-price'>
                            <span className='rank-btn'>Spot</span>
                            {coin.market_data?.current_price ?
                                <h1>{coin.market_data.current_price.eur.toLocaleString()} €</h1> : null}
                        </div>
                    </div>
                    <div>
                        <TextField className='pricing-input-field' id="input-vol" label="Volatility input (%)"
                                   variant="filled" defaultValue={defaultVol} onBlur={priceAllOptions}
                                   error={!isInputVolValid}
                                   inputRef={inputVolRef}   //connecting inputRef property of TextField to the inputVolRef
                        />
                        <TextField className='pricing-input-field' id="input-rate" label="Risk-free rate (%)"
                                   variant="filled" defaultValue={defaultRiskFreeRate}/>

                        {/*<button className={"button_view_options"} onClick={priceOTCOption}>OTC Pricer</button>*/}
                        {/*{index + 1}*/}
                    </div>
                </div>
                <div className='content'>
                    <h2><span className='rank-btn'>CALLS</span> </h2>
                    <br/>
                    {/*<h3>Expiry: 26 May 2023 (in 2 months) {index + 1}</h3>*/}
                    <h3>Expiry: {DateUtils.addDays(new Date(), 2 * 7 + 1).toLocaleDateString()} (in 2 weeks)</h3>
                    <br/>
                    {/*<DataGrid columns={columns} rows={rows}/>;*/}
                    {getOptionGrid(rows, columns, setRows)}

                    <br/><br/>
                    <h3>Expiry: {DateUtils.addMonths(new Date(), 2).toLocaleDateString()} (in 2 months)</h3>
                    <br/>
                    {getOptionGrid(rows2MonthsCalls, columns, setRows2MonthsCalls)}
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
                                <p>{coin.market_data.price_change_percentage_1h_in_currency.eur.toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_24h_in_currency.eur.toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_7d_in_currency.eur.toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_14d_in_currency.eur.toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_30d_in_currency.eur.toFixed(1)}%</p> : null}</td>
                            <td>{coin.market_data?.price_change_percentage_24h_in_currency ?
                                <p>{coin.market_data.price_change_percentage_1y_in_currency.eur.toFixed(1)}%</p> : null}</td>

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
                                    <p>{coin.market_data.low_24h.eur.toLocaleString()} €</p> : null}
                            </div>
                            <div className='row'>
                                <h4>24 Hour High</h4>
                                {coin.market_data?.high_24h ?
                                    <p>{coin.market_data.high_24h.eur.toLocaleString()} €</p> : null}
                            </div>

                        </div>
                        <div className='right'>
                            <div className='row'>
                                <h4>Market Cap</h4>
                                {coin.market_data?.market_cap ?
                                    <p>{coin.market_data.market_cap.eur.toLocaleString()} €</p> : null}
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
                        <Link to={`/coin/${coin.id}`} element={<CoinDetails/>} key={coin.id}>
                            <h3>About {coin.name}</h3>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CoinOptionsTable
