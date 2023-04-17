import React from 'react'

import {MdEuroSymbol} from "react-icons/md";
import logo from '../assets/img.png'

import {Link} from 'react-router-dom'
import './Navbar.css'
import BaseCurrencySelect from './BaseCurrencySelect'

const Navbar = (props) => {

    console.log("Navbar()" + props.baseCurrency.code)

    return (
        <Link to='/'>
            <div className='navbar'>
                {/*<MdEuroSymbol className='icon'/>*/}
                <img src={logo} className="App-logo" alt="CryptOptions"/>
                <h1 className='app_name'>Crypt<span className='options'>Options</span><p className='app_pitch hide-mobile'>The app for crypto derivatives
                    traders</p></h1>
                <p className='beta_label'>Beta</p>
                {/*<h3 className="hide-mobile purple">*/}
                {/*    The app for crypto derivatives traders*/}
                {/*</h3>*/}
                <BaseCurrencySelect baseCurrency={props.baseCurrency} stateChanger={props.stateChanger}/>
            </div>
        </Link>
    )
}

export default Navbar
