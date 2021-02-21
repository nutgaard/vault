import React, {useEffect, useState} from "react";
import {useSetRecoilState} from "recoil";
import state, {FileviewState, lockingFileviewState, StateAlike} from "../../recoil/state";
import css from './vault-unlocked.module.css';
import Filetree from "../../components/filetree/filetree";
import {useFilesystem} from "../../hooks/use-filesystem";
import Fileviewer from "../../components/fileviewer/fileviewer";

function VaultUnlocked(props: { state: StateAlike<FileviewState> }) {
    const fs = useFilesystem(props.state.content);

    const setState = useSetRecoilState(state);
    const lock = () => {
        setState(lockingFileviewState(props.state))
    };
    useEffect(() => {
        console.log('FS debugging', fs);
    }, [fs]);

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
                <Filetree filesystem={fs} />
            </aside>
            <div className={css.buttons}>
                <button className={css.lock_button} onClick={lock}>
                    <img src={`${process.env.PUBLIC_URL}/lock.svg`} alt="Lock vault" />
                </button>
            </div>
            <main className={css.content}>
                <Fileviewer fs={fs} />
            </main>
        </article>
    );
}

export default VaultUnlocked;
