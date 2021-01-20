import React, {useState} from "react";
import {useSetRecoilState} from "recoil";
import state, {FileviewState, lockingFileviewState, StateAlike} from "../../recoil/state";
import css from './fileview.module.css';
import Filetree from "../../components/filetree/filetree";

function Fileview(props: { state: StateAlike<FileviewState> }) {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const setState = useSetRecoilState(state);
    const lock = () => {
        setState(lockingFileviewState(props.state))
    };

    const files = props.state.content.map((file) => file.filepath);
    const selectedContent = props.state.content.find((c) => c.filepath === selectedFile);

    return (
        <article className={css.fileview}>
            <div className={css.logo}>
                <img src={`${process.env.PUBLIC_URL}/lock__open.svg`} alt="Vault unlocked" />
                <span>Vault unlocked</span>
            </div>
            <header className={css.header}>
                <p>Showing files in {props.state.file}</p>
            </header>
            <aside className={css.sidebar}>
                <Filetree files={files} selected={selectedFile} onSelect={(file: string) => { setSelectedFile(file); }}/>
            </aside>
            <div className={css.buttons}>
                <button className={css.lock_button} onClick={lock}>
                    <img src={`${process.env.PUBLIC_URL}/lock.svg`} alt="Lock vault" />
                </button>
            </div>
            <main className={css.content}>
                { selectedFile == null ? <h1>Select file</h1> : <pre className={css.content_view}>{selectedContent?.content}</pre>}
            </main>
        </article>
    );
}

export default Fileview;
