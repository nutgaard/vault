import {EditFile, Filesystem} from "../../hooks/use-filesystem";
import css from "./file-view-editor.module.css";
import React, {ChangeEvent, useEffect, useRef} from "react";
import cls from "../cls";

interface Props {
    fs: Filesystem
    activeOpenFile: EditFile;
}

function ViewEditor(props: Props) {
    const { fs, activeOpenFile } = props;
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref.current) {
            const element = ref.current;
            element.focus();
            element.setSelectionRange(element.value.length, element.value.length);
        }
    }, [ref]);

    const onChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        fs.updateFile(activeOpenFile, value);
    };

    return (
        <textarea
            ref={ref}
            className={css.editor_view}
            onChange={onChangeHandler}
            value={activeOpenFile.editContent}
        />
    );
}

function FileViewEditor(props: Props) {
    const { fs, activeOpenFile } = props;
    const tabs = fs.openFiles
        .map((file) => {
            const changeMarking = file.editContent !== file.content ? ' *' : '';
            return (
                <li key={file.filepath} className={cls(css.tab, activeOpenFile.filepath === file.filepath ? css.tab_active : null)}>
                    <button className={css.tab_label} onClick={() => fs.openFile(file)}>{file.filepath}{changeMarking}</button>
                    <button className={css.tab_close} onClick={() => fs.closeFile(file)}>✕</button>
                </li>
            );
        });
    return (
        <div className={css.wrapper}>
            <ul className={css.tabs}>
                {tabs}
            </ul>
            <ViewEditor fs={fs} activeOpenFile={activeOpenFile} />
        </div>
    );
}

export default FileViewEditor;
