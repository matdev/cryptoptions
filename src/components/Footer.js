import React from "react";
import {Link} from 'react-router-dom';

import './Footer.css'

const Footer = () => {
    return (
        <div>
            <h1>
            </h1>
            <p className={'version_tag'}>
                version 0.6.3
            </p>

            <p className={'version_tag'}>
                Got feedback ? Feature request ? <br/><br/>
                Please share it on<Link to="https://discord.gg/wbqzNJhv" target='_blank'> Discord </Link>
            </p>
            <p className={'version_tag'}>

            </p>
        </div>
    )
}

export default Footer;
