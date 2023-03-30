import React from 'react';
// import ReactDOM from 'react-dom/client';
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
// import {HashRouter} from "react-router-dom";

// https://stackoverflow.com/a/71690259/2068732
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<App />);

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </React.StrictMode>
);

// ReactDOM.render(
//     <HashRouter basename={process.env.PUBLIC_URL}>
//         <App/>
//     </HashRouter>,
//     document.getElementById('root')
// );

// ReactDOM.render(
//     <BrowserRouter basename={process.env.PUBLIC_URL}>
//         <App/>
//     </BrowserRouter>,
//     document.getElementById('root')
// );
