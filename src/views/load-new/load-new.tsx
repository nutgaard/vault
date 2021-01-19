import React, {useRef} from 'react';
import state, {
    listviewState,
    loadnewCopyPasteState, loadnewLinkToFileState,
    LoadnewState,
    loadnewUploadFileState,
    StateAlike,
} from "../../recoil/state";
import Box from "../../components/box/box";
import Button from "../../components/button/button";
import css from './load-new.module.css';
import {useSetRecoilState} from "recoil";
import {useFocusOnFirstFocusable} from "../../hooks/use-focus-on-first-focusable";

interface Props {
    state: StateAlike<LoadnewState>;
}

function Separator(props: { text: string }) {
    return (
        <div className={css.separator}>
            {props.text}
        </div>
    );
}

function LoadNew(props: Props) {
    const container = useRef<HTMLElement>(null)
    useFocusOnFirstFocusable(container);

    const setState = useSetRecoilState(state);
    const backHandler = () => { setState(listviewState(props.state)) };
    let copyPasteHandler = () => { setState(loadnewCopyPasteState(props.state)) };
    let uploadHandler = () => { setState(loadnewUploadFileState(props.state)) };
    let linkToFileHandler = () => { setState(loadnewLinkToFileState(props.state)) };

    const header: React.ReactNode = "Load new file";
    const footer: React.ReactNode = (
        <>
            <Button onClick={backHandler}>Back</Button>
            <span />
        </>
    );

    return (
        <Box ref={container} contentClass={css.content} header={header} footer={footer}>
            <Button className={css.full_width} onClick={copyPasteHandler}>Copy/Paste content</Button>
            <Separator text="Or"/>
            <Button className={css.full_width} onClick={uploadHandler}>Upload file</Button>
            <Separator text="Or"/>
            <Button className={css.full_width} onClick={linkToFileHandler}>Link to file</Button>
        </Box>
    )
}

export default LoadNew;
