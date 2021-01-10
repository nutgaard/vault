import React from "react";
import css from "./load-new.module.css";
import {LoadNewContentSetterProps} from "./load-new";

function CopyPasteContent(props: LoadNewContentSetterProps) {
    return (
        <>
            <h2 className={css.header}>Copy/Paste content</h2>
            <textarea className={css.textarea} rows={5}/>
        </>
    );
}

export default CopyPasteContent;
