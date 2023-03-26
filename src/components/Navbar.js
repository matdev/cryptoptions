import React from 'react'

import {MdEuroSymbol} from "react-icons/md";

import {Link} from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
    return (
        <Link to='/'>
            <div className='navbar'>
                <MdEuroSymbol className='icon'/>
                <h1>Crypt<span className='purple'>Options</span></h1>
                <h3>
                    The app for crypto derivatives traders
                </h3>
            </div>
        </Link>
    )
}

export default Navbar
