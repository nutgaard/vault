import React from "react";
import {useSetRecoilState} from "recoil";
import state, {FileviewState, lockingFileviewState, StateAlike} from "../../recoil/state";
import css from './fileview.module.css';

function Fileview(props: { state: StateAlike<FileviewState> }) {
    const setState = useSetRecoilState(state);
    const lock = () => {
        setState(lockingFileviewState(props.state))
    }
    console.log('css', css.fileview);
    return (
        <article className={css.fileview}>
            <div className={css.logo} style={{backgroundColor: 'darkcyan'}}>
                Image here
            </div>
            <header className={css.header} style={{backgroundColor: 'darkblue'}}>
                <h1>This is the fileview</h1>
            </header>
            <aside className={css.sidebar} style={{backgroundColor: 'darkgoldenrod'}}>
                <p>Filetree here</p>
            </aside>
            <div className={css.buttons} style={{backgroundColor: 'darkgreen'}}>
                <button onClick={lock}>Lock</button>
            </div>
            <main className={css.content} style={{backgroundColor: 'darkred'}}>
            <pre>
                {JSON.stringify(props.state, null, 2)}
            </pre>
            </main>
        </article>
    );
}

export default Fileview;
