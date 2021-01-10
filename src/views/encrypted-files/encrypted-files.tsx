import React from 'react';
import state, {ListviewState, loadnewState, StateAlike} from "../../recoil/state";
import css from './encrypted-files.module.css';
import listviewCss from './listview.module.css';
import {useSetRecoilState} from "recoil";
import Box from '../../components/box/box';
import Button from "../../components/button/button";

interface ListProps extends StateAlike<ListviewState> {
}

function ListOfFiles(props: ListProps) {
    const elements = props.files
        .map((element) => (
            <li className={listviewCss.list_element} key={element.toString()}>
                <a href="#">{element}</a>
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
