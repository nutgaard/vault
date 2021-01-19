import React, {
    ChangeEvent,
    DragEventHandler,
    EventHandler,
    MouseEvent,
    RefObject,
    SyntheticEvent, useRef,
    useState
} from "react";
import css from "./load-new.module.css";
import {useSetRecoilState} from "recoil";
import state, {loadnewState, LoadnewState, StateAlike} from "../../recoil/state";
import cls from "../../components/cls";
import {useAsyncEffect} from "../../hooks/use-async-effect";
import Button from "../../components/button/button";
import Box from "../../components/box/box";
import {useFocusOnFirstFocusable} from "../../hooks/use-focus-on-first-focusable";
import {readBase64ToJson} from "../../encryption/encryption";
import {isRight} from "fp-ts/Either";
import ErrorMessage from "./error-message";
import {saveContent} from "./utils";

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

function ContentViewer(props: { file?: File; setFile: (file?: File) => void; input: RefObject<HTMLInputElement> }) {
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
            <Button onClick={removeHandler}>Remove</Button>
        </>);
    } else {
        return (
            <>
                <strong>Choose a file</strong><span> or drag it here</span>.
            </>
        );
    }
}

interface Props {
    state: StateAlike<LoadnewState>;
}

function UploadContent(props: Props) {
    const container = useRef<HTMLFormElement>(null)
    useFocusOnFirstFocusable(container);
    const setState = useSetRecoilState(state);
    const inputRef = React.createRef<HTMLInputElement>();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [isHighlight, setHighlight] = useState(false);

    const [error, setError] = useState<string | undefined>(undefined);
    const [touched, setTouched] = useState<boolean>(false);

    useAsyncEffect(async () => {
        if (file === undefined) {
            setError("File is required");
        } else {
            const content = await readFileContent(file);
            const validation = readBase64ToJson(content);
            setError(isRight(validation) ? undefined : "Invalid content");
        }
    }, [file, setError])

    const highlight = combine(stopEvent, () => {
        setHighlight(true)
    });

    const backHandler = () => { setState(loadnewState(props.state)) };
    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        if (file) {
            const content = await readFileContent(file)
            await saveContent(file.name, content, setState)
        }
    }
    const unhighlight = combine(stopEvent, () => {
        setHighlight(false)
    });

    const drophandler = combine<DragEventHandler>(unhighlight, (event) => {
        const dataTransfer = event.dataTransfer;
        const file: File = dataTransfer.files.item(0)!!;
        setTouched(true);
        setFile(file);
    });

    const changehandler = (event: ChangeEvent<HTMLInputElement>) => {
        stopEvent(event);
        const file: File = event.target?.files?.item(0)!!;
        setTouched(true);
        setFile(file);
    };

    const header: React.ReactNode = "Upload file";
    const footer: React.ReactNode = (
        <>
            <Button type="button" onClick={backHandler}>Back</Button>
            <Button disabled={error !== undefined}>Load content</Button>
        </>
    );

    return (
        <form ref={container} onSubmit={submitHandler}>
            <Box contentClass={css.content} header={header} footer={footer}>
                <label
                    className={cls(css.drag_container, isHighlight ? css.highlight : '', 'block-s')}
                    onDragEnter={highlight}
                    onDragOver={highlight}
                    onDragLeave={unhighlight}
                    onDrop={drophandler}
                    onBlur={() => setTouched(true)}
                >
                    <ContentViewer file={file} setFile={setFile} input={inputRef}/>
                    <input type="file" name="files[]" ref={inputRef} onChange={changehandler}/>
                    <ErrorMessage field={{ touched, error }} className={css.fileupload_errormessage} />
                </label>
            </Box>
        </form>
    );
}

export default UploadContent;
