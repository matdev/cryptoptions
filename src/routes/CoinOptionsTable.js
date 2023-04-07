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

    const params = useParams();
    const location = useLocation();

    const [trigger, setTrigger] = useState(false);

    const currentDate = new Date();
    //TEST
    //const asOfDate = new Date(2023, 2, 28);
    const asOfDate = new Date();

    const defaultVol = 64; // %
    const [inputVol, setInputVol] = useState(defaultVol);

    const defaultSpot = getCurrentSpotValue();
    const [inputSpot, setInputSpot] = useState(defaultSpot);
    const [inputAsOfDate, setInputAsOfDate] = useState(currentDate);

    const defaultRiskFreeRate = 1; // %

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
    }

    const [isInputVolValid, setIsInputVolValid] = useState(true);
    const [isInputSpotValid, setIsInputSpotValid] = useState(true);
    const [isInputAsOfDateValid, setIsInputAsOfDateValid] = useState(true);

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

        let inputVol = Number(inputVolRef.current.value.replace('%', ''));

        // Check input vol
        if (isNaN(inputVol) || (!inputVol)) {
            console.error("CoinOptionsTable.checkInputValues() ERROR : Input vol is invalid : " + inputVol)
            setIsInputVolValid(false);
            setInputVol(NaN);
        } else if (!MathsUtils.isNumberBetweenMinMax(inputVol)) {
            console.error("CoinOptionsTable.checkInputValues() ERROR: Input vol is out of range : " + inputVol)
            setIsInputVolValid(false);
        } else {
            setIsInputVolValid(true);
            setInputVol(inputVol);
        }

        setTrigger(trigger => !trigger);

        setIndex(index + 1);
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
                            <span className='spot_label'>Spot</span>
                            {coin.market_data?.current_price ?
                                <h1 className='spot_value'>{coin.market_data.current_price.eur.toLocaleString()} €</h1> : null}
                        </div>
                    </div>
                    <div className='pricing-parameters'>
                        <div>
                            <TextField className='pricer-input-field' id="input-as-of-date" label="As of date"
                                       variant="filled" defaultValue={currentDate.toLocaleDateString()}
                                       onBlur={checkInputValues}
                                       error={!isInputAsOfDateValid} inputRef={inputAsOfDateRef}
                                       onKeyDown={handleKeyPress}   //connecting inputRef property of TextField to the inputAsOfDateRef
                            />
                            <TextField className='pricer-input-field' id="input-spot" label="Spot input"
                                       variant="filled" defaultValue={defaultSpot} onBlur={checkInputValues}
                                       error={!isInputSpotValid} inputRef={inputSpotRef}
                                       onKeyDown={handleKeyPress}   //connecting inputRef property of TextField to the inputSpotRef
                            />
                            <TextField className='pricer-input-field' id="input-vol" label="Vol input (%)"
                                       variant="filled" defaultValue={defaultVol} onBlur={checkInputValues}
                                       error={!isInputVolValid} inputRef={inputVolRef}
                                       onKeyDown={handleKeyPress}   //connecting inputRef property of TextField to the inputVolRef
                            />
                            <button className={"button_price"} onClick={checkInputValues}>PRICE ALL</button>
                        </div>
                        <div>
                            <TextField className='risk-free-rate-field' id="input-rate" label="Risk-free rate"
                                       variant="filled" defaultValue={defaultRiskFreeRate + ' %'} disabled={true}/>
                        </div>
                    </div>
                </div>
                <div className='content'>
                    <h2><span className='calls_label'>CALLS</span></h2>
                    <OptionsGrid key={OptionType.Call + twoWeeksFromNow} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={twoWeeksFromNow} riskFreeRate={defaultRiskFreeRate} strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Call + oneMonthExpiry} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={oneMonthExpiry} riskFreeRate={defaultRiskFreeRate} strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Call + twoMonthsExpiry} trigger={trigger} optionType={OptionType.Call}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={twoMonthsExpiry} riskFreeRate={defaultRiskFreeRate} strikeStep={strikeStep}/>
                </div>
                <div className='content'>
                    <h2><span className='calls_puts_label'>PUTS</span></h2>

                    <OptionsGrid key={OptionType.Put + twoWeeksFromNow} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={twoWeeksFromNow} riskFreeRate={defaultRiskFreeRate}
                                 strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Put + oneMonthExpiry} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={oneMonthExpiry} riskFreeRate={defaultRiskFreeRate}
                                 strikeStep={strikeStep}/>

                    <OptionsGrid key={OptionType.Put + twoMonthsExpiry} trigger={trigger} optionType={OptionType.Put}
                                 spotValue={getCurrentInputSpot()}
                                 currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                 expiry={twoMonthsExpiry} riskFreeRate={defaultRiskFreeRate}
                                 strikeStep={strikeStep}/>
                </div>
            </div>
        </div>
    )
}

export default CoinOptionsTable
