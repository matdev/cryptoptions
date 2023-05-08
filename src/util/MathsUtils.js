
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

export function roundSmart(coinPrice) {

    let result;
    if (coinPrice > 10000){
        result = roundToDecimalPlace(coinPrice, 0);
    } else if (coinPrice > 1000){
        result = roundToDecimalPlace(coinPrice, 1);
    } else if (coinPrice > 100){
        result = roundToDecimalPlace(coinPrice, 2);
    } else if (coinPrice > 10){
        result = roundToDecimalPlace(coinPrice, 3);
    } else{
        result = roundToDecimalPlace(coinPrice, 4);
    }

    return result;
}

export function roundToDecimalPlace(value, decimalPlace) {

    const h = +('1'.padEnd(decimalPlace + 1, '0')); // 10 or 100 or 1000 or etc

    return Math.round(value * h) / h;
}
