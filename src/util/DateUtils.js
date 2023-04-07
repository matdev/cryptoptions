export function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function addMonths(date, months) {
    let result = new Date(date)
    result = new Date(result.setMonth(result.getMonth() + months));
    return result;
}

export function getLastBusinessDay(year, month) {

    //get end of month, basically next month with day 0
    const dt = new Date(year, month + 1, 0);
    const day = dt.getDay();
    //subtract 1 if Saturday(6), subtract 2 if sunday(0).
    dt.setDate(dt.getDate() -
        (day === 6 ? 1 : day === 0 ? 2 : 0)
    );
    return dt;
};

export function adjustToPreviousBusinessDay(date) {
    let result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - (day === 6 ? 1 : day === 0 ? 2 : 0));

    return result;
}

export function getNumberOfDays(start, end) {

    const date1 = new Date(start);
    const date2 = new Date(end);

    // One day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;

    // Calculating the time difference between two dates
    const diffInTime = date2.getTime() - date1.getTime();

    // Calculating the no. of days between two dates
    //const diffInDays = Math.round(diffInTime / oneDay);
    const diffInDays = diffInTime / oneDay;

    return diffInDays;
}

export function toDate(dateStr) {
    var parts = dateStr.split("/")
    return new Date(parts[2], parts[1] - 1, parts[0])
}

export function TEST_getLastBusinessDay() {

    let d = new Date();

    let lastBusinessDayOfNextMonth = getLastBusinessDay(d.getFullYear(), d.getMonth() + 1);

    console.log("TEST_getLastBusinessDay : from date " + d.toLocaleString() + " lastBusinessDayOfNextMonth = " + lastBusinessDayOfNextMonth.toLocaleString());
}
