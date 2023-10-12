import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {HashRouter} from "react-router-dom";
import ReactGA from "react-ga4";
import store from './store.js'
import {Provider} from 'react-redux'
import "./i18n";

if (!window.location.href.includes("localhost")) {
    console.log("index.js href = " + window.location.href + " => init GA");
    ReactGA.initialize("G-CM3P82MGVP");
} else {
    console.log("index.js This is localhost => do not init GA ");
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HashRouter>
            <Provider store={store}>
                <App/>
            </Provider>
        </HashRouter>
    </React.StrictMode>
);
