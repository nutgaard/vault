import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from "recoil";
import Application from './application';
// import reportWebVitals from './reportWebVitals';
import './index.css';
import './encryption/domain';
import { setAppElement } from './components/user-popup-inputs/user-popup-inputs'

const appRoot: HTMLElement = document.getElementById('root')!!;
setAppElement(appRoot);

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <Application />
        </RecoilRoot>
    </React.StrictMode>,
    appRoot
);

// reportWebVitals(console.log);
