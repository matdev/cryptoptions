import React from 'react'

import {MdEuroSymbol} from "react-icons/md";
import logo from '../assets/img.png'

import {Link} from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
    return (
        <Link to='/'>
            <div className='navbar'>
                {/*<MdEuroSymbol className='icon'/>*/}
                <img src={logo} className="App-logo" alt="CryptOptions" />
                <h1>Crypt<span className='options'>Options</span><p className='beta_label'>Beta</p></h1>
                <h3>
                    The app for crypto derivatives traders
                </h3>
            </div>
        </Link>
    )
}

export default Navbar
