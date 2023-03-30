import React from 'react';
import ReactDOM from 'react-dom/client';
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import './index.css';
import App from './App';
//import {BrowserRouter} from 'react-router-dom';
//import {createHashRouter, RouterProvider} from 'react-router-dom';
import {HashRouter} from "react-router-dom";

// https://stackoverflow.com/a/71690259/2068732
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<App />);


// https://stackoverflow.com/questions/71984401/react-router-not-working-with-github-pages/71985764#71985764
// V1:

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </React.StrictMode>
);

// const router = createHashRouter([
//     {
//         path: "/*",
//         element: <App/>,
//     }
// ]);
//
// ReactDOM.createRoot(document.getElementById('root')).render(
//     <React.StrictMode>
//         <RouterProvider router={router} />
//     </React.StrictMode>
// );
// END OF https://stackoverflow.com/questions/71984401/react-router-not-working-with-github-pages/71985764#71985764

// const rootElement = document.getElementById("root");
// const root = createRoot(rootElement);
//
// root.render(
//
// <React.StrictMode>
//     // <BrowserRouter>
//     // <App/>
//     // </BrowserRouter>
//     // </React.StrictMode>
// // );

// ReactDOM.render(
//
// <HashRouter basename={process.env.PUBLIC_URL}>
//     // <App/>
//     // </HashRouter>
// ,
//     document.getElementById('root')
// );

// ReactDOM.render(
//
// <BrowserRouter basename={process.env.PUBLIC_URL}>
//     // <App/>
//     // </BrowserRouter>
// ,
//     document.getElementById('root')
// );
