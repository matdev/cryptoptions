const mathjs = require('mathjs')

export function cumulativeDistributionNormal(x, mean, standardDeviation) {
    return (1 - mathjs.erf((mean - x) / (Math.sqrt(2) * standardDeviation))) / 2
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
