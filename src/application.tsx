import React, {useEffect} from 'react';
import Encryption, {EncodedEncryptedContent} from './encryption/encryption';
import './application.css';
import * as DB from './database';
import Input from './components/input/input'
import BrowseButton from "./components/browse-button/browse-button";

interface FileData {
    filepath: string;
    content: string;
}
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

function openGithubWindow() {
    const w = 800;
    const h = 800;
    const y = window.top.outerHeight / 2 + window.top.screenY - ( h / 2);
    const x = window.top.outerWidth / 2 + window.top.screenX - ( w / 2);
    const features = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`;
    window.open('https://github.com/nutgaard/vault-storage/tree/master/data', 'vault-data', features, true)
}

function Application() {
    useEffect(() => {
        testing();
    }, []);

    return (
        <div className="application">
            <header className="application__header">
                <img src={`${process.env.PUBLIC_URL}/logo.svg`} className="application__logo block-m" alt="splash screen of lock"/>
                <Input type="text" placeholder="URL to data file" className="block-m"/>
                <BrowseButton onClick={openGithubWindow}>
                    Browse files
                </BrowseButton>
            </header>
        </div>
    );
}

export default Application;
