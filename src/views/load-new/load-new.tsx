import React, {ChangeEvent, DragEventHandler, EventHandler, SyntheticEvent, useState} from 'react';
import state, {listviewState, LoadnewState} from "../../recoil/state";
import Box from "../../components/box/box";
import Button from "../../components/button/button";
import * as DB from './../../database';
import css from './load-new.module.css';
import cls from "../../components/cls";
import {useSetRecoilState} from "recoil";
import CopyPasteContent from "./copy-paste-content";
import LinkToContent from "./link-to-content";
import UploadContent from "./upload-content";
import {EncodedEncryptedContent} from "../../encryption/encryption";

interface Props {
    state: LoadnewState;
}

function Separator(props: { text: string }) {
    return (
        <div className={css.separator}>
            {props.text}
        </div>
    );
}

interface FileContent {
    name: string;
    content: EncodedEncryptedContent;
}

export interface LoadNewContentSetterProps {
    setContent(content?: FileContent): void;
}

function LoadNew(props: Props) {
    const [content, setContent] = useState<FileContent | undefined>(undefined);

    const setState = useSetRecoilState(state);
    const backHandler = () => { setState(listviewState(props.state)) };
    const header: React.ReactNode = "Load new file";
    const footer: React.ReactNode = (
        <>
            <Button onClick={backHandler}>Back</Button>
            <Button disabled={content === undefined}>Load file</Button>
        </>
    );

    return (
        <Box contentClass={css.content} header={header} footer={footer}>
            <CopyPasteContent setContent={setContent} />
            <Separator text="Or"/>
            <UploadContent setContent={setContent} />
            <Separator text="Or"/>
            <LinkToContent setContent={setContent} />
        </Box>
    )
}

export default LoadNew;
