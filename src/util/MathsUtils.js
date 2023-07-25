
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

/*
 * If value >= 1 M e.g. 1 400 000 : rounds to 1.4
 * else: do not round
 */
export function roundToMillionsIfPossible(value) {

    let result = value;

    if (value >= 1000000){
        let valueAsMillion = value / 1000000;
        result = roundToDecimalPlace(valueAsMillion, 1);
        result = result.toLocaleString() + " M";
    }

    return result;
}

export function getChangeAsPercent(currentValue, baseValue){

    let result = 100 * (currentValue - baseValue) / baseValue;

    return result;
}

export function getCovariance(timeserie1, mean1, timeserie2, mean2){

    let n = timeserie1.length;
    //TODO: Check n equals timeserie2.length

    let sum = 0

    for (let i = 0; i < n; i++) {
        sum = sum + (timeserie1[i] - mean1) * (timeserie2[i] - mean2);
    }

    let result = sum / n;

    return result;
}
