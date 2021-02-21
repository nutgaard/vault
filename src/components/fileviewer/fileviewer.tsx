import React from 'react';
import {Filesystem} from "../../hooks/use-filesystem";
import FileViewEditor from "./file-view-editor";
import css from './fileviewer.module.css';

interface Props {
    fs: Filesystem
}

function NoSelectedFile() {
    return (
        <div className={css.no_selected_file}>
            <h1>Select file</h1>
        </div>
    );
}

function Fileviewer(props: Props) {
    const { activeOpenFile } = props.fs;
    if (!activeOpenFile) {
        return <NoSelectedFile />;
    }
    return <FileViewEditor fs={props.fs} activeOpenFile={activeOpenFile}/>
}

export default Fileviewer;
