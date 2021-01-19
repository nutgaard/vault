import React from 'react';
import state, {
    listviewState,
    ListviewState,
    loadingFileviewState,
    loadnewState,
    promptPasswordState,
    StateAlike
} from "../../recoil/state";
import css from './encrypted-files.module.css';
import listviewCss from './listview.module.css';
import {useSetRecoilState} from "recoil";
import Box from '../../components/box/box';
import Button from "../../components/button/button";
import * as DB from '../../database';
import Encryption from "../../encryption/encryption";
import {alert, promptSecret} from "../../components/user-popup-inputs/user-popup-inputs";

interface ListProps extends StateAlike<ListviewState> {
}

const encryption = new Encryption()
function ListOfFiles(props: ListProps) {
    const setState = useSetRecoilState(state);
    const clickHandler = (file: string) => async () => {
        setState(promptPasswordState(props));
        const content = await DB.get(file);
        const password = await promptSecret(`Password for ${file}?`)
        if (password == null) {
            setState(listviewState(props));
        } else if (!await encryption.verifyPassword(password, content)) {
            await alert('Invalid password');
            setState(listviewState(props));
        } else {
            const decryptedString = await encryption.decrypt(password, content)
            const filecontent = JSON.parse(decryptedString);

            setState(loadingFileviewState({ file, files: props.files, content: filecontent }));
        }
    }
    const elements = props.files
        .map((element) => (
            <li className={listviewCss.list_element} key={element}>
                <button className={css.link_button} onClick={clickHandler(element)}>{element}</button>
            </li>
        ));

    return (
        <ul className={listviewCss.list_of_files}>
            {elements}
        </ul>
    );
}

function NoFiles() {
    return (
        <div className={css.no_content}>
            <p>No local files</p>
        </div>
    );
}

interface Props {
    state: ListviewState;
}

function EncryptedFiles(props: Props) {
    const files = props.state.files;
    const setState = useSetRecoilState(state);
    const loadfileCallback = () => setState(loadnewState({files}));
    const content = files.length === 0 ? <NoFiles/> : <ListOfFiles files={files}/>

    const header: React.ReactNode = "List of loaded files";
    const footer: React.ReactNode = (
        <>
            <span />
            <Button onClick={loadfileCallback}>Load new file</Button>
        </>
    );

    return (
        <Box header={header} footer={footer}>
            {content}
        </Box>
    )
}

export default EncryptedFiles;
