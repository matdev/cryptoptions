import React from "react";
import {Link} from 'react-router-dom';
import {BsTwitter} from "react-icons/bs";
import './Footer.css'
import {useTranslation} from "react-i18next";

const Footer = () => {

    const {i18n, t} = useTranslation();

    return (
        <div>
            <br/>
            <h1>

            </h1>
            <p className='twitter-link'>
                {t("follow_us_on")} &nbsp;<b> <Link to="https://cryptoptionsai.substack.com/"
                                            target='_blank'> {t("substack")} </Link> </b>
            </p>
            <p className={'version_tag'}>
                {t("curious_about_this_app")} <br/> {t("any_feedback_or_feature_request")} <br/><br/>
                {t("reach_us_on")} <Link to="https://twitter.com/CryptOptionsApp" target='_blank'>
                <span><b>&nbsp;{t("twitter")} </b></span></Link>
            </p>

            <p className={'coingecko_ref'}>
                {t("coin_prices_provided_by")} <Link to="https://www.coingecko.com"
                                                     target='_blank'> {t("coingecko")} </Link>
            </p>
            <p className={'version_tag'}>
                version {process.env.REACT_APP_VERSION} (beta)
            </p>
        </div>
    )
}

export default Footer;
