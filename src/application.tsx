import React from 'react';
import {useRecoilState} from "recoil";
import * as DB from './database';
import state, {listviewState, States} from "./recoil/state";
import {useAsyncEffect} from "./hooks/useAsyncEffect";
import EncryptedFiles from "./views/encrypted-files/encrypted-files";
import css from './application.module.css';
import Encryption, {EncodedEncryptedContent} from "./encryption/encryption";
import LoadNew from "./views/load-new/load-new";
import cls from "./components/cls";

(window as any).IDB = DB;

const sourceDirectory = './';
async function fetchData(source: string): Promise<EncodedEncryptedContent> {
    console.log('fetching data', source);
    const response = await fetch(sourceDirectory + source)
    const encodedData = await response.text();
    const decodedData = Buffer.from(encodedData, 'base64').toString();
    return JSON.parse(decodedData);
}

async function getData(source: string, forceDownload: boolean = false): Promise<EncodedEncryptedContent> {
    const stored = await DB.keys();
    const dbHasData = stored.includes(source);
    if (!dbHasData || forceDownload) {
        const data = await fetchData(source);
        console.log('storing data', source);
        await DB.set(source, data)
        return data;
    }
    console.log('using cached data', source);
    return DB.get(source);
}

async function testing() {
    const data: EncodedEncryptedContent = await getData('data.enc');
    console.log('data', data);

    const encryption = new Encryption();
    const decrypted: string = await encryption.decrypt('password', data);
    const json = JSON.parse(decrypted);
    console.log('json', json);
}
//
// function openGithubWindow() {
//     const w = 800;
//     const h = 800;
//     const y = window.top.outerHeight / 2 + window.top.screenY - ( h / 2);
//     const x = window.top.outerWidth / 2 + window.top.screenX - ( w / 2);
//     const features = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`;
//     window.open('https://github.com/nutgaard/vault-storage/tree/master/data', 'vault-data', features, true)
// }

function getView(state: States): React.ReactElement<{}> {
    switch (state.key) {
        case "init": return <></>
        case "listview": return <EncryptedFiles state={state} />
        case "loadnew": return <LoadNew state={state}/>
        case "fileview": return <div>Loading...</div>
    }
}

function Application() {
    const [currentState, setState] = useRecoilState(state);
    const view = getView(currentState);

    useAsyncEffect(async () => {
        if (currentState.key === 'init') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const files = await DB.keys();
            setState(listviewState({ files }));
        }
    }, [currentState])

    const logoclass = css[`logo_${currentState.key}`];
    return (
        <div className={css.application}>
            <header className={css.header}>
                <img
                    src={`${process.env.PUBLIC_URL}/logo.svg`}
                    className={cls(css.logo, logoclass, 'block-m')}
                    alt="splash screen of lock"
                />
            </header>
            <main className={css.content}>
                {view}
            </main>
        </div>
    );
}

export default Application;
