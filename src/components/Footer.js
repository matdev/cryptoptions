import React from "react";
import {Link} from 'react-router-dom';

import './Footer.css'

const Footer = () => {
    return (
        <div>
            <h1>
            </h1>
            <p className={'version_tag'}>
                Curious about this app ? <br/> Any feedback or feature request ? <br/><br/>
                <b>Join us on<Link to="https://discord.gg/srYeUy9CcR" target='_blank'> Discord </Link> </b>
            </p>
            <p className={'coingecko_ref'}>
                Coin prices provided by <Link to="https://www.coingecko.com" target='_blank'> CoinGecko </Link>
            </p>
            <p className={'version_tag'}>
                version 0.7.5 (beta)
            </p>
        </div>
    )
}

export default Footer;
