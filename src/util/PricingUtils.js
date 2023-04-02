import * as DateUtils from './DateUtils';
import {exp} from "mathjs";

const mathjs = require('mathjs')

export const OptionType = {
    Call: 1,
    Put : 2
};

export function PricingResult(theoPrice, delta) {
    this.theoPrice = theoPrice;
    this.delta = delta;
}

export function cumulativeDistributionNormal(x, mean, standardDeviation) {
    return (1 - mathjs.erf((mean - x) / (Math.sqrt(2) * standardDeviation))) / 2;
}

/* Returns the cumulative probability  distribution function for a standardized normal distribution */
export function N(x) {
    return cumulativeDistributionNormal(x, 0, 1);
}

export function priceCall(spotDate, expiryDate, strike, S_0, r, vol) {

    // console.log("priceCall() as of " + spotDate.toLocaleDateString() + " expiry : " + expiryDate.toLocaleDateString()
    //     + " strike : " + strike + " S_0 : " + S_0 + " r=" + r + " vol=" + vol);

    let T = DateUtils.getNumberOfDays(spotDate, expiryDate) / 365;

    let d1 = (mathjs.log(S_0 / strike) + (r + vol * vol / 2) * T) / (vol * mathjs.sqrt(T));

    let d2 = d1 - vol * mathjs.sqrt(T);

    let N_d1 = N(d1);

    let theoPrice = S_0 * N_d1 - strike * mathjs.exp(-1 * r * T) * N(d2);
    let delta = N_d1;

    const result = new PricingResult(theoPrice, delta);

    return result;
}

export function pricePut(spotDate, expiryDate, strike, S_0, r, vol) {

    console.log("pricePut() as of " + spotDate.toLocaleDateString() + " expiry : " + expiryDate.toLocaleDateString()
        + " strike : " + strike + " S_0 : " + S_0 + " r=" + r + " vol=" + vol);

    let T = DateUtils.getNumberOfDays(spotDate, expiryDate) / 365;

    let d1 = (mathjs.log(S_0 / strike) + (r + vol * vol / 2) * T) / (vol * mathjs.sqrt(T));

    let d2 = d1 - vol * mathjs.sqrt(T);

    let theoPrice = strike * mathjs.exp(-1 * r * T) * N(-d2) - S_0 * N(-d1);
    let delta = N(d1) - 1;

    const result = new PricingResult(theoPrice, delta);

    return result;
}

export function TEST_priceCall() {

    let S_0 = 25754;

    let strike = 25000;
    let expiryDate = new Date(2023, 4, 28);
    let spotDate = new Date(2023, 3, 30);
    let vol = 0.62;
    let r = 0.01;

    let result = priceCall(spotDate, expiryDate, strike, S_0, r, vol);

    console.log("TEST_priceCall : result = " + result);
}

export function TEST_cumulativeDistributionNormal() {

    let T = 0.008219178;
    let d1 = 2.242002788;

    let N_d1 = cumulativeDistributionNormal(d1, 0, 1);
    let N_d1_rounded = mathjs.round(N_d1, 9);

    const TARGET_N_D1 = 0.987519404;

    let test_success = (N_d1_rounded == TARGET_N_D1);

    if (test_success) {
        console.log("TEST_cumulativeDistributionNormal : SUCCESS :) ");
    } else {
        console.error(" TARGET_N_D1 = " + TARGET_N_D1 + " AND N_d1_rounded = " + N_d1_rounded + " => TEST FAILED ! ");
    }
}
