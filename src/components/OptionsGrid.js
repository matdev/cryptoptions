import React, {useEffect, useState} from 'react'

import './OptionsGrid.css'
import DataGrid from "react-data-grid";
import * as PricingUtils from "../util/PricingUtils";
import * as MathsUtils from "../util/MathsUtils";
import {OptionType} from "../util/PricingUtils";
import {useSelector} from 'react-redux';

const mathjs = require('mathjs')

const OptionsGrid = (props) => {

    const [index, setIndex] = useState(0);
    const userCurrency = useSelector(store => store.userCurrency.value);

    let strike_1_UP;
    let strike_2_UP;
    let strike_3_UP;
    let strike_4_UP;

    let strike_1_DOWN;
    let strike_2_DOWN;
    let strike_3_DOWN;
    let strike_4_DOWN;

    useEffect(() => {

        updateStrikes();

        setIndex(index + 1);
        priceOptions();

    }, [props.inputVol, props.trigger, userCurrency]);

    const columns = [
        {key: 'strike', name: 'Strike'},
        {key: 'vol', name: 'Vol (%)'},
        {key: 'theo_price', name: 'Theo Price (' + userCurrency.label + ')'},
        {key: 'delta', name: 'Delta'}
    ];

    let initialRows = [
        {strike: strike_4_DOWN, vol: props.inputVol, theo_price: '', delta: ''},
        {strike: strike_3_DOWN, vol: props.inputVol, theo_price: '', delta: ''},
        {strike: strike_2_DOWN, vol: props.inputVol, theo_price: '', delta: ''},
        {strike: strike_1_DOWN, vol: props.inputVol, theo_price: '', delta: ''},
        {strike: strike_1_UP, vol: props.inputVol, theo_price: '', delta: ''},
        {strike: strike_2_UP, vol: props.inputVol, theo_price: '', delta: ''},
        {strike: strike_3_UP, vol: props.inputVol, theo_price: '', delta: ''},
        {strike: strike_4_UP, vol: props.inputVol, theo_price: '', delta: ''}
    ];

    const [rowsParam, setRowsParam] = useState(initialRows);

    function updateStrikes() {

        //strike_1_UP = MathsUtils.roundToNextStepUp(props.spotValue, props.strikeStep, props.strikeStep);
        strike_1_UP = MathsUtils.roundToNextStepUp(props.actualSpotValue, props.strikeStep, props.strikeStep);

        strike_2_UP = mathjs.round(strike_1_UP + props.strikeStep, 1);
        strike_3_UP = mathjs.round(strike_2_UP + props.strikeStep, 1);
        strike_4_UP = mathjs.round(strike_3_UP + props.strikeStep, 1);

        strike_1_DOWN = mathjs.round(strike_1_UP - props.strikeStep, 1);
        strike_2_DOWN = mathjs.round(strike_1_DOWN - props.strikeStep, 1);
        strike_3_DOWN = mathjs.round(strike_2_DOWN - props.strikeStep, 1);
        strike_4_DOWN = mathjs.round(strike_3_DOWN - props.strikeStep, 1);

        //console.log("OptionsGrid.updateStrikes() strike_1_UP = " + strike_1_UP);

        let strikesArray = [strike_4_DOWN, strike_3_DOWN, strike_2_DOWN, strike_1_DOWN, strike_1_UP, strike_2_UP, strike_3_UP, strike_4_UP];

        for (var i = 0; i < rowsParam.length; i++) {
            rowsParam[i].strike = strikesArray[i];
        }
    }

    function priceOptions() {

        //console.log("OptionsGrid.priceOptions() spotValue = " + props.spotValue + " inputVol = " + props.inputVol);

        // Check Input asOfDate
        let inputAsOfDate = props.currentDate;
        if (isNaN(inputAsOfDate) || (!inputAsOfDate)) {
            inputAsOfDate = NaN;
        }

        // Check Input spot
        let spotValue = props.spotValue;
        if (isNaN(spotValue) || (!spotValue)) {
            spotValue = NaN;
        }

        // Check Input vol
        let inputVol = props.inputVol;
        if (isNaN(inputVol) || (!inputVol)) {
            inputVol = NaN;
        } else if (!MathsUtils.isNumberBetweenMinMax(inputVol, 0, 100)) {
            inputVol = NaN;
        }

        // Check Input rate
        let inputRate = props.riskFreeRate;
        if (isNaN(inputRate) || (!inputRate)) {
            inputRate = NaN;
        }

        for (var i = 0; i < rowsParam.length; i++) {

            rowsParam[i].vol = inputVol;
            let priceResult;

            if (props.optionType == OptionType.Put) {
                priceResult = PricingUtils.pricePut(inputAsOfDate, props.expiry, rowsParam[i].strike, spotValue, inputRate / 100, inputVol / 100);
            } else {
                priceResult = PricingUtils.priceCall(inputAsOfDate, props.expiry, rowsParam[i].strike, spotValue, inputRate / 100, inputVol / 100);
            }

            rowsParam[i].theo_price = priceResult.theoPrice.toFixed(2);
            rowsParam[i].delta = priceResult.delta.toFixed(2);
        }

        setIndex(index + 1);
    }

    return (
        <div>
            <h3 className='expiry'>Expiry: {props.expiry.toLocaleDateString()}</h3>

            <DataGrid
                columns={columns}
                rows={rowsParam}
                onRowsChange={setRowsParam}
            />
        </div>
    )
}

export default OptionsGrid
