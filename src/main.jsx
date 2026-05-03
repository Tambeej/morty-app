// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
//
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
//

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./context/ToastContext.jsx";
import "./i18n"; // also needed, I'll explain below
import './styles/globals.css';
import './styles/wizard.css';


ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ToastProvider>
            <App />
        </ToastProvider>
    </React.StrictMode>
);