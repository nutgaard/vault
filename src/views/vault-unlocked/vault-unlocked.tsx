import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {useSetRecoilState} from "recoil";
import state, {FileviewState, lockingFileviewState, StateAlike} from "../../recoil/state";
import css from './vault-unlocked.module.css';
import Filetree from "../../components/filetree/filetree";
import {Filesystem, useFilesystem} from "../../hooks/use-filesystem";
import Fileviewer from "../../components/fileviewer/fileviewer";
import {alert, confirm, promptSecret} from "../../components/user-popup-inputs/user-popup-inputs";
import Encryption from "../../encryption/encryption";
import * as DB from "../../database";

type Hotkey<ARGS> = {
    event: keyof WindowEventMap;
    test(e: KeyboardEvent, args: ARGS): boolean;
    run(e: KeyboardEvent, args: ARGS): void;
}

function groupBy<T>(fn: (t: T) => any): (acc: Record<any, T[]>, el: T) => Record<any, T[]> {
    return (acc, el) => {
        const key = fn(el);
        const group = acc[key] || [];
        group.push(el);
        acc[key] = group;
        return acc;
    }
}

interface HotKeyArgs {
    fs: Filesystem;
    passwordVerifier: (password: string) => Promise<boolean>;
    sourceFile: string;
}

const encryption = new Encryption();
const hotkeys: Hotkey<HotKeyArgs>[] = [
    {
        event: 'keydown',
        test(e: KeyboardEvent) {
            return e.ctrlKey && e.key === 's';
        },
        async run(e: KeyboardEvent, args: HotKeyArgs) {
            console.log('correctPassword', args);
            const activeFile = args.fs.activeOpenFile;
            if (activeFile && activeFile.content !== activeFile.editContent) {
                const password = await promptSecret(`Password for ${args.sourceFile}?`)
                if (password) {
                    const correctPassword = await args.passwordVerifier(password);
                    if (!correctPassword) {
                        await alert('Incorrect password.')
                    } else {
                        const serializedFilesystem = args.fs.saveFile(activeFile);
                        console.log('serializedFilesystem', serializedFilesystem);
                        const encrypted = await encryption.encrypt(password, JSON.stringify(serializedFilesystem))
                        await DB.set(args.sourceFile, encrypted);
                    }
                }
            }
        }
    }
]

type ArgsUpdate<ARGS> = (newArgs: ARGS) => void;
function useHotkeys<ARGS>(hotkeys: Array<Hotkey<ARGS>>, args: ARGS): ArgsUpdate<ARGS> {
    const argsHolder = useRef<ARGS>(args);
    const argsUpdate = useCallback((newArgs: ARGS) => { argsHolder.current = newArgs}, []);
    const listeners: Array<{ add(): void; remove(): void; }> = useMemo(() => {
        const groups: Record<any, Array<Hotkey<ARGS>>> = hotkeys
            .reduce(groupBy((hotkey: Hotkey<ARGS>) => hotkey.event), {});

        return Object.entries(groups)
            .map(([event, handlers]) => {
                const parentHandler = (e: KeyboardEvent) => {
                    handlers.forEach((handler) => {
                        if (handler.test(e, argsHolder.current)) {
                            e.preventDefault();
                            handler.run(e, argsHolder.current);
                        }
                    });
                }
                return {
                    add: () => window.addEventListener(event as any, parentHandler),
                    remove: () => window.removeEventListener(event as any, parentHandler)
                }
            });
    }, [hotkeys]);

    useEffect(() => {
        listeners.forEach((listener) => listener.add());
        return () => {
            listeners.forEach((listener) => listener.remove());
        }
    }, [listeners]);

    return argsUpdate;
}

function VaultUnlocked(props: { state: StateAlike<FileviewState> }) {
    const sourceFile = props.state.file;
    const passwordVerifier = props.state.passwordVerifier;
    const fs = useFilesystem(props.state.content);
    const hotkeyArgs = useMemo(() => ({ fs, passwordVerifier, sourceFile }), [fs, passwordVerifier, sourceFile]);
    const updateArgs = useHotkeys(hotkeys, hotkeyArgs);
    useEffect(() => {
        console.log('FS debugging', fs);
        updateArgs(hotkeyArgs);
    }, [fs, updateArgs, hotkeyArgs]);

    const setState = useSetRecoilState(state);
    const lock = async () => {
        const canLock = fs.pristine || await confirm('There are unsaved changes, are you sure? Changes will be lost.');
        if (canLock) {
            setState(lockingFileviewState(props.state))
        }
    };

    return (
        <article className={css.fileview}>
            <div className={css.logo}>
                <img src={`${process.env.PUBLIC_URL}/lock__open.svg`} alt="Vault unlocked"/>
                <span>Vault unlocked</span>
            </div>
            <header className={css.header}>
                <p>Showing files in {props.state.file}</p>
            </header>
            <aside className={css.sidebar}>
                <Filetree filesystem={fs}/>
            </aside>
            <div className={css.buttons}>
                <button className={css.lock_button} onClick={lock}>
                    <img src={`${process.env.PUBLIC_URL}/lock.svg`} alt="Lock vault"/>
                </button>
            </div>
            <main className={css.content}>
                <Fileviewer fs={fs}/>
            </main>
        </article>
    );
}

export default VaultUnlocked;
