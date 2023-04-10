import React, {useEffect, useState} from 'react'

import './OptionsGrid.css'
import DataGrid from "react-data-grid";
import * as PricingUtils from "../util/PricingUtils";
import * as MathsUtils from "../util/MathsUtils";
import {OptionType} from "../util/PricingUtils";

const OptionsGrid = (props) => {

    const [index, setIndex] = useState(0);

    useEffect(() => {
        priceOptions();
    }, [props.trigger]);

    const columns = [
        {key: 'strike', name: 'Strike'},
        {key: 'vol', name: 'Vol Input (%)'},
        {key: 'theo_price', name: 'Theo Price'},
        {key: 'delta', name: 'Delta'}
    ];

    // Strikes UP
    let strike_1_UP = (MathsUtils.roundToNextStepUp(props.spotValue, props.strikeStep, props.strikeStep));
    let strike_2_UP = strike_1_UP + props.strikeStep;
    let strike_3_UP = strike_2_UP + props.strikeStep;
    let strike_4_UP = strike_3_UP + props.strikeStep;

    // Strikes DOWN
    let strike_1_DOWN = strike_1_UP - props.strikeStep;
    let strike_2_DOWN = strike_1_DOWN - props.strikeStep;
    let strike_3_DOWN = strike_2_DOWN - props.strikeStep;
    let strike_4_DOWN = strike_3_DOWN - props.strikeStep;

    // console.log("spotValue = " + props.spotValue + " => strike_1_UP = " + strike_1_UP);
    // console.log(" strike_1_DOWN = " + strike_1_DOWN);

    const initialRows = [
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

    function priceOptions() {

        console.log("OptionsGrid.priceOptions() index = " + index + " spotValue = " + props.spotValue);

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
        } else if (!MathsUtils.isNumberBetweenMinMax(inputVol, 0 , 100)) {
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
