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

    const [rowsParam, setRowsParam] = useState(props.optionStrikes);

    const columns = [
        {key: 'strike', name: 'Strike'},
        {key: 'vol', name: 'Vol Input (%)'},
        {key: 'theo_price', name: 'Theo Price'},
        {key: 'id', name: 'ID'}
    ];

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
            let theoPrice;

            if (props.optionType == OptionType.Put){
                theoPrice = PricingUtils.pricePut(props.currentDate, props.expiry, rowsParam[i].strike, props.spotValue, props.riskFreeRate / 100, inputVol / 100);
            } else {
                theoPrice = PricingUtils.priceCall(props.currentDate, props.expiry, rowsParam[i].strike, props.spotValue, props.riskFreeRate / 100, inputVol / 100);
            }

            //TODO: Display delta + hide ID column
            rowsParam[i].theo_price = theoPrice.toFixed(2);
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
