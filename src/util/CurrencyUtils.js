export const currencies = Object.freeze({
    EUR: {id: '1', code:'eur', symbol: '€', label:'EUR'},
    USD: {id: '2', code:'usd', symbol: '$', label:'USD'},
    BTC: {id: '3', code:'btc', symbol: 'BTC', label:'BTC'},
    ETH: {id: '4', code:'eth', symbol: 'ETH', label:'ETH'}
})

export function getCurrencyLabel(id){
    if (id == 1){
        return currencies.EUR.code;
    } else if (id == 2){
        return currencies.USD.code;
    } else if (id == 3){
        return currencies.BTC.code;
    } else if (id == 4){
        return currencies.ETH.code;
    } else {
        return currencies.EUR.code;
    }
}

export function getCurrencyFromId(id){
    if (id == 1){
        return currencies.EUR;
    } else if (id == 2){
        return currencies.USD;
    } else if (id == 3){
        return currencies.BTC;
    } else if (id == 4){
        return currencies.ETH;
    } else {
        return currencies.EUR;
    }
}
