import React from 'react';

import logo from '../assets/logo192.png';

import {Link, NavLink} from 'react-router-dom'
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {MdMenu} from "react-icons/md";
import {MdClose} from "react-icons/md";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import './Navbar.css'
import BaseCurrencySelect from './BaseCurrencySelect'
import LanguageSwitcher from './LanguageSwitcher'

import {LANGUAGES} from "../util/StringUtils";
import {useTranslation} from 'react-i18next';

const Navbar = (props) => {


    const drawerAnchor = 'left';

    const {i18n, t} = useTranslation();
    const onChangeLang = (e) => {
        const lang_code = e.target.value
        i18n.changeLanguage(lang_code)
    }

    const onChangeLangFromDrawer = (e) => {
        toggleDrawer(drawerAnchor, false)
        //onChangeLang(e);
    }

    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({...state, [anchor]: open});
    };

    function onClickedMenuItem(param) {
        console.log("onClickedMenuItem() param : " + param)
    };

    function getMenuItemTitle(genericPart, coinName) {
        let result = genericPart + " " + coinName;
        return result;
    }

    const drawerMenuList = (anchor) => (
        <Box
            sx={{width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250}}
            role="presentation"
            // onClick={toggleDrawer(anchor, false)}
            // onKeyDown={toggleDrawer(anchor, false)}
        >
            <List className='drawer-list'>

                <ListItem
                    key={'close'}
                    onClick={toggleDrawer(anchor, false)}
                    onKeyDown={toggleDrawer(anchor, false)}
                    divider={true}>

                    <MdClose className=''/>

                    <span>
                        <img src={logo} className="app-logo-in-drawer" alt="CryptOptions"/>
                    </span>

                    <div className='app_name_div'>
                        <h3 className='app-name-in-drawer'>Crypt<span className='options'>Options</span></h3>
                    </div>
                </ListItem>

                <ListItem
                    component={NavLink}
                    to={`/coin-correlations`}
                    state={''}
                    className={'drawer-menu-item'}
                    divider={true}
                    key={'coin-correlations'}
                    onClick={toggleDrawer(anchor, false)}>

                    <ListItemText primary={t("coin_correlations")}/>

                </ListItem>

                <ListItem
                    component={NavLink}
                    to={`/option-prices/bitcoin`}
                    state={{spotValue: '25000'}}
                    className={'drawer-menu-item'}
                    divider={true}
                    key={'bitcoin'}
                    onClick={toggleDrawer(anchor, false)}>

                    <ListItemText primary={getMenuItemTitle(t("options_on"), "Bitcoin")}/>

                </ListItem>

                <ListItem
                    component={NavLink}
                    to={`/option-prices/ethereum`}
                    state={{spotValue: '1800'}}
                    className={'drawer-menu-item'}
                    divider={true}
                    key={'ethereum'}
                    onClick={toggleDrawer(anchor, false)}>

                    <ListItemText primary={getMenuItemTitle(t("options_on"), "Ethereum")}/>

                </ListItem>

                <ListItem
                    component={NavLink}
                    to={`/learn-options`}
                    className={'drawer-menu-item'}
                    divider={true}
                    key={'learn-options'}
                    onClick={toggleDrawer(anchor, false)}>

                    <ListItemText primary={t("learn_options")}/>

                </ListItem>

                <ListItem
                    key={'language-selector'}
                    divider={false}>

                    <div>
                        <LanguageSwitcher/>
                    </div>

                </ListItem>

                <ListItem
                    key={'currency-selector'}
                    divider={false}>
                    <div>
                        <BaseCurrencySelect/>
                    </div>
                </ListItem>

            </List>
        </Box>
    );

    return (

        <div className='navbar-parent'>
            <div className='navbar-header hide-mobile'>
                <div>
                    <BaseCurrencySelect/>
                </div>

                <div>
                    <LanguageSwitcher/>
                </div>
                {/*<div>*/}
                {/*    <select className="language_selector" defaultValue={i18n.language} onChange={onChangeLang}>*/}
                {/*        {LANGUAGES.map(({code, label}) => (*/}
                {/*            <option key={code} value={code}>*/}
                {/*                {label}*/}
                {/*            </option>*/}
                {/*        ))}*/}
                {/*    </select>*/}
                {/*</div>*/}
            </div>
            <div className='navbar'>
                <div className='logo_section'>

                    <Link to='/'>
                    <span>
                        <img src={logo} className="app-logo" alt="CryptOptions"/>
                    </span>
                    </Link>

                    <Link to='/'>
                        <div className='app_name_div'>
                            <h1 className='app-name'>Crypt<span className='options'>Options</span></h1>
                            <p className='beta_label hide-mobile'>Beta</p>
                        </div>
                        {/*<p className='app_pitch hide-mobile'>Insights, forecasts and trade ideas for crypto traders</p>*/}
                        <p className='app_pitch hide-mobile'>{t("app_pitch")}</p>

                    </Link>

                    <div className='mobile-only'>

                        <React.Fragment key='left'>
                            <IconButton onClick={toggleDrawer('left', true)}>
                                <MdMenu className='drawer-menu-button'/>
                            </IconButton>
                            <Drawer
                                anchor={drawerAnchor}
                                open={state['left']}
                                onClose={toggleDrawer('left', false)}
                            >
                                {drawerMenuList(drawerAnchor)}
                            </Drawer>
                        </React.Fragment>
                    </div>

                    <NavLink to='/coin-correlations' className={({isActive}) =>
                        isActive ? 'navbar_link_active' : 'navbar_link'}>
                        <h4>{t("coin_correlations")}</h4>
                    </NavLink>

                    <NavLink to='/option-prices/bitcoin' state={{spotValue: '25000'}} className={({isActive}) =>
                        isActive ? 'navbar_link_active' : 'navbar_link'}>
                        <h4>{t("options_on")} Bitcoin</h4>
                    </NavLink>

                    <NavLink to='/option-prices/ethereum' state={{spotValue: '1800'}} className={({isActive}) =>
                        isActive ? 'navbar_link_active' : 'navbar_link'}>
                        <h4>{t("options_on")} Ethereum</h4>
                    </NavLink>

                    <NavLink to='/learn-options' className={({isActive}) =>
                        isActive ? 'navbar_link_active' : 'navbar_link'}>
                        <h4>{t("learn_options")}</h4>
                    </NavLink>
                </div>
            </div>
        </div>

    )
}

export default Navbar
