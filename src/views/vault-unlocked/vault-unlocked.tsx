import React, {useEffect, useMemo} from "react";
import {useSetRecoilState} from "recoil";
import state, {FileviewState, lockingFileviewState, StateAlike} from "../../recoil/state";
import css from './vault-unlocked.module.css';
import Filetree from "../../components/filetree/filetree";
import {Filesystem, useFilesystem} from "../../hooks/use-filesystem";
import Fileviewer from "../../components/fileviewer/fileviewer";
import {confirm} from "../../components/user-popup-inputs/user-popup-inputs";

function useFsDebugger(fs: Filesystem) {
    useEffect(() => {
        console.log('FS debugging', fs);
    }, [fs]);
}

type Hotkey = {
    event: keyof WindowEventMap;
    test(e: KeyboardEvent): boolean;
    run(e: KeyboardEvent): void;
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

const hotkeys: Hotkey[] = [
    {
        event: 'keydown',
        test(e: KeyboardEvent) {
            return e.ctrlKey && e.key === 's';
        },
        run() {
            console.log('No saving this ...')
        }
    },
    {
        event: 'keydown',
        test(e: KeyboardEvent) {
            return e.ctrlKey && e.key === 'a';
        },
        run(e: KeyboardEvent) {
            console.log('No no selecting this ...')
        }
    }
]


function useHotkeys(hotkeys: Hotkey[]) {
    const listeners: Array<{ add(): void; remove(): void; }> = useMemo(() => {
        const groups = hotkeys
            .reduce(groupBy((hotkey: Hotkey) => hotkey.event), {});

        return Object.entries(groups)
            .map(([event, handlers]) => {
                const parentHandler = (e: KeyboardEvent) => {
                    handlers.forEach((handler) => {
                        if (handler.test(e)) {
                            e.preventDefault();
                            handler.run(e);
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
}

function VaultUnlocked(props: { state: StateAlike<FileviewState> }) {
    const fs = useFilesystem(props.state.content);
    useFsDebugger(fs);
    useHotkeys(hotkeys);

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
