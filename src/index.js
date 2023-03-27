import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//import { BrowserRouter } from 'react-router-dom';
//import {HashRouter} from "react-router-dom";
import { HashRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router>
        <App />
    </Router>
);

// ReactDOM.render(
//     <BrowserRouter basename={process.env.PUBLIC_URL}>
//       <App />
//     </BrowserRouter>,
//     // <HashRouter base="/">
//     //     <App/>
//     // </HashRouter>,
//     document.getElementById('root')
// );

