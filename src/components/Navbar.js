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

const Navbar = (props) => {

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

    const drawerMenuList = (anchor) => (
        <Box
            sx={{width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250}}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List className='drawer-list'>

                <ListItem
                    key={'close'}
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
                    key={'coin-correlations'}>

                    <ListItemText primary='Coin correlations'/>

                </ListItem>

                <ListItem
                    component={NavLink}
                    to={`/option-prices/bitcoin`}
                    state={{spotValue: '25000'}}
                    className={'drawer-menu-item'}
                    divider={true}
                    key={'bitcoin'}>

                    <ListItemText primary='Options on Bitcoin'/>

                </ListItem>

                <ListItem
                    component={NavLink}
                    to={`/option-prices/ethereum`}
                    state={{spotValue: '1800'}}
                    className={'drawer-menu-item'}
                    divider={true}
                    key={'ethereum'}>

                    <ListItemText primary='Options on Ethereum'/>

                </ListItem>

                <ListItem
                    component={NavLink}
                    to={`/learn-options`}
                    className={'drawer-menu-item'}
                    divider={true}
                    key={'learn-options'}>

                    <ListItemText primary='Learn Options'/>

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
                        <p className='app_pitch hide-mobile'>Fair prices of options on cryptocurrencies</p>
                    </Link>

                    <div className='mobile-only'>

                        <React.Fragment key='left'>
                            <IconButton onClick={toggleDrawer('left', true)}>
                                <MdMenu className='drawer-menu-button'/>
                            </IconButton>
                            <Drawer
                                anchor='left'
                                open={state['left']}
                                onClose={toggleDrawer('left', false)}
                            >
                                {drawerMenuList('left')}
                            </Drawer>
                        </React.Fragment>
                    </div>

                    <NavLink to='/coin-correlations' className={({isActive}) =>
                        isActive ? 'navbar_link_active' : 'navbar_link'}>
                        <h4>Coin correlations</h4>
                    </NavLink>

                    <NavLink to='/option-prices/bitcoin' state={{spotValue: '25000'}} className={({isActive}) =>
                        isActive ? 'navbar_link_active' : 'navbar_link'}>
                        <h4>Options on Bitcoin</h4>
                    </NavLink>

                    <NavLink to='/option-prices/ethereum' state={{spotValue: '1800'}} className={({isActive}) =>
                        isActive ? 'navbar_link_active' : 'navbar_link'}>
                        <h4>Options on Ethereum</h4>
                    </NavLink>

                    <NavLink to='/learn-options' className={({isActive}) =>
                        isActive ? 'navbar_link_active' : 'navbar_link'}>
                        <h4>Learn Options</h4>
                    </NavLink>
                </div>
            </div>
        </div>

    )
}

export default Navbar
