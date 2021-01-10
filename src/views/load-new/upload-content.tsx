import React, {
    ChangeEvent,
    DragEventHandler,
    EventHandler,
    MouseEvent,
    RefObject,
    SyntheticEvent,
    useState
} from "react";
import css from "./load-new.module.css";
import {useSetRecoilState} from "recoil";
import state, {listviewState} from "../../recoil/state";
import * as DB from "../../database";
import cls from "../../components/cls";
import {LoadNewContentSetterProps} from "./load-new";
import {useAsyncEffect} from "../../hooks/useAsyncEffect";

function combine<T extends EventHandler<any>>(...eventhandlers: T[]): T {
    const handler = (event: any) => {
        eventhandlers.forEach((handler) => handler(event));
    }
    return handler as T;
}

function stopEvent<S extends SyntheticEvent>(event: S) {
    event.preventDefault();
    event.stopPropagation();
}

function readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result as string)
        }
        reader.onerror = (event) => {
            reject(event);
        }

        reader.readAsText(file);
    })
}

function ContentViewer(props: { file?: File; setFile: (file?: File) => void; input: RefObject<HTMLInputElement>}) {
    if (props.file) {
        const removeHandler = (e: MouseEvent) => {
            e.preventDefault();
            if (props.input.current) {
                props.input.current.value = '';
            }
            props.setFile(undefined)
        };

        return (<>
            <span>{props.file.name}</span>
            <button onClick={removeHandler}>X</button>
        </>);
    } else {
        return (
            <>
                <strong>Choose a file</strong><span> or drag it here</span>.
            </>
        );
    }
}

function UploadContent(props: LoadNewContentSetterProps) {
    const inputRef = React.createRef<HTMLInputElement>();
    const [file, setFile] = useState<File | undefined>(undefined);
    const setState = useSetRecoilState(state);
    const [isHighlight, setHighlight] = useState(false);
    const highlight = combine(stopEvent, () => {
        setHighlight(true)
    });

    const unhighlight = combine(stopEvent, () => {
        setHighlight(false)
    });

    const drophandler = combine<DragEventHandler>(unhighlight, (event) => {
        const dataTransfer = event.dataTransfer;
        const file: File = dataTransfer.files.item(0)!!;
        setFile(file);
        // processFile(file);
    });

    const changehandler = (event: ChangeEvent<HTMLInputElement>) => {
        stopEvent(event);
        const file: File = event.target?.files?.item(0)!!;
        setFile(file);
        // processFile(file);
    };

    useAsyncEffect(async () => {
        if (file) {
            const base64Content = await readFileContent(file);
            const content = Buffer.from(base64Content, 'base64').toString();
        }
    }, [file]);

    const processFile = async (file: File) => {
        const base64Content = await readFileContent(file);
        const content = Buffer.from(base64Content, 'base64').toString();
        const json = JSON.parse(content);

        const name = file.name;
        const existingKeys = await DB.keys();
        const store = existingKeys.includes(name) ? window.confirm(`Override content of ${name}?`) : true;

        if (store) {
            await DB.set(name, json);
            const keys = await DB.keys();
            setState(listviewState({files: keys}));
        }
    };

    return (
        <>
            <h2 className={css.header}>Upload file</h2>
            <label
                className={cls(css.drag_container, isHighlight ? css.highlight : '', 'block-s')}
                onDragEnter={highlight}
                onDragOver={highlight}
                onDragLeave={unhighlight}
                onDrop={drophandler}
            >
                <ContentViewer file={file} setFile={setFile} input={inputRef} />
                <input type="file" name="files[]" ref={inputRef} onChange={changehandler}/>
            </label>
        </>
    );
}

export default UploadContent;
