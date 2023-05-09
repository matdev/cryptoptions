import * as React from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import './BaseCurrencySelect.css';
import * as CurrencyUtils from "../util/CurrencyUtils";
import {useDispatch, useSelector} from 'react-redux';
import { setUserCurrency } from '../features/userCurrencySlice';

export default function BaseCurrencySelect(props) {

    const defaultCurrency = useSelector(store => store.userCurrency.value);

    const [baseCurrency, setBaseCurrency] = React.useState(defaultCurrency);
    const dispatch = useDispatch();

    const handleChange = (event) => {
        //console.log("handleChange() : " + event.target.value);
        let selectedCurrency = CurrencyUtils.getCurrencyFromId(event.target.value)
        setBaseCurrency(selectedCurrency);

        dispatch(setUserCurrency(selectedCurrency));
    };

    return (
        <Box className="MuiSelect-box" sx={{minWidth: 50}}>
            <FormControl fullWidth>
                <Select
                    className="MuiSelect-select"
                    labelId="currency-select-label"
                    id="currency-select"
                    value={baseCurrency.id}
                    onChange={handleChange}
                >
                    <MenuItem value={CurrencyUtils.currencies.EUR.id}>EUR</MenuItem>
                    <MenuItem value={CurrencyUtils.currencies.USD.id}>USD</MenuItem>
                    <MenuItem value={CurrencyUtils.currencies.BTC.id}>BTC</MenuItem>
                    <MenuItem value={CurrencyUtils.currencies.ETH.id}>ETH</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}
