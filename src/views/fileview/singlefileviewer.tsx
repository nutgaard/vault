import React, {useState} from 'react';
import css from "./fileview.module.css";
import * as DB from "../../database";
import state, {FileviewState, fileviewState, StateAlike} from "../../recoil/state";
import {alert, promptSecret} from "../../components/user-popup-inputs/user-popup-inputs";
import {useRecoilState, useSetRecoilState} from "recoil";
import Encryption from "../../encryption/encryption";

interface Props {
    state: StateAlike<FileviewState>;
    selected?: {
        filepath: string;
        content: string;
    }
}

async function getCheckedPassword(message: string): Promise<string | null> {
    const password = await promptSecret(message, async (value) => {
        const isValid = value === null || value.length > 0;
        if (!isValid) {
            await alert('Password must be set');
        }
        return isValid;
    });
    if (password === null) {
        return null;
    }
    const repassword = await promptSecret(`RE-ENTER: ${message}`, async (value) => {
        const isValid = value === null || value === password
        if (!isValid) {
            await alert('Password did not match');
        }
        return isValid;
    });
    if (repassword === null) {
        return null;
    }
    return password;
}
type UnlockedContent = Array<{ filepath: string, content: string }>;
const encryption = new Encryption();

function SingleFileViewer(props: Props) {
    const { file, files, content } = props.state;
    const setState = useSetRecoilState(state);
    const [localContent, setlocalContent] = useState<UnlockedContent>(content);
    if (props.selected === undefined) {
        return (
            <h1>Select file</h1>
        );
    }

    const saveUpdated = async () => {
        const password = await getCheckedPassword(`Password for ${file}?`);
        if (password === null) {
            return;
        }
        const encrypted = await encryption.encrypt(password, JSON.stringify(localContent));
        await DB.set(file, encrypted);
        setState(fileviewState({ files, file, content: localContent }))
    }

    const simulateAddingContent = () => {
        setlocalContent((current) => {
            return [...current]
                .map(({ filepath, content}) => ({
                    filepath,
                    content: filepath === props.selected?.filepath ? `${content} UPDATED` : content
                }));
        })
        saveUpdated();
    }

    return (
        <>
            <button onClick={simulateAddingContent}>Update and save</button>
            <pre className={css.content_view}>{props.selected.content}</pre>
        </>
    );
}

export default SingleFileViewer;
