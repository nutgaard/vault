import React, {useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import * as DB from './database';
import state, {fileviewState, initState, isFileviewAlike, listviewState, States} from "./recoil/state";
import {useAsyncEffect} from "./hooks/use-async-effect";
import EncryptedFiles from "./views/encrypted-files/encrypted-files";
import css from './application.module.css';
import LoadNew from "./views/load-new/load-new";
import cls from "./components/cls";
import CopyPasteContent from "./views/load-new/copy-paste-content";
import UploadContent from "./views/load-new/upload-content";
import LinkToContent from "./views/load-new/link-to-content";
import Fileview from "./views/fileview/fileview";
import {useDelayedEffect} from "./hooks/use-delayed-effect";

(window as any).IDB = DB;

function getView(state: States): React.ReactElement<{}> {
    switch (state.key) {
        case "init":
            return <></>
        case "listview":
            return <EncryptedFiles state={state}/>
        case "promptpassword":
            return <></>
        case "loadnew":
            return <LoadNew state={state}/>
        case "loadnew_copypaste":
            return <CopyPasteContent state={state}/>
        case "loadnew_linktofile":
            return <LinkToContent state={state}/>
        case "loadnew_uploadfile":
            return <UploadContent state={state}/>
        case "fileview":
        case "fileview_loading":
        case "fileview_locking":
            return <></>
    }
}

function UnlockedLayer() {
    const currentState = useRecoilValue(state);
    if (isFileviewAlike(currentState)) {
        return <Fileview state={currentState}/>
    }
    return null;
}

interface OpeningLayerProps {
    isOpening: boolean;
    onComplete?: () => void;
}
function OpeningLayer(props: OpeningLayerProps) {
    const { isOpening, onComplete } = props;
    const [open, setOpen] = useState<boolean>(!isOpening);
    useDelayedEffect(() => { setOpen(isOpening); }, 100, [setOpen, isOpening]);

    return (
        <div className={cls(css.opening_layer)}>
            <header
                className={cls(css.header, css.split_header, open ? css.split_header__open : null)}
                onTransitionEnd={onComplete}
            >
                <div className={cls(css.pane, css.left_pane)}>
                    <img
                        src={`${process.env.PUBLIC_URL}/lock.svg`}
                        className={cls(css.logo, css.logo_opening, 'block-m')}
                        alt="splash screen of lock"
                    />
                </div>
                <div className={cls(css.pane, css.right_pane)} />
            </header>
        </div>
    );
}

function LockedLayer() {
    const [currentState, setState] = useRecoilState(state);
    useAsyncEffect(async () => {
        if (currentState.key === 'init') {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const files = await DB.keys();
            setState(listviewState({files}));
        }
    }, [currentState])

    const view = getView(currentState);
    const logoclass = css[`logo_${currentState.key}`];

    if (currentState.key === 'fileview_loading') {
        return <OpeningLayer isOpening={true} onComplete={() => setState(fileviewState(currentState))}/>;
    } else if (currentState.key === 'fileview_locking') {
        return <OpeningLayer isOpening={false} onComplete={() => setState(initState(currentState))}/>;
    } else if (currentState.key === 'fileview') {
        return null;
    }

    return (
        <div className={css.application}>
            <header className={css.header}>
                <img
                    src={`${process.env.PUBLIC_URL}/lock.svg`}
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

function Application() {
    return (
        <>
            <UnlockedLayer />
            <LockedLayer />
        </>
    );
}

export default Application;
