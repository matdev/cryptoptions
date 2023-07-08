import axios from 'axios'
import {useLocation, useParams} from 'react-router-dom'
import React, {useState, useEffect, useRef} from 'react'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {styled} from "@mui/material/styles";
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import CoinDetails from '../routes/CoinDetails'
import {Link} from 'react-router-dom'
import 'react-data-grid/lib/styles.css';
import * as DateUtils from '../util/DateUtils';
import * as MathsUtils from '../util/MathsUtils';
import './CoinOptionsTable.css'
import TextField from '@mui/material/TextField';
import OptionsGrid from "../components/OptionsGrid";
import {OptionType} from "../util/PricingUtils";
import {COLORS} from "../util/Colors.js";
import {useSelector} from 'react-redux';

const mathjs = require('mathjs');

const CoinOptionsTable = () => {

    const params = useParams();
    const location = useLocation();

    const [trigger, setTrigger] = useState(false);

    const [tabValue, setTabValue] = React.useState(0);
    const [tabPutValue, setTabPutValue] = React.useState(0);

    // As of date
    const currentDate = new Date();
    //TEST
    //const asOfDate = new Date(2023, 2, 28);
    const asOfDate = new Date();

    // Vol
    //const defaultVol = 64; // %
    const [historicalVol_30d, setHistoricalVol_30d] = useState(54);
    const [inputVol, setInputVol] = useState();

    // Risk-free rate
    const defaultRiskFreeRate = 1; // %
    const [inputRate, setInputRate] = useState(defaultRiskFreeRate);

    // Spot
    //const defaultSpot = getCurrentSpotValue();
    const [spotValue, setSpotValue] = useState(location.state?.spotValue);

    const [inputSpot, setInputSpot] = useState(spotValue);
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

    const [coin, setCoin] = useState({});

    const userCurrency = useSelector(store => store.userCurrency.value);

    const url = `https://api.coingecko.com/api/v3/coins/${params.coinId}`;
    const price_history_url = 'https://api.coingecko.com/api/v3/coins/' + params.coinId + '/market_chart?vs_currency=' + userCurrency.code + '&days=31&interval=daily';

    useEffect(() => {

        console.log("CoinOptionsTable.useEffect() location.state?.spotValue = " + location.state?.spotValue + " params.coinId = " + params.coinId);

        axios.get(url).then((res) => {
            setCoin(res.data)
            let newSpotValue = res.data.market_data.current_price[userCurrency.code];
            inputSpotRef.current.value = newSpotValue;
            setSpotValue(newSpotValue);

            checkInputValues();
        }).catch((error) => {
            console.log(error)
        });

        axios.get(price_history_url).then((res) => {

            let pricesHistory = [];
            let dailyReturnHistory = [];

            let i = 0;
            for (const entry of res.data.prices) {

                if (entry[1] === undefined) {
                    console.log("CoinOptionsTable.useEffect() i=  " + i + " undefined ");
                } else {

                    pricesHistory[i] = entry[1];

                    if (i > 0) {
                        dailyReturnHistory[i - 1] = mathjs.log(pricesHistory[i] / pricesHistory[i - 1]);
                    }
                    // console.log("CoinOptionsTable.useEffect() pricesHistory[i] = " + pricesHistory[i]
                    //     + " dailyReturnHistory[i] = " + dailyReturnHistory[i - 1]);
                }

                i = i + 1;
            }

            let standardDeviation_30d = mathjs.std(dailyReturnHistory);
            let histoVol_30d = standardDeviation_30d * mathjs.sqrt(365) * 100;
            histoVol_30d = MathsUtils.roundToDecimalPlace(histoVol_30d, 1);
            //console.log("CoinOptionsTable.useEffect() histoVol_30d : " + histoVol_30d);

            inputVolRef.current.value = histoVol_30d
            setHistoricalVol_30d(histoVol_30d);
            setInputVol(histoVol_30d);

            checkInputValues();
        }).catch((error) => {
            console.log(error)
        });
    }, [userCurrency, params.coinId])

    const [index, setIndex] = useState(0);

    let strikeStep = 25;

    if (params.coinId == 'bitcoin') {
        strikeStep = 1000;
    } else if (params.coinId == 'ethereum') {
        strikeStep = 25;
    }

    if (spotValue < 200) {
        strikeStep = mathjs.round(getCurrentSpotValue() / 10, 1);
    }

    //console.log("CoinOptionsTable: props.spotValue = " + props.spotValue +" location.state.spotValue = " + location.state.spotValue);

    const [isInputVolValid, setIsInputVolValid] = useState(true);
    const [isInputSpotValid, setIsInputSpotValid] = useState(true);
    const [isInputAsOfDateValid, setIsInputAsOfDateValid] = useState(true);
    const [isInputRateValid, setIsInputRateValid] = useState(true);

    function checkInputValues() {

        let fromDate = DateUtils.toDate(inputAsOfDateRef.current.value);

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
        let inputSpotAsNumber = Number(inputSpotRef.current.value);

        //console.log("CoinOptionsTable.checkInputValues() inputSpotAsNumber = " + inputSpotAsNumber);

        if (isNaN(inputSpotAsNumber) || (!inputSpotAsNumber)) {
            console.error("CoinOptionsTable.checkInputValues() ERROR : Input spot is invalid : " + inputSpotAsNumber);
            setIsInputSpotValid(false);
            setInputSpot(NaN);
        } else if (inputSpotAsNumber < 0) {
            console.error("CoinOptionsTable.checkInputValues() ERROR: Input spot is out of range : " + inputSpot);
            setIsInputSpotValid(false);
            setInputSpot(NaN);
        } else {
            setIsInputSpotValid(true);
            setInputSpot(inputSpotAsNumber);
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
            //console.log("CoinOptionsTable.checkInputValues() Input vol is OK : " + inputVol)
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

        inputVolRef.current.value = MathsUtils.roundToDecimalPlace(historicalVol_30d, 1);
        inputSpotRef.current.value = spotValue;
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
            return historicalVol_30d;
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
            return spotValue;
        } else {
            return inputSpotRef.current.value;
        }
    }

    function getCurrentSpotValue() {

        return spotValue;
    }

    function handleKeyPress(event) {

        if (event.key === "Enter") {
            //alert("Enter !");
            checkInputValues()
        }
    }

    function TabPanel(props) {
        const {children, value, index, ...other} = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{p: 3}}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    function a11yPropsPut(index) {
        return {
            id: `put-tab-${index}`,
            'aria-controls': `put-tabpanel-${index}`,
        };
    }

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleTabPutChange = (event, newValue) => {
        setTabPutValue(newValue);
    };

    function getExpiryLabel(expiryDate) {
        return "Expiry : " + expiryDate.toLocaleDateString();
    }

    const StyledTab = styled(Tab)({
        "&.Mui-selected": {
            color: COLORS.logo_blue,
            fontWeight: "bold"
        }
    });

    return (
        <div>
            <div className='coin-container'>
                <div className='content'>
                    <h1>Options on
                        <span className='purple'> {coin.name}</span>
                    </h1>
                </div>
                <div className='content'>
                    <div className='details_info'>
                        <div className='coin-heading'>
                            {coin.image ? <img src={coin.image.small} alt=''/> : null}
                            <h2 className='underlined'><Link key={coin.id} to={`/coin/${coin.id}`}
                                                             state={{spotValue: spotValue, baseCurrency: userCurrency}}
                                                             element={<CoinDetails/>}>
                                {coin.name}</Link></h2>

                            {coin.symbol ? <p className='coin-symbol'> {coin.symbol.toUpperCase()}</p> : null}
                        </div>
                        <div className='spot_div'><span className='spot_label'>Spot</span></div>
                    </div>

                    <div className='details_info'>
                        <div className='coin-price'>
                            {coin.market_data?.current_price ?
                                <h1>{coin.market_data.current_price[userCurrency.code].toLocaleString()} {userCurrency.symbol}</h1> : null}
                        </div>
                    </div>
                    <div className='pricing-parameters'>
                        <div>
                            <TextField key={spotValue} className='pricer-input-field' id="input-spot" label="Spot input"
                                       variant="filled" defaultValue={spotValue} onBlur={checkInputValues}
                                       error={!isInputSpotValid} inputRef={inputSpotRef}
                                       onKeyDown={handleKeyPress} InputLabelProps={{shrink: true}}
                            />
                            <TextField className='pricer-input-field' id="input-vol" label="Vol input (%)"
                                       variant="filled" defaultValue={historicalVol_30d} onBlur={checkInputValues}
                                       error={!isInputVolValid} inputRef={inputVolRef}
                                       onKeyDown={handleKeyPress} InputLabelProps={{shrink: true}}
                            />
                            <TextField className='pricer-input-field-longer' id="input-as-of-date" label="As of date"
                                       variant="filled" defaultValue={currentDate.toLocaleDateString()}
                                       onBlur={checkInputValues}
                                       error={!isInputAsOfDateValid} inputRef={inputAsOfDateRef}
                                       onKeyDown={handleKeyPress} InputLabelProps={{shrink: true}}
                            />
                            <TextField className='pricer-input-field-longer' id="input-rate" label="Risk-free rate (%)"
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
                    <Box sx={{width: '100%'}}>
                        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                            <Tabs value={tabValue}
                                  onChange={handleChange}
                                  aria-label="basic tabs example"
                                  textColor="inherit"
                                  scrollButtons="auto"
                                  variant="scrollable"
                                  indicatorColor="primary"
                                  TabIndicatorProps={{style: {background: COLORS.logo_blue}}}>

                                <StyledTab label={getExpiryLabel(twoWeeksFromNow)} {...a11yProps(0)} />
                                <StyledTab label={getExpiryLabel(oneMonthExpiry)} {...a11yProps(1)} />
                                <StyledTab label={getExpiryLabel(twoMonthsExpiry)} {...a11yProps(2)} />

                            </Tabs>
                        </Box>
                        <TabPanel value={tabValue} index={0}>
                            <OptionsGrid key={OptionType.Call + twoWeeksFromNow} index={index} trigger={trigger}
                                         optionType={OptionType.Call}
                                         spotValue={getCurrentInputSpot()} actualSpotValue={spotValue}
                                         currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                         expiry={twoWeeksFromNow} riskFreeRate={getCurrentInputRate()}
                                         strikeStep={strikeStep}/>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <OptionsGrid key={OptionType.Call + oneMonthExpiry} trigger={trigger}
                                         optionType={OptionType.Call}
                                         spotValue={getCurrentInputSpot()} actualSpotValue={spotValue}
                                         currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                         expiry={oneMonthExpiry} riskFreeRate={getCurrentInputRate()}
                                         strikeStep={strikeStep}/>
                        </TabPanel>
                        <TabPanel value={tabValue} index={2}>
                            <OptionsGrid key={OptionType.Call + twoMonthsExpiry} trigger={trigger}
                                         optionType={OptionType.Call}
                                         spotValue={getCurrentInputSpot()} actualSpotValue={spotValue}
                                         currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                         expiry={twoMonthsExpiry} riskFreeRate={getCurrentInputRate()}
                                         strikeStep={strikeStep}/>
                        </TabPanel>
                    </Box>
                </div>

                <div className='content'>
                    <h2 className='h2_puts'><span className='puts_label'>PUTS</span></h2>
                    <Box sx={{width: '100%'}}>
                        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                            <Tabs value={tabPutValue}
                                  onChange={handleTabPutChange}
                                  aria-label="basic tabs example"
                                  textColor="inherit"
                                  scrollButtons="auto"
                                  variant="scrollable"
                                  key="puts"
                                  indicatorColor="primary"
                                  TabIndicatorProps={{style: {background: COLORS.logo_blue}}}>

                                <StyledTab label={getExpiryLabel(twoWeeksFromNow)} {...a11yPropsPut(0)} />
                                <StyledTab label={getExpiryLabel(oneMonthExpiry)} {...a11yPropsPut(1)} />
                                <StyledTab label={getExpiryLabel(twoMonthsExpiry)} {...a11yPropsPut(2)} />

                            </Tabs>
                        </Box>
                        <TabPanel value={tabPutValue} index={0}>
                            <OptionsGrid key={OptionType.Put + twoWeeksFromNow} trigger={trigger}
                                         optionType={OptionType.Put}
                                         spotValue={getCurrentInputSpot()} actualSpotValue={spotValue}
                                         currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                         expiry={twoWeeksFromNow} riskFreeRate={getCurrentInputRate()}
                                         strikeStep={strikeStep}/>
                        </TabPanel>
                        <TabPanel value={tabPutValue} index={1}>
                            <OptionsGrid key={OptionType.Put + oneMonthExpiry} trigger={trigger}
                                         optionType={OptionType.Put}
                                         spotValue={getCurrentInputSpot()} actualSpotValue={spotValue}
                                         currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                         expiry={oneMonthExpiry} riskFreeRate={getCurrentInputRate()}
                                         strikeStep={strikeStep}/>
                        </TabPanel>
                        <TabPanel value={tabPutValue} index={2}>
                            <OptionsGrid key={OptionType.Put + twoMonthsExpiry} trigger={trigger}
                                         optionType={OptionType.Put}
                                         spotValue={getCurrentInputSpot()} actualSpotValue={spotValue}
                                         currentDate={getCurrentInputAsOfDate()} inputVol={getCurrentInputVol()}
                                         expiry={twoMonthsExpiry} riskFreeRate={getCurrentInputRate()}
                                         strikeStep={strikeStep}/>
                        </TabPanel>
                    </Box>
                </div>
            </div>
        </div>
    )
}

export default CoinOptionsTable
