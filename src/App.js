import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {Routes, Route} from 'react-router-dom'
import CoinsTable from './components/CoinsTable'
import CoinDetails from './routes/CoinDetails'
import Navbar from './components/Navbar'
import CoinOptionsTable from "./routes/CoinOptionsTable";

function App() {

    const [coins, setCoins] = useState([])

    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=10&page=1&sparkline=false'

    useEffect(() => {
        axios.get(url).then((response) => {
            setCoins(response.data)
            console.log(response.data[0])
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    return (
        <>
            <Navbar/>
            <Routes>
                <Route path='/' element={<CoinsTable coins={coins}/>}/>
                <Route path='/coin' element={<CoinDetails/>}>
                    <Route path=':coinId' element={<CoinDetails/>}/>
                </Route>
                <Route path='/option-prices' element={<CoinOptionsTable/>}>
                    <Route path=':coinId' element={<CoinOptionsTable spotValue={1500} />}/>
                </Route>
            </Routes>

        </>
    );
}

export default App;
