export function getDateAsTickLabel(rawDate, userLang) {
    let tickAsDate = new Date(rawDate);
    let month = tickAsDate.toLocaleString(userLang, {month: 'short'});
    let tickAsString = tickAsDate.getDate() + " " + month;

    return tickAsString;
}

export function getEndOfTimeSeries(originalTimeSeries, fromIndex) {

    let result = originalTimeSeries.slice(fromIndex, originalTimeSeries.length);

    return result;
}
