export function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function addMonths(date, months) {
    var result = new Date(date.setMonth(date.getMonth() + months));
    return result;
}
