import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from "recoil";
import Application from './application';
import reportWebVitals from './reportWebVitals';
import './index.css';
import * as t from 'io-ts';
import {PathReporter} from "io-ts/PathReporter";

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <Application />
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);

reportWebVitals(console.log);

const User = t.type({
    name: t.string,
    age: t.number
});
type User = t.TypeOf<typeof User>
const result = User.decode({
    name: 'hei',
    age: '123'
});
console.log('user', result, PathReporter.report(result));

