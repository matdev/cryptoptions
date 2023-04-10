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
const mathjs = require('mathjs')

const CoinOptionsTable = () => {

    const params = useParams();
    const location = useLocation();

    const [trigger, setTrigger] = useState(false);

    // As of date
    const currentDate = new Date();
    //TEST
    //const asOfDate = new Date(2023, 2, 28);
    const asOfDate = new Date();

    // Vol
    const defaultVol = 64; // %
    const [inputVol, setInputVol] = useState(defaultVol);

    // Risk-free rate
    const defaultRiskFreeRate = 1; // %
    const [inputRate, setInputRate] = useState(defaultRiskFreeRate);

    // Spot
    const defaultSpot = getCurrentSpotValue();
    const [inputSpot, setInputSpot] = useState(defaultSpot);
    const [inputAsOfDate, setInputAsOfDate] = useState(currentDate);

    let oneMonthExpiry;
    let twoWeeksFromNow;
    let twoMonthsExpiry;

    if (asOfDate.getDate() < 15) {
        oneMonthExpiry = DateUtils.getLastBusinessDay(asOfDate.getFullYear(), asOfDate.getMonth());
        twoMonthsExpiry = DateUtils.getLastBusinessDay(oneMonthExpiry.getFullYear(), oneMonthExpiry.getMonth() + 1);
        twoWeeksFromNow = DateUtils.adjustToPreviousBusinessDay(new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 15));
    } else {
        oneMonthExpiry = DateUtils.getLastBusinessDay(asOfDate.getFullYear(), asOfDate.getMonth() + 1);
        twoWeeksFromNow = DateUtils.adjustToPreviousBusinessDay(new Date(oneMonthExpiry.getFullYear(), oneMonthExpiry.getMonth(), 15));
        twoMonthsExpiry = DateUtils.getLastBusinessDay(oneMonthExpiry.getFullYear(), oneMonthExpiry.getMonth() + 1);
    }

    const inputVolRef = useRef();
    const inputSpotRef = useRef();
    const inputAsOfDateRef = useRef();
    const inputRateRef = useRef();

    useEffect(() => {
        axios.get(url).then((res) => {
            setCoin(res.data)
            checkInputValues();
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    const [coin, setCoin] = useState({});

    const url = `https://api.coingecko.com/api/v3/coins/${params.coinId}`;

    const [index, setIndex] = useState(0);

    let strikeStep = 25;

    if (params.coinId == 'bitcoin') {
        strikeStep = 1000;
    } else if (params.coinId == 'ethereum') {
        strikeStep = 25;
    }

    if (getCurrentSpotValue() < 200) {
        strikeStep = mathjs.round(getCurrentSpotValue() / 10, 1);
    }

    console.log("CoinOptionsTable: strikeStep = " + strikeStep);

    const [isInputVolValid, setIsInputVolValid] = useState(true);
    const [isInputSpotValid, setIsInputSpotValid] = useState(true);
    const [isInputAsOfDateValid, setIsInputAsOfDateValid] = useState(true);
    const [isInputRateValid, setIsInputRateValid] = useState(true);

    function checkInputValues() {


        var fromDate = DateUtils.toDate(inputAsOfDateRef.current.value);

        console.log("checkInputValues() inputAsOfDateRef.current.value = " + inputAsOfDateRef.current.value
            + " fromDate = " + fromDate);

        // Check input asOfDate
        if (isNaN(fromDate) || (!fromDate)) {
            console.error("CoinOptionsTable.checkInputValues() ERROR : Input AsOfDate is invalid : " + fromDate)
            setIsInputAsOfDateValid(false);
            setInputAsOfDate(NaN);
        } else {
            setIsInputAsOfDateValid(true);
            setInputAsOfDate(fromDate);
        }

        // Check input spot
        let inputSpot = Number(inputSpotRef.current.value);

        if (isNaN(inputSpot) || (!inputSpot)) {
            console.error("CoinOptionsTable.checkInputValues() ERROR : Input spot is invalid : " + inputSpot)
            setIsInputSpotValid(false);
            setInputSpot(NaN);
        } else if (inputSpot < 0) {
            console.error("CoinOptionsTable.checkInputValues() ERROR: Input spot is out of range : " + inputSpot)
            setIsInputSpotValid(false);
            setInputSpot(NaN);
        } else {
            setIsInputSpotValid(true);
            setInputSpot(inputSpot);
        }

        // Check input vol
        let inputVol = Number(inputVolRef.current.value.replace('%', ''));

        if (isNaN(inputVol) || (!inputVol)) {
            console.error("CoinOptionsTable.checkInputValues() ERROR : Input vol is invalid : " + inputVol)
            setIsInputVolValid(false);
            setInputVol(NaN);
        } else if (!MathsUtils.isNumberBetweenMinMax(inputVol, 0, 100)) {
            console.error("CoinOptionsTable.checkInputValues() ERROR: Input vol is out of range : " + inputVol)
            setIsInputVolValid(false);
        } else {
            setIsInputVolValid(true);
            setInputVol(inputVol);
        }

        // Check input rate
        let inputRate = Number(inputRateRef.current.value.replace('%', ''));

        if (isNaN(inputRate) || (!inputRate)) {
            console.error("CoinOptionsTable.checkInputValues() ERROR : Input rate is invalid : " + inputRate)
            setIsInputRateValid(false);
            setInputRate(NaN);
        } else {
            setIsInputRateValid(true);
            setInputRate(inputRate);
        }

        setTrigger(trigger => !trigger);

        setIndex(index + 1);
    }

    function resetParamsValues() {

        inputVolRef.current.value = defaultVol;
        inputSpotRef.current.value = defaultSpot;
        inputRateRef.current.value = defaultRiskFreeRate;

        inputAsOfDateRef.current.value = currentDate.toLocaleDateString();

        checkInputValues();
    }

    function getCurrentInputAsOfDate() {

        if (!inputAsOfDateRef.current) {
            return currentDate;
        } else {
            return DateUtils.toDate(inputAsOfDateRef.current.value);
        }
    }

    function getCurrentInputVol() {

        if (!inputVolRef.current) {
            return defaultVol;
        } else {
            return inputVolRef.current.value;
        }
    }

    function getCurrentInputRate() {

        if (!inputRateRef.current) {
            return defaultRiskFreeRate;
        } else {
            return inputRateRef.current.value;
        }
    }

    function getCurrentInputSpot() {

        if (!inputSpotRef.current) {
            return defaultSpot;
        } else {
            return inputSpotRef.current.value;
        }
    }

    function getCurrentSpotValue() {

        if (!location.state) {
            return NaN;
        } else {
            return location.state.spotValue;
        }
    }

    function handleKeyPress(event) {

        if (event.key === "Enter") {
            //alert("Enter !");
            checkInputValues()
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
                            <span className='spot_label hide-mobile'>Spot</span>
                            {coin.market_data?.current_price ?
                                <h1 className='spot_value'>{coin.market_data.current_price.eur.toLocaleString()} €</h1> : null}
                        </div>
                    </div>
                    <div className='pricing-parameters'>
                        <div>
                            <TextField className='pricer-input-field' id="input-spot" label="Spot input"
                                       variant="filled" defaultValue={defaultSpot} onBlur={checkInputValues}
                                       error={!isInputSpotValid} inputRef={inputSpotRef}
                                       onKeyDown={handleKeyPress} InputLabelProps={{shrink: true}}
                            />
                            <TextField className='pricer-input-field' id="input-vol" label="Vol input (%)"
                                       variant="filled" defaultValue={defaultVol} onBlur={checkInputValues}
                                       error={!isInputVolValid} inputRef={inputVolRef}
                                       onKeyDown={handleKeyPress} InputLabelProps={{shrink: true}}
                            />
                            <TextField className='pricer-input-field' id="input-as-of-date" label="As of date"
                                       variant="filled" defaultValue={currentDate.toLocaleDateString()}
                                       onBlur={checkInputValues}
                                       error={!isInputAsOfDateValid} inputRef={inputAsOfDateRef}
                                       onKeyDown={handleKeyPress} InputLabelProps={{shrink: true}}
                            />
                            <TextField className='pricer-input-field' id="input-rate" label="Risk-free rate (%)"
                                       variant="filled" defaultValue={defaultRiskFreeRate} onBlur={checkInputValues}
                                       error={!isInputRateValid} inputRef={inputRateRef}
                                       onKeyDown={handleKeyPress} InputLabelProps={{shrink: true}}
                            />

                            <button className={"button_price"} onClick={checkInputValues}>PRICE ALL</button>
                            <button className={"reset_params"} onClick={resetParamsValues}>RESET</button>
                        </div>
                    </div>
                </div>
                <div className='content'>
                    <h2><span className='calls_label'>CALLS</span></h2>
                    <OptionsGrid key={OptionType.Call + twoWeeksFromNow} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={twoWeeksFromNow} riskFreeRate={getCurrentInputRate()} strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Call + oneMonthExpiry} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={oneMonthExpiry} riskFreeRate={getCurrentInputRate()} strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Call + twoMonthsExpiry} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={twoMonthsExpiry} riskFreeRate={getCurrentInputRate()} strikeStep={strikeStep}/>
                </div>
                <div className='content'>
                    <h2 className='h2_puts'><span className='puts_label'>PUTS</span></h2>

                    <OptionsGrid key={OptionType.Put + twoWeeksFromNow} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={twoWeeksFromNow} riskFreeRate={getCurrentInputRate()}
                                 strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Put + oneMonthExpiry} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={oneMonthExpiry} riskFreeRate={getCurrentInputRate()}
                                 strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Put + twoMonthsExpiry} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={twoMonthsExpiry} riskFreeRate={getCurrentInputRate()}
                                 strikeStep={strikeStep}/>
                </div>
            </div>
        </div>
    )
}

export default CoinOptionsTable
