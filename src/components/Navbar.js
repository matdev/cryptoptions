import React from 'react'

import logo from '../assets/img.png'

import {Link} from 'react-router-dom'
import './Navbar.css'
import BaseCurrencySelect from './BaseCurrencySelect'

const Navbar = (props) => {

    return (

        <div className='navbar'>
            <Link to='/'>
                <img src={logo} className="App-logo" alt="CryptOptions"/>
            </Link>
            <Link to='/'>
                <h1 className='app_name'>Crypt<span className='options'>Options</span><p
                    className='app_pitch hide-mobile'>Fair prices of options on cryptocurrencies</p>
                </h1>
            </Link>
            <p className='beta_label hide-mobile'>Beta</p>
            <BaseCurrencySelect />
        </div>

    )
}

export default Navbar
