import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
//import {HashRouter} from "react-router-dom";

ReactDOM.render(
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <App />
    </BrowserRouter>,
    // <HashRouter base="/">
    //     <App/>
    // </HashRouter>,
    document.getElementById('root')
);

