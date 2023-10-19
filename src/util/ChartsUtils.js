export function getDateAsTickLabel(rawDate){
        let tickAsDate = new Date(rawDate);
        let month = tickAsDate.toLocaleString('default', { month: 'short' });
        let tickAsString = tickAsDate.getDate() + " " + month;

        return tickAsString;
    }
