import React from "react";
import {Link} from 'react-router-dom';
import {BsTwitter} from "react-icons/bs";

import './Footer.css'
import {MdMenu} from "react-icons/md";

const Footer = () => {
    return (
        <div>
            <br/>
            <h1>

            </h1>
            <p className='twitter-link'>
                <Link to="https://twitter.com/CryptOptionsApp" target='_blank'> <BsTwitter/> </Link>
            </p>
            <p className='twitter-link'>
                Follow us on <Link to="https://twitter.com/CryptOptionsApp" target='_blank'> <span><b>&nbsp;Twitter </b></span></Link>
            </p>
            <p className={'version_tag'}>
                Curious about this app ? <br/> Any feedback or feature request ? <br/><br/>
                <b>Join us on<Link to="https://discord.gg/srYeUy9CcR" target='_blank'> Discord </Link> </b>
            </p>
            <p className={'coingecko_ref'}>
                Coin prices provided by <Link to="https://www.coingecko.com" target='_blank'> CoinGecko </Link>
            </p>
            <p className={'version_tag'}>
                version 0.7.16 (beta)
            </p>
        </div>
    )
}

export default Footer;
