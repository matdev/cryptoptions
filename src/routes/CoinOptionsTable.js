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
import CoinItem from "../components/CoinItem";
import OptionsGrid from "../components/OptionsGrid";
import {adjustToPreviousBusinessDay} from "../util/DateUtils";
import {OptionType} from "../util/PricingUtils";

const CoinOptionsTable = () => {

    const [trigger, setTrigger] = useState(false);

    const defaultVol = 64; // %
    const [inputVol, setInputVol] = useState(defaultVol);

    const defaultRiskFreeRate = 1; // %
    let spotValue = 28000;

    //TEST
    //const currentDate = new Date(2023, 2, 28);
    const currentDate = new Date();

    let oneMonthExpiry;
    let twoWeeksFromNow;
    let twoMonthsExpiry;

    if (currentDate.getDate() < 15) {
        oneMonthExpiry = DateUtils.getLastBusinessDay(currentDate.getFullYear(), currentDate.getMonth());
        twoMonthsExpiry = DateUtils.getLastBusinessDay(oneMonthExpiry.getFullYear(), oneMonthExpiry.getMonth() + 1);
        twoWeeksFromNow = DateUtils.adjustToPreviousBusinessDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 15));
    } else {
        oneMonthExpiry = DateUtils.getLastBusinessDay(currentDate.getFullYear(), currentDate.getMonth() + 1);
        twoWeeksFromNow = DateUtils.adjustToPreviousBusinessDay(new Date(oneMonthExpiry.getFullYear(), oneMonthExpiry.getMonth(), 15));
        twoMonthsExpiry = DateUtils.getLastBusinessDay(oneMonthExpiry.getFullYear(), oneMonthExpiry.getMonth() + 1);
    }

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
        {id: 0, strike: strike_3_DOWN, vol: inputVol, theo_price: ''},
        {id: 1, strike: strike_2_DOWN, vol: inputVol, theo_price: ''},
        {id: 2, strike: strike_1_DOWN, vol: inputVol, theo_price: ''},
        {id: 3, strike: strike_1_UP, vol: inputVol, theo_price: ''},
        {id: 4, strike: strike_2_UP, vol: inputVol, theo_price: ''},
        {id: 5, strike: strike_3_UP, vol: inputVol, theo_price: ''}
    ];

    const initial1MonthOptions = [
        {id: 0, strike: strike_3_DOWN, vol: inputVol, theo_price: '0.68'},
        {id: 1, strike: strike_2_DOWN, vol: inputVol, theo_price: '0.78'},
        {id: 2, strike: strike_1_DOWN, vol: inputVol, theo_price: '0.78'},
        {id: 3, strike: strike_1_UP, vol: inputVol, theo_price: '0.78'},
        {id: 4, strike: strike_2_UP, vol: inputVol, theo_price: '0.78'},
        {id: 5, strike: strike_3_UP, vol: inputVol, theo_price: '0.78'}
    ];

    const initial2MonthsOptions = [
        {id: 0, strike: strike_3_DOWN, vol: inputVol, theo_price: '0.88'},
        {id: 1, strike: strike_2_DOWN, vol: inputVol, theo_price: '0.88'},
        {id: 2, strike: strike_1_DOWN, vol: inputVol, theo_price: '0.88'},
        {id: 3, strike: strike_1_UP, vol: inputVol, theo_price: '0.88'},
        {id: 4, strike: strike_2_UP, vol: inputVol, theo_price: '0.88'},
        {id: 5, strike: strike_3_UP, vol: inputVol, theo_price: '0.88'}
    ];

    const [isInputVolValid, setIsInputVolValid] = useState(true);

    function priceAllOptions() {

        setInputVol(inputVolRef.current.value.replace('%', ''));

        console.log("priceAllOptions() inputVolRef.current.value = " + inputVolRef.current.value);

        // Input vol check
        if (isNaN(inputVol) || (!inputVol)) {
            console.error("Hey ! Input vol is invalid : " + inputVol)
            setIsInputVolValid(false);
            setInputVol(NaN);
        } else if (!MathsUtils.isNumberBetweenMinMax(inputVol)) {
            console.error("Hey ! Input vol is out of range : " + inputVol)
            setIsInputVolValid(false);
        }

        //DO PRICING !
        console.log("Hey check OK :) => DO PRICING input vol: " + inputVolRef.current.value)

        setTrigger(trigger => !trigger);

        setIndex(index + 1);
        //rows2WeeksCalls[2].theo_price = index;
    }


    function getCurrentInputVol() {

        if (!inputVolRef.current) {
            return defaultVol;
        } else {
            return inputVolRef.current.value;
        }
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
                    <OptionsGrid key={OptionType.Call + twoWeeksFromNow} trigger={trigger} optionType={OptionType.Call} spotValue={spotValue}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={twoWeeksFromNow} riskFreeRate={defaultRiskFreeRate}
                                 optionStrikes={initial2WeeksOptions}/>
                    <br/>
                    <br/><br/>
                    <OptionsGrid key={OptionType.Call + oneMonthExpiry} trigger={trigger} optionType={OptionType.Call} spotValue={spotValue}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={oneMonthExpiry} riskFreeRate={defaultRiskFreeRate}
                                 optionStrikes={initial1MonthOptions}/>
                    <br/><br/>
                    <OptionsGrid key={OptionType.Call + twoMonthsExpiry} trigger={trigger} optionType={OptionType.Call} spotValue={spotValue}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={twoMonthsExpiry} riskFreeRate={defaultRiskFreeRate}
                                 optionStrikes={initial2MonthsOptions}/>
                </div>
                <div className='content'>
                    <h2><span className='rank-btn'>PUTS</span></h2>
                    <br/><br/>
                    <OptionsGrid key={OptionType.Put + twoWeeksFromNow} trigger={trigger} optionType={OptionType.Put} spotValue={spotValue}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={twoWeeksFromNow} riskFreeRate={defaultRiskFreeRate}
                                 optionStrikes={initial2WeeksOptions}/>
                    <br/><br/>
                </div>
            </div>
        </div>
    )
}

export default CoinOptionsTable
