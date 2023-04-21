import {createSlice} from '@reduxjs/toolkit';
import * as CurrencyUtils from "../util/CurrencyUtils";

export const userCurrencySlice = createSlice({
    name: 'userCurrency',
    initialState: {
        value: CurrencyUtils.currencies.EUR,
    },

    reducers: {
        setUserCurrency: (state, action) => {
            console.log('in setUserCurrency() action.payload = ' + action.payload.label);
            state.value = action.payload;
        },
    },
});

export const { setUserCurrency } = userCurrencySlice.actions;

export const userCurrency = (state) => state.userCurrency;

export default userCurrencySlice.reducer;
