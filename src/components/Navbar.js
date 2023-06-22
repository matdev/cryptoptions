import React from 'react';

import logo from '../assets/img.png';

import {Link, NavLink} from 'react-router-dom'

import './Navbar.css'
import BaseCurrencySelect from './BaseCurrencySelect'
import CoinOptionsTable from "../routes/CoinOptionsTable";

const Navbar = (props) => {

    return (

        <div className='navbar'>
            <div className='logo_section'>

                <Link to='/'>
                    <span>
                        <img src={logo} className="app_logo" alt="CryptOptions"/>
                    </span>
                </Link>

                <Link to='/'>
                    <div className='app_name_div'>
                        <h1 className='app_name'>Crypt<span className='options'>Options</span></h1>
                        <p className='beta_label hide-mobile'>Beta</p>
                    </div>
                    <p className='app_pitch hide-mobile'>Fair prices of options on cryptocurrencies</p>
                </Link>

                <NavLink to='/option-prices/bitcoin' state={{ spotValue:'25000' }} className='navbar_link hide-mobile' >
                    <h4>Options on Bitcoin</h4>
                </NavLink>

                <NavLink to='/option-prices/ethereum' state={{ spotValue:'1800' }} className='navbar_link hide-mobile' >
                    <h4>Options on Ethereum</h4>
                </NavLink>
                <NavLink to='/learn-options' className='navbar_link hide-mobile' >
                    <h4>Learn Options</h4>
                </NavLink>
            </div>
            <div>
                <BaseCurrencySelect/>
            </div>
        </div>

    )
}

export default Navbar
