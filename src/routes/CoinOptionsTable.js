import axios from 'axios'
import {useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect, useRef} from 'react'
import CoinDetails from '../routes/CoinDetails'
import {Link} from 'react-router-dom'
import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
import * as DateUtils from '../util/DateUtils';
import * as MathsUtils from '../util/MathsUtils';
import * as PricingUtils from '../util/PricingUtils';
import './CoinOptionsTable.css'
import TextField from '@mui/material/TextField';

const CoinOptionsTable = () => {

    const defaultVol = 64; // %
    const defaultRiskFreeRate = 1; // %
    const currentDate = new Date();
    let spotValue = 28000;

    let oneMonthExpiry = DateUtils.getLastBusinessDay(currentDate.getFullYear(), currentDate.getMonth() + 1);
    let twoWeeksExpiry = DateUtils.addDays(oneMonthExpiry, -14);
    let twoMonthsExpiry = DateUtils.addMonths(oneMonthExpiry, 1);

    const inputVolRef = useRef();

    useEffect(() => {
        axios.get(url).then((res) => {
            setCoin(res.data)
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

    let strikeStep = 25;

    if (params.coinId == 'bitcoin') {
        strikeStep = 500;

        if (location.state == null) {
            console.warn(params.coinId + " location.state is null => use default");
            spotValue = 28000;
        } else {
            spotValue = location.state.spotValue;
        }
    }

    // Strikes UP
    let strike_1_UP = (MathsUtils.roundToNextStepUp(spotValue, strikeStep, strikeStep));
    let strike_2_UP = strike_1_UP + strikeStep;
    let strike_3_UP = strike_2_UP + strikeStep;

    // Strikes DOWN
    let strike_1_DOWN = strike_1_UP - strikeStep;
    let strike_2_DOWN = strike_1_DOWN - strikeStep;
    let strike_3_DOWN = strike_2_DOWN - strikeStep;

    console.log("spotValue = " + spotValue + " => strike_1_UP = " + strike_1_UP);
    console.log(" strike_1_DOWN = " + strike_1_DOWN);

    const columns = [
        {key: 'strike', name: 'Strike'},
        {key: 'vol', name: 'Vol Input (%)'},
        {key: 'theo_price', name: 'Theo Price'},
        {key: 'id', name: 'ID'}
    ];

    const initial2WeeksOptions = [
        {id: 0, strike: strike_3_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 1, strike: strike_2_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 2, strike: strike_1_DOWN, vol: defaultVol, theo_price: '0.58'},
        {id: 3, strike: strike_1_UP, vol: defaultVol, theo_price: '0.68'},
        {id: 4, strike: strike_2_UP, vol: defaultVol, theo_price: '0.78'},
        {id: 5, strike: strike_3_UP, vol: defaultVol, theo_price: '0.78'}
    ];

    const initial1MonthOptions = [
        {id: 0, strike: strike_3_DOWN, vol: defaultVol, theo_price: '0.68'},
        {id: 1, strike: strike_2_DOWN, vol: defaultVol, theo_price: '0.78'},
        {id: 2, strike: strike_1_DOWN, vol: defaultVol, theo_price: '0.78'},
        {id: 3, strike: strike_1_UP, vol: defaultVol, theo_price: '0.78'},
        {id: 4, strike: strike_2_UP, vol: defaultVol, theo_price: '0.78'},
        {id: 5, strike: strike_3_UP, vol: defaultVol, theo_price: '0.78'}
    ];

    const initial2MonthsOptions = [
        {id: 0, strike: strike_3_DOWN, vol: defaultVol, theo_price: '0.88'},
        {id: 1, strike: strike_2_DOWN, vol: defaultVol, theo_price: '0.88'},
        {id: 2, strike: strike_1_DOWN, vol: defaultVol, theo_price: '0.88'},
        {id: 3, strike: strike_1_UP, vol: defaultVol, theo_price: '0.88'},
        {id: 4, strike: strike_2_UP, vol: defaultVol, theo_price: '0.88'},
        {id: 5, strike: strike_3_UP, vol: defaultVol, theo_price: '0.88'}
    ];

    const [rows2WeeksCalls, setRows2WeeksCalls] = useState(initial2WeeksOptions);

    const [rows1MonthCalls, setRows1MonthCalls] = useState(initial1MonthOptions);

    const [rows2MonthsCalls, setRows2MonthsCalls] = useState(initial2MonthsOptions);

    const [isInputVolValid, setIsInputVolValid] = useState(true);

    function getOptionGrid(rowsParam, columnsParam, setRowsParam) {
        // const [rows2WeeksCalls, setRows] = useState(rows2WeeksCalls);
        //
        // return <DataGrid columns={columns} rows2WeeksCalls={rows2WeeksCalls} onRowsChange={setRows} />;
        return <DataGrid
            columns={columnsParam}
            rows={rowsParam}
            onRowsChange={setRowsParam}
        />;
    }

    function priceAllOptions() {

        let inputVol = inputVolRef.current.value.replace('%', '');

        // Input vol check
        if (isNaN(inputVol) || (!inputVol)) {
            console.error("Hey ! Input vol is invalid : " + inputVol)
            setIsInputVolValid(false);
            inputVol = NaN;
        } else if (!MathsUtils.isNumberBetweenMinMax(inputVol)) {
            console.error("Hey ! Input vol is out of range : " + inputVol)
            setIsInputVolValid(false);
        }

        //DO PRICING !
        console.log("Hey check OK :) => DO PRICING input vol: " + inputVolRef.current.value)


        // Pricing CALLS

        // 2 weeks expiry
        for (var i = 0; i < rows2WeeksCalls.length; i++) {

            rows2WeeksCalls[i].vol = inputVol;
            let theoPrice = PricingUtils.priceCall(currentDate, oneMonthExpiry, rows2WeeksCalls[i].strike, spotValue, defaultRiskFreeRate / 100, rows2WeeksCalls[i].vol / 100);

            //TODO: Display delta + hide ID column
            rows2WeeksCalls[i].theo_price = theoPrice.toFixed(2);
        }

        // 1 months expiry
        for (var i = 0; i < rows1MonthCalls.length; i++) {

            rows1MonthCalls[i].vol = inputVol;
            let theoPrice = PricingUtils.priceCall(currentDate, oneMonthExpiry, rows1MonthCalls[i].strike, spotValue, defaultRiskFreeRate / 100, rows1MonthCalls[i].vol / 100);
            rows1MonthCalls[i].theo_price = theoPrice.toFixed(2);
        }

        // 2 months expiry
        for (var i = 0; i < rows2MonthsCalls.length; i++) {

            rows2MonthsCalls[i].vol = inputVol;
            let theoPrice = PricingUtils.priceCall(currentDate, oneMonthExpiry, rows2MonthsCalls[i].strike, spotValue, defaultRiskFreeRate / 100, rows2MonthsCalls[i].vol / 100);
            rows2MonthsCalls[i].theo_price = theoPrice.toFixed(2);
        }

        setIndex(index + 1);
        //rows2WeeksCalls[2].theo_price = index;
    }


    return (
        <div>
            <div className='coin-container'>
                <div className='content'>
                    <h1>Options on
                        <span className='purple'> {coin.name}</span>
                    </h1>
                </div>
                <div className='content'>
                    <div className='info'>
                        <div className='coin-heading'>
                            {coin.image ? <img src={coin.image.small} alt=''/> : null}
                            <h2 className='underlined'><Link to={`/coin/${coin.id}`} element={<CoinDetails/>}
                                                             key={coin.id}>
                                {coin.name}</Link></h2><p></p>
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
                                   variant="filled" defaultValue={defaultRiskFreeRate} disabled={true}/>

                        {/*<button className={"button_view_options"} onClick={priceOTCOption}>OTC Pricer</button>*/}
                        {/*{index + 1}*/}
                    </div>
                </div>
                <div className='content'>
                    <h2><span className='rank-btn'>CALLS</span></h2>
                    <br/>
                    <h3>Expiry: {twoWeeksExpiry.toLocaleDateString()} (in 2 weeks)</h3>
                    <br/>
                    {getOptionGrid(rows2WeeksCalls, columns, setRows2WeeksCalls)}
                    <br/><br/>
                    <h3>Expiry: {oneMonthExpiry.toLocaleDateString()} (in 1 month)</h3>
                    <br/>
                    {getOptionGrid(rows1MonthCalls, columns, setRows1MonthCalls)}
                    <br/><br/>
                    <h3>Expiry: {twoMonthsExpiry.toLocaleDateString()} (in 2 months)</h3>
                    <br/>
                    {getOptionGrid(rows2MonthsCalls, columns, setRows2MonthsCalls)}
                </div>
                <div className='content'>
                    <h2><span className='rank-btn'>PUTS</span></h2>
                    <br/>
                    <h3>TODO</h3>
                </div>
            </div>
        </div>
    )
}

export default CoinOptionsTable
