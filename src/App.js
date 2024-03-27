import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {Routes, Route, useLocation} from 'react-router-dom'
import ReactGA from "react-ga4";
import HomePage from './components/HomePage'
import CoinDetails from './routes/CoinDetails'
import CoinCorrelations from './routes/CoinCorrelations'
import Navbar from './components/Navbar'
import CoinOptions from "./routes/CoinOptions";
import Footer from './components/Footer';
import {useSelector} from 'react-redux';
import LearnOptions from "./routes/LearnOptions";
import IndexMajorCoinsDetails from './routes/IndexMajorCoinsDetails'

function App() {

    /******** TEST CASES ********/
    // DateUtils.TEST_getLastBusinessDay();
    // PricingUtils.TEST_cumulativeDistributionNormal();
    // PricingUtils.TEST_priceCall();

    //TEST_sliceTimeSeries();
    /******** END OF TEST CASES ********/

    const location = useLocation();

    const [coins, setCoins] = useState([])
    const userCurrency = useSelector(store => store.userCurrency.value);

    const baseUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=';
    const paramUrl = '&order=market_cap_desc&per_page=10&page=1&sparkline=false';

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

        let pageTitle = "Analytics and valuation tools for options on cryptocurrencies | CryptOptions";
        document.title = pageTitle;

        // Log view into Google Analytics
        //console.log("useEffect() pathname = " + location.pathname + " pageTitle = " + pageTitle);
        ReactGA.send({ hitType: "pageview", page: location.pathname, title: pageTitle });
    }, [userCurrency])


    return (
        <>
            <Navbar/>
            <Routes>

                <Route path='/coin-correlations' element={<CoinCorrelations coins={coins}/>}/>

                <Route path='/' element={<HomePage coins={coins}/>}/>
                <Route path='/coin' element={<CoinDetails/>}>
                    <Route path=':coinId' element={<CoinDetails />}/>
                </Route>
                <Route path='/option-prices' element={<CoinOptions/>}>
                    <Route path=':coinId' element={<CoinOptions spotValue={1500}/>}/>
                </Route>

                <Route path='/learn-options' element={<LearnOptions/>}/>

                <Route path='/major-coins-index' element={<IndexMajorCoinsDetails coins={coins}/>}/>

            </Routes>
            <Footer/>
        </>
    );
}

export default App;
