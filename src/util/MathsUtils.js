import {forEach} from "mathjs";

export function isNumberBetweenMinMax(val, minValue, maxValue) {

    if (isNaN(val)){
        return false;
    }

    if ((val < minValue) || (val > maxValue)){
        return false;
    }

    return true;
}

export function roundToNextStepUp(number, increment, offset) {
    return Math.ceil((number - offset) / increment ) * increment + offset;
}

export function standardDeviation(valuesAsArray){

    const elementCount = valuesAsArray.length;

    for (const v of valuesAsArray) {

    }

}
