import { configureStore } from '@reduxjs/toolkit'
import userCurrencyReducer from './features/userCurrencySlice';

export default configureStore({
    reducer: {
        userCurrency: userCurrencyReducer,
    },
})
