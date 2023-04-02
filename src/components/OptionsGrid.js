import React, {useEffect, useState} from 'react'

import '../routes/CoinOptionsTable.css'
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
        {key: 'delta', name: 'Delta'},
        {key: 'id', name: 'ID'}
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
        {id: 0, strike: strike_4_DOWN, vol: props.inputVol, theo_price: '', delta: ''},
        {id: 1, strike: strike_3_DOWN, vol: props.inputVol, theo_price: '', delta: ''},
        {id: 2, strike: strike_2_DOWN, vol: props.inputVol, theo_price: '', delta: ''},
        {id: 3, strike: strike_1_DOWN, vol: props.inputVol, theo_price: '', delta: ''},
        {id: 4, strike: strike_1_UP, vol: props.inputVol, theo_price: '', delta: ''},
        {id: 5, strike: strike_2_UP, vol: props.inputVol, theo_price: '', delta: ''},
        {id: 6, strike: strike_3_UP, vol: props.inputVol, theo_price: '', delta: ''},
        {id: 7, strike: strike_4_UP, vol: props.inputVol, theo_price: '', delta: ''}
    ];

    const [rowsParam, setRowsParam] = useState(initialRows);

    function priceOptions() {

        console.log("priceOptions() index = " + index + " inputVol = " + props.inputVol);

        let inputVol = props.inputVol;

        // Input vol check
        if (isNaN(inputVol) || (!inputVol)) {
            inputVol = NaN;
        } else if (!MathsUtils.isNumberBetweenMinMax(inputVol)) {
            inputVol = NaN;
        }

        for (var i = 0; i < rowsParam.length; i++) {

            rowsParam[i].vol = inputVol;
            let priceResult;

            if (props.optionType == OptionType.Put){
                priceResult = PricingUtils.pricePut(props.currentDate, props.expiry, rowsParam[i].strike, props.spotValue, props.riskFreeRate / 100, inputVol / 100);
            } else {
                priceResult = PricingUtils.priceCall(props.currentDate, props.expiry, rowsParam[i].strike, props.spotValue, props.riskFreeRate / 100, inputVol / 100);
            }

            rowsParam[i].theo_price = priceResult.theoPrice.toFixed(2);
            rowsParam[i].delta = priceResult.delta.toFixed(2);
        }

        setIndex(index + 1);
    }

    return (
        <div>

            <h3>Expiry: {props.expiry.toLocaleDateString()}</h3>
            <br/>

            <DataGrid
                columns={columns}
                rows={rowsParam}
                onRowsChange={setRowsParam}
            />
        </div>
    )
}

export default OptionsGrid
