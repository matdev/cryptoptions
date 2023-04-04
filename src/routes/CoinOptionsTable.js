import axios from 'axios'
import {useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect, useRef} from 'react'
import CoinDetails from '../routes/CoinDetails'
import {Link} from 'react-router-dom'
import 'react-data-grid/lib/styles.css';
import * as DateUtils from '../util/DateUtils';
import * as MathsUtils from '../util/MathsUtils';
import './CoinOptionsTable.css'
import TextField from '@mui/material/TextField';
import OptionsGrid from "../components/OptionsGrid";
import {OptionType} from "../util/PricingUtils";

const CoinOptionsTable = () => {

    const [trigger, setTrigger] = useState(false);

    const defaultVol = 64; // %
    const [inputVol, setInputVol] = useState(defaultVol);

    const defaultSpot = 28000;
    //const [spotValue, setSpotValue] = useState(defaultSpot);

    const defaultRiskFreeRate = 1; // %

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
    }

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
    }


    function getCurrentInputVol() {

        if (!inputVolRef.current) {
            return defaultVol;
        } else {
            return inputVolRef.current.value;
        }
    }

    function getCurrentSpotValue() {

        if (!location.state) {
            return defaultVol;
        } else {
            return location.state.spotValue;
        }
    }

    function handleKeyPress(event) {

        if (event.key === "Enter") {
            //alert("Enter !");
            priceAllOptions()
        }
    }

    return (
        <div>
            <div className='coin-container'>
                <div className='content'>
                    <h1>Options on
                        <span className='purple'> {coin.name}</span>
                    </h1>
                    {coin.symbol ? <p className='coin-symbol'> {coin.symbol.toUpperCase()}/EUR</p> : null}

                </div>
                <div className='content'>
                    <div className='info'>
                        <div className='coin-heading'>
                            {coin.image ? <img src={coin.image.small} alt=''/> : null}
                            <h2 className='underlined'><Link to={`/coin/${coin.id}`} element={<CoinDetails/>}
                                                             key={coin.id}>
                                {coin.name}</Link></h2>
                        </div>
                        <div className='coin-price'>
                            <span className='spot_label'>Spot</span>
                            {coin.market_data?.current_price ?
                                <h1 className='spot_value'>{coin.market_data.current_price.eur.toLocaleString()} €</h1> : null}
                        </div>
                    </div>
                    <div>
                        <TextField className='vol-input-field' id="input-vol" label="Volatility input (%)"
                                   variant="filled" defaultValue={defaultVol} onBlur={priceAllOptions}
                                   error={!isInputVolValid} inputRef={inputVolRef}
                                   onKeyDown={handleKeyPress}   //connecting inputRef property of TextField to the inputVolRef
                        />
                        <button className={"button_price"} onClick={priceAllOptions} >PRICE ALL</button>
                        <TextField className='risk-free-rate-field' id="input-rate" label="Risk-free rate"
                                   variant="filled" defaultValue={defaultRiskFreeRate + ' %'} disabled={true}/>

                    </div>
                </div>
                <div className='content'>
                    <h2><span className='calls_puts_label'>CALLS</span></h2>
                    <OptionsGrid key={OptionType.Call + twoWeeksFromNow} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentSpotValue()}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={twoWeeksFromNow} riskFreeRate={defaultRiskFreeRate} strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Call + oneMonthExpiry} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentSpotValue()}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={oneMonthExpiry} riskFreeRate={defaultRiskFreeRate} strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Call + twoMonthsExpiry} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentSpotValue()}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={twoMonthsExpiry} riskFreeRate={defaultRiskFreeRate} strikeStep={strikeStep}/>
                </div>
                <div className='content'>
                    <h2><span className='calls_puts_label'>PUTS</span></h2>

                    <OptionsGrid key={OptionType.Put + twoWeeksFromNow} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentSpotValue()}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={twoWeeksFromNow} riskFreeRate={defaultRiskFreeRate}
                                 strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Put + oneMonthExpiry} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentSpotValue()}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={oneMonthExpiry} riskFreeRate={defaultRiskFreeRate}
                                 strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Put + twoMonthsExpiry} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentSpotValue()}
                                 currentDate={currentDate} inputVol={getCurrentInputVol()}
                                 expiry={twoMonthsExpiry} riskFreeRate={defaultRiskFreeRate}
                                 strikeStep={strikeStep}/>
                </div>
            </div>
        </div>
    )
}

export default CoinOptionsTable
