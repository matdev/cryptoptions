import React from "react";
import {Link} from 'react-router-dom';

import './Footer.css'

const Footer = () => {
    return (
        <div>
            <h1>
            </h1>
            <p className={'version_tag'}>
                version 0.6.4
            </p>

            <p className={'version_tag'}>
                Want to be notified when app is released ? <br/> Any feedback or feature request ? <br/><br/>
                Please join us on<Link to="https://discord.gg/srYeUy9CcR" target='_blank'> Discord </Link>
            </p>
            <p className={'version_tag'}>

            </p>
        </div>
    )
}

export default Footer;
