import {create} from 'zustand'

export const useZustandStore = create((set, get) => ({
    symbolToCoinMap: new Map(),
    updateSymbolToCoinMap(coinSymbol, coin) {
        set((state) => {
            const updatedMap = new Map(state.symbolToCoinMap);
            updatedMap.set(coinSymbol, coin);
            return {symbolToCoinMap: updatedMap};
        });
    },
    dailyPriceHistory_EUR: new Map(),
    updateDailyPriceHistory_EUR(coinSymbol, updatedHistory) {
        set((state) => {
            const updatedHistories = new Map(state.dailyPriceHistory_EUR);
            updatedHistories.set(coinSymbol, updatedHistory);
            return {dailyPriceHistory_EUR: updatedHistories};
        });
    },
    dailyPriceHistory_USD: new Map(),
    updateDailyPriceHistory_USD(coinSymbol, updatedHistory) {
        set((state) => {
            const updatedHistories = new Map(state.dailyPriceHistory_USD);
            updatedHistories.set(coinSymbol, updatedHistory);
            return {dailyPriceHistory_USD: updatedHistories};
        });
    },
    dailyPriceHistory_BTC: new Map(),
    updateDailyPriceHistory_BTC(coinSymbol, updatedHistory) {
        set((state) => {
            const updatedHistories = new Map(state.dailyPriceHistory_BTC);
            updatedHistories.set(coinSymbol, updatedHistory);
            return {dailyPriceHistory_BTC: updatedHistories};
        });
    },
    dailyPriceHistory_ETH: new Map(),
    updateDailyPriceHistory_ETH(coinSymbol, updatedHistory) {
        set((state) => {
            const updatedHistories = new Map(state.dailyPriceHistory_ETH);
            updatedHistories.set(coinSymbol, updatedHistory);
            return {dailyPriceHistory_ETH: updatedHistories};
        });
    }
}));

export function getDailyPriceHistoriesForCurrency(currencyCode) {

    if (currencyCode == "eur") {
        return useZustandStore.getState().dailyPriceHistory_EUR;
    } else if (currencyCode == "usd") {
        return useZustandStore.getState().dailyPriceHistory_USD;
    } else if (currencyCode == "btc") {
        return useZustandStore.getState().dailyPriceHistory_BTC;
    } else if (currencyCode == "eth") {
        return useZustandStore.getState().dailyPriceHistory_ETH;
    } else {
        return undefined;
    }
}

export function updateDailyHistory(currencyCode, coinId,  hist) {

    if (currencyCode == "eur") {
        useZustandStore.getState().updateDailyPriceHistory_EUR(coinId, hist);
    } else if (currencyCode == "usd") {
        useZustandStore.getState().updateDailyPriceHistory_USD(coinId, hist);
    } else if (currencyCode == "btc") {
        useZustandStore.getState().updateDailyPriceHistory_BTC(coinId, hist);
    } else if (currencyCode == "eth") {
        useZustandStore.getState().updateDailyPriceHistory_ETH(coinId, hist);
    } else {
        console.error("updateHistory() currency not supported : " + currencyCode);
    }
}