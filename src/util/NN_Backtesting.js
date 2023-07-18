import * as RadialBasisNN from "./NN_RadialBasis.js";
import {forecastTimeSeries, forecastTimeSeries_v2} from "./NN_RadialBasis.js";

export function TEST_sliceTimeSeries() {

    let timeSeries = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let sliceSize = 4;

    let result = RadialBasisNN.sliceTimeSeries(timeSeries, sliceSize);

    console.log("TEST_sliceTimeSeries : result = " + result);
}

export function TEST_forecastTimeSeries() {

    let timeSeries = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let forecastLength = 1;

    let timeSeriesSliced = RadialBasisNN.sliceTimeSeries(timeSeries, 5);
    let result = forecastTimeSeries(timeSeriesSliced, forecastLength);

    console.log("TEST_forecastTimeSeries : result = " + result);
}

export function TEST_forecastTimeSeries_v2() {

    let timeSeries = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let forecastLength = 1;

    let result = forecastTimeSeries_v2(timeSeries, forecastLength);

    console.log("TEST_forecastTimeSeries_v2 : result = " + result);
}
