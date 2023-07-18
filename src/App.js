import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {Routes, Route} from 'react-router-dom'
import CoinsTable from './components/CoinsTable'
import CoinDetails from './routes/CoinDetails'
import Navbar from './components/Navbar'
import CoinOptions from "./routes/CoinOptions";
import Footer from './components/Footer';
import {useSelector} from 'react-redux';
import LearnOptions from "./routes/LearnOptions";
import {TEST_forecastTimeSeries, TEST_forecastTimeSeries_v2, TEST_sliceTimeSeries} from "./util/NN_Backtesting";

function App() {

    /******** TEST CASES ********/
    // DateUtils.TEST_getLastBusinessDay();
    // PricingUtils.TEST_cumulativeDistributionNormal();
    // PricingUtils.TEST_priceCall();

    //TEST_sliceTimeSeries();
    //TEST_forecastTimeSeries_v2();
    /******** END OF TEST CASES ********/

    const [coins, setCoins] = useState([])
    const userCurrency = useSelector(store => store.userCurrency.value);

    const baseUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=';
    const paramUrl = '&order=market_cap_desc&per_page=5&page=1&sparkline=false';

    useEffect(() => {

        let currencyLabel = userCurrency.code;
        //let currencyLabel = 'eur';

        let data_url = baseUrl + currencyLabel + paramUrl;
        //console.log("App().useEffect() data_url = " + data_url);

        axios.get(data_url).then((response) => {
            setCoins(response.data);
            //console.log(response.data[0])
        }).catch((error) => {
            console.log(error);
            setCoins(null);
        })
    }, [userCurrency])


    return (
        <>
            <Navbar/>
            <Routes>

                <Route path='/' element={<CoinsTable coins={coins}/>}/>
                <Route path='/coin' element={<CoinDetails/>}>
                    <Route path=':coinId' element={<CoinDetails/>}/>
                </Route>
                <Route path='/option-prices' element={<CoinOptions/>}>
                    <Route path=':coinId' element={<CoinOptions spotValue={1500}/>}/>
                </Route>

                <Route path='/learn-options' element={<LearnOptions/>}/>

            </Routes>
            <Footer/>
        </>
    );
}

export default App;
