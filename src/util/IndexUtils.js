export function getMajorCoinsIndexWeights() {
    // [BTC, ETH, SOL]
    //const majorIndexWeight = [15, 70, 15];
    const majorIndexWeight = [0.05, 1, 20];
    return majorIndexWeight;
}

export function getIndexVal(componentPrices, componentWeight) {

    let indexVal = 0;

    for (let i = 0; i < componentPrices.length; i++) {
        indexVal = indexVal + componentPrices[i] * (componentWeight[i]);
    }

    return indexVal;
}